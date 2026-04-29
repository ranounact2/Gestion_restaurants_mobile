const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db, COLLECTIONS } = require('../config/firebase');

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;
    const userId = req.user.userId;

    // Check if user already reviewed this restaurant
    const reviewsRef = db.collection(COLLECTIONS.REVIEWS);
    const existingReviewQuery = await reviewsRef
      .where('userId', '==', userId)
      .where('restaurantId', '==', restaurantId)
      .limit(1)
      .get();

    let reviewRef;
    let reviewData;

    if (!existingReviewQuery.empty) {
      // Update existing review
      reviewRef = reviewsRef.doc(existingReviewQuery.docs[0].id);
      reviewData = {
        rating: parseInt(rating),
        comment: comment || null,
        updatedAt: new Date()
      };
      await reviewRef.update(reviewData);
    } else {
      // Create new review
      reviewRef = reviewsRef.doc();
      reviewData = {
        id: reviewRef.id,
        userId,
        restaurantId,
        rating: parseInt(rating),
        comment: comment || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await reviewRef.set(reviewData);
    }

    // Update restaurant rating
    await updateRestaurantRating(restaurantId);

    // Get user info for response
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const user = userDoc.exists ? { name: userDoc.data().name } : null;

    const review = await reviewRef.get();
    const reviewResponse = { id: review.id, ...review.data(), user };

    if (existingReviewQuery.empty) {
      res.status(201).json(reviewResponse);
    } else {
      res.json(reviewResponse);
    }
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to update restaurant rating
async function updateRestaurantRating(restaurantId) {
  try {
    const reviewsSnapshot = await db.collection(COLLECTIONS.REVIEWS)
      .where('restaurantId', '==', restaurantId)
      .get();

    if (reviewsSnapshot.empty) {
      return;
    }

    let totalRating = 0;
    reviewsSnapshot.docs.forEach(doc => {
      totalRating += doc.data().rating || 0;
    });

    const averageRating = totalRating / reviewsSnapshot.size;
    const roundedRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal

    await db.collection(COLLECTIONS.RESTAURANTS).doc(restaurantId).update({
      rating: roundedRating,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating restaurant rating:', error);
  }
}

module.exports = { reviewRoutes: router };
