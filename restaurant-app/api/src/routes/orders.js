const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { db, COLLECTIONS } = require('../config/firebase');

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               restaurantId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               deliveryAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               couponCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, couponCode } = req.body;
    const userId = req.user.userId;

    // Validate items and calculate total
    let subtotal = 0;
    const orderItems = [];

    // Use batch for atomic operations
    const batch = db.batch();

    for (const item of items) {
      const menuItemDoc = await db.collection(COLLECTIONS.MENU_ITEMS).doc(item.menuItemId).get();
      
      if (!menuItemDoc.exists) {
        return res.status(400).json({ message: `Menu item ${item.menuItemId} not found` });
      }

      const menuItem = { id: menuItemDoc.id, ...menuItemDoc.data() };

      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `Menu item ${item.menuItemId} is not available` });
      }

      if (menuItem.restaurantId !== restaurantId) {
        return res.status(400).json({ message: 'All items must be from the same restaurant' });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price
      });
    }

    // Get restaurant delivery fee
    const restaurantDoc = await db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).get();
    
    if (!restaurantDoc.exists) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurant = { id: restaurantDoc.id, ...restaurantDoc.data() };
    const deliveryFee = restaurant.deliveryFee || 0;
    let discount = 0;

    // Apply coupon if provided
    if (couponCode) {
      if (couponCode === 'WELCOME10') {
        discount = subtotal * 0.1;
      } else if (couponCode === 'SAVE20') {
        discount = subtotal * 0.2;
      }
    }

    const total = subtotal + deliveryFee - discount;

    // Create order
    const orderRef = db.collection(COLLECTIONS.ORDERS).doc();
    const orderData = {
      id: orderRef.id,
      userId,
      restaurantId,
      status: 'PENDING',
      subtotal,
      deliveryFee,
      discount,
      total,
      deliveryAddress: deliveryAddress || null,
      paymentMethod: paymentMethod || null,
      couponCode: couponCode || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    batch.set(orderRef, orderData);

    // Create order items
    for (const item of orderItems) {
      const orderItemRef = db.collection(COLLECTIONS.ORDER_ITEMS).doc();
      batch.set(orderItemRef, {
        id: orderItemRef.id,
        orderId: orderRef.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      });
    }

    await batch.commit();

    // Get order with relations
    const orderDoc = await orderRef.get();
    const order = { id: orderDoc.id, ...orderDoc.data() };

    // Get restaurant info
    order.restaurant = {
      id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image
    };

    // Get order items with menu item info
    const orderItemsSnapshot = await db.collection(COLLECTIONS.ORDER_ITEMS)
      .where('orderId', '==', orderRef.id)
      .get();
    
    order.orderItems = [];
    for (const orderItemDoc of orderItemsSnapshot.docs) {
      const orderItem = { id: orderItemDoc.id, ...orderItemDoc.data() };
      
      const menuItemDoc = await db.collection(COLLECTIONS.MENU_ITEMS).doc(orderItem.menuItemId).get();
      if (menuItemDoc.exists) {
        orderItem.menuItem = {
          id: menuItemDoc.id,
          name: menuItemDoc.data().name,
          image: menuItemDoc.data().image
        };
      }
      
      order.orderItems.push(orderItem);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's orders
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const ordersSnapshot = await db.collection(COLLECTIONS.ORDERS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = [];
    for (const orderDoc of ordersSnapshot.docs) {
      const order = { id: orderDoc.id, ...orderDoc.data() };
      
      // Get restaurant info
      const restaurantDoc = await db.collection(COLLECTIONS.RESTAURANTS).doc(order.restaurantId).get();
      if (restaurantDoc.exists) {
        order.restaurant = {
          name: restaurantDoc.data().name,
          image: restaurantDoc.data().image
        };
      }
      
      // Get order items
      const orderItemsSnapshot = await db.collection(COLLECTIONS.ORDER_ITEMS)
        .where('orderId', '==', orderDoc.id)
        .get();
      
      order.orderItems = [];
      for (const orderItemDoc of orderItemsSnapshot.docs) {
        const orderItem = { id: orderItemDoc.id, ...orderItemDoc.data() };
        
        const menuItemDoc = await db.collection(COLLECTIONS.MENU_ITEMS).doc(orderItem.menuItemId).get();
        if (menuItemDoc.exists) {
          orderItem.menuItem = {
            name: menuItemDoc.data().name,
            image: menuItemDoc.data().image
          };
        }
        
        order.orderItems.push(orderItem);
      }
      
      orders.push(order);
    }

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderRef = db.collection(COLLECTIONS.ORDERS).doc(id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await orderRef.update({
      status,
      updatedAt: new Date()
    });

    const updatedOrderDoc = await orderRef.get();
    const order = { id: updatedOrderDoc.id, ...updatedOrderDoc.data() };

    // Get restaurant info
    const restaurantDoc = await db.collection(COLLECTIONS.RESTAURANTS).doc(order.restaurantId).get();
    if (restaurantDoc.exists) {
      order.restaurant = { id: restaurantDoc.id, ...restaurantDoc.data() };
    }

    // Get user info
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(order.userId).get();
    if (userDoc.exists) {
      order.user = {
        name: userDoc.data().name,
        email: userDoc.data().email
      };
    }

    console.log(`Order ${id} status updated to ${status} for user ${order.user?.email}`);

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin route to get all orders
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const ordersSnapshot = await db.collection(COLLECTIONS.ORDERS)
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = [];
    for (const orderDoc of ordersSnapshot.docs) {
      const order = { id: orderDoc.id, ...orderDoc.data() };
      
      // Get user info
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(order.userId).get();
      if (userDoc.exists) {
        order.user = {
          name: userDoc.data().name,
          email: userDoc.data().email
        };
      }
      
      // Get restaurant info
      const restaurantDoc = await db.collection(COLLECTIONS.RESTAURANTS).doc(order.restaurantId).get();
      if (restaurantDoc.exists) {
        order.restaurant = {
          name: restaurantDoc.data().name
        };
      }
      
      // Get order items
      const orderItemsSnapshot = await db.collection(COLLECTIONS.ORDER_ITEMS)
        .where('orderId', '==', orderDoc.id)
        .get();
      
      order.orderItems = [];
      for (const orderItemDoc of orderItemsSnapshot.docs) {
        const orderItem = { id: orderItemDoc.id, ...orderItemDoc.data() };
        
        const menuItemDoc = await db.collection(COLLECTIONS.MENU_ITEMS).doc(orderItem.menuItemId).get();
        if (menuItemDoc.exists) {
          orderItem.menuItem = {
            name: menuItemDoc.data().name
          };
        }
        
        order.orderItems.push(orderItem);
      }
      
      orders.push(order);
    }

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = { orderRoutes: router };
