const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { db, COLLECTIONS } = require('../config/firebase');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usersSnapshot = await db.collection(COLLECTIONS.USERS)
      .orderBy('createdAt', 'desc')
      .get();
    
    const users = [];
    for (const userDoc of usersSnapshot.docs) {
      const user = { id: userDoc.id, ...userDoc.data() };
      
      // Get order count
      const ordersSnapshot = await db.collection(COLLECTIONS.ORDERS)
        .where('userId', '==', userDoc.id)
        .get();
      
      user._count = { orders: ordersSnapshot.size };
      
      // Remove password hash
      const { passwordHash, ...userWithoutPassword } = user;
      users.push(userWithoutPassword);
    }

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user addresses
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Firestore requires composite index for multiple orderBy
    // We'll fetch with single orderBy and sort in memory
    const addressesSnapshot = await db.collection(COLLECTIONS.ADDRESSES)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    let addresses = addressesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      };
    });
    
    // Sort by isDefault (desc) then createdAt (desc)
    addresses.sort((a, b) => {
      if (a.isDefault !== b.isDefault) {
        return (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add user address
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const { label, line1, line2, city, postalCode, latitude, longitude, isDefault } = req.body;
    const userId = req.user.userId;

    // If this is set as default, unset other defaults
    if (isDefault) {
      const existingAddressesSnapshot = await db.collection(COLLECTIONS.ADDRESSES)
        .where('userId', '==', userId)
        .where('isDefault', '==', true)
        .get();
      
      const batch = db.batch();
      existingAddressesSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isDefault: false });
      });
      await batch.commit();
    }

    const addressRef = db.collection(COLLECTIONS.ADDRESSES).doc();
    const addressData = {
      id: addressRef.id,
      userId,
      label,
      line1,
      line2: line2 || null,
      city,
      postalCode: postalCode || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await addressRef.set(addressData);

    res.status(201).json(addressData);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user address
router.put('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { label, line1, line2, city, postalCode, latitude, longitude, isDefault } = req.body;
    const userId = req.user.userId;

    // Check if address belongs to user
    const addressRef = db.collection(COLLECTIONS.ADDRESSES).doc(id);
    const addressDoc = await addressRef.get();
    
    if (!addressDoc.exists) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const address = addressDoc.data();
    if (address.userId !== userId) {
      return res.status(403).json({ message: 'Address does not belong to user' });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      const existingAddressesSnapshot = await db.collection(COLLECTIONS.ADDRESSES)
        .where('userId', '==', userId)
        .where('isDefault', '==', true)
        .get();
      
      const batch = db.batch();
      existingAddressesSnapshot.docs.forEach(doc => {
        if (doc.id !== id) {
          batch.update(doc.ref, { isDefault: false });
        }
      });
      await batch.commit();
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (label !== undefined) updateData.label = label;
    if (line1 !== undefined) updateData.line1 = line1;
    if (line2 !== undefined) updateData.line2 = line2;
    if (city !== undefined) updateData.city = city;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    await addressRef.update(updateData);

    const updatedDoc = await addressRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user address
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if address belongs to user
    const addressRef = db.collection(COLLECTIONS.ADDRESSES).doc(id);
    const addressDoc = await addressRef.get();
    
    if (!addressDoc.exists) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const address = addressDoc.data();
    if (address.userId !== userId) {
      return res.status(403).json({ message: 'Address does not belong to user' });
    }

    await addressRef.delete();

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update own profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;

    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const updateData = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    await userRef.update(updateData);

    const updatedDoc = await userRef.get();
    const user = { id: updatedDoc.id, ...updatedDoc.data() };
    const { passwordHash, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user role (Admin only)
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const userRef = db.collection(COLLECTIONS.USERS).doc(id);
    await userRef.update({
      role,
      updatedAt: new Date()
    });

    const updatedDoc = await userRef.get();
    const user = { id: updatedDoc.id, ...updatedDoc.data() };
    const { passwordHash, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection(COLLECTIONS.USERS).doc(id).delete();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = { userRoutes: router };
