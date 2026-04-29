const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { db, COLLECTIONS } = require('../config/firebase');

const router = express.Router();

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: List of restaurants
 */
router.get('/', async (req, res) => {
  try {
    const restaurantsRef = db.collection(COLLECTIONS.RESTAURANTS);
    
    let restaurantsSnapshot;
    try {
      restaurantsSnapshot = await restaurantsRef
        .where('isActive', '==', true)
        .orderBy('rating', 'desc')
        .get();
    } catch (indexError) {
      if (indexError.code === 9 || indexError.details?.includes('index')) {
        console.error('❌ Index manquant pour restaurants. Créez l\'index avec ce lien :');
        console.error(indexError.details || 'L\'index isActive + rating est requis');
        return res.status(503).json({ 
          message: 'Index Firestore en cours de création. Réessayez dans quelques minutes.',
          error: 'Index required'
        });
      }
      throw indexError;
    }

    const restaurants = [];
    for (const doc of restaurantsSnapshot.docs) {
      const restaurant = { id: doc.id, ...doc.data() };
      
      // Get review count
      const reviewsSnapshot = await db.collection(COLLECTIONS.REVIEWS)
        .where('restaurantId', '==', doc.id)
        .get();
      
      restaurant._count = { reviews: reviewsSnapshot.size };
      restaurants.push(restaurant);
    }

    res.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant details
 *       404:
 *         description: Restaurant not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurantDoc = await db.collection(COLLECTIONS.RESTAURANTS).doc(id).get();
    
    if (!restaurantDoc.exists) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurant = { id: restaurantDoc.id, ...restaurantDoc.data() };

    // Get menu items
    const menuItemsSnapshot = await db.collection(COLLECTIONS.MENU_ITEMS)
      .where('restaurantId', '==', id)
      .where('isAvailable', '==', true)
      .orderBy('category')
      .get();
    
    restaurant.menuItems = menuItemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get reviews
    const reviewsSnapshot = await db.collection(COLLECTIONS.REVIEWS)
      .where('restaurantId', '==', id)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const reviews = [];
    for (const reviewDoc of reviewsSnapshot.docs) {
      const review = { id: reviewDoc.id, ...reviewDoc.data() };
      
      // Get user info
      if (review.userId) {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(review.userId).get();
        if (userDoc.exists) {
          review.user = {
            name: userDoc.data().name
          };
        }
      }
      
      reviews.push(review);
    }
    
    restaurant.reviews = reviews;

    res.json(restaurant);
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, deliveryFee, eta, latitude, longitude } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : req.body.image;
    
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc();
    const restaurantData = {
      id: restaurantRef.id,
      name,
      description,
      image: image || null,
      rating: 0,
      deliveryFee: parseFloat(deliveryFee) || 0,
      eta: parseInt(eta) || 0,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await restaurantRef.set(restaurantData);

    res.status(201).json(restaurantData);
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, deliveryFee, eta, latitude, longitude, isActive } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : req.body.image;
    
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(id);
    const restaurantDoc = await restaurantRef.get();
    
    if (!restaurantDoc.exists) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (deliveryFee !== undefined) updateData.deliveryFee = parseFloat(deliveryFee);
    if (eta !== undefined) updateData.eta = parseInt(eta) || 0;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    await restaurantRef.update(updateData);

    const updatedDoc = await restaurantRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc(id);
    await restaurantRef.update({ 
      isActive: false,
      updatedAt: new Date()
    });

    res.json({ message: 'Restaurant deactivated successfully' });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = { restaurantRoutes: router };
