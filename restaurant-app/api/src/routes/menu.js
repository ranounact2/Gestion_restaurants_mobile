const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { db, COLLECTIONS } = require('../config/firebase');

const router = express.Router();

/**
 * @swagger
 * /api/menu/{restaurantId}:
 *   get:
 *     summary: Get menu items for a restaurant
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu items
 */
router.get('/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Firestore requires composite index for multiple where clauses
    // We'll filter in memory for isAvailable
    const menuItemsSnapshot = await db.collection(COLLECTIONS.MENU_ITEMS)
      .where('restaurantId', '==', restaurantId)
      .get();
    
    const menuItems = menuItemsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.isAvailable !== false)
      .sort((a, b) => {
        // Sort by category then name
        if (a.category !== b.category) {
          return (a.category || 'Other').localeCompare(b.category || 'Other');
        }
        return (a.name || '').localeCompare(b.name || '');
      });

    // Get restaurant name
    const restaurantDoc = await db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).get();
    const restaurantName = restaurantDoc.exists ? restaurantDoc.data().name : '';

    // Add restaurant info to each item
    menuItems.forEach(item => {
      item.restaurant = { name: restaurantName };
    });

    // Group by category
    const groupedMenu = menuItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    res.json(groupedMenu);
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { restaurantId, name, description, price, category } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : req.body.image;
    
    const menuItemRef = db.collection(COLLECTIONS.MENU_ITEMS).doc();
    const menuItemData = {
      id: menuItemRef.id,
      restaurantId,
      name,
      description: description || null,
      price: parseFloat(price),
      image: image || null,
      category: category || null,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await menuItemRef.set(menuItemData);

    res.status(201).json(menuItemData);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, isAvailable } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : req.body.image;
    
    const menuItemRef = db.collection(COLLECTIONS.MENU_ITEMS).doc(id);
    const menuItemDoc = await menuItemRef.get();
    
    if (!menuItemDoc.exists) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true' || isAvailable === true;

    await menuItemRef.update(updateData);

    const updatedDoc = await menuItemRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItemRef = db.collection(COLLECTIONS.MENU_ITEMS).doc(id);
    await menuItemRef.update({
      isAvailable: false,
      updatedAt: new Date()
    });

    res.json({ message: 'Menu item deactivated successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = { menuRoutes: router };
