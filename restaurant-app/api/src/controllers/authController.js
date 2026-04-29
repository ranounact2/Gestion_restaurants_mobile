const { db, COLLECTIONS } = require('../config/firebase');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const usersRef = db.collection(COLLECTIONS.USERS);
    const existingUserQuery = await usersRef.where('email', '==', email).limit(1).get();

    if (!existingUserQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    const passwordHash = await hashPassword(password);

    // Create user
    const userRef = usersRef.doc();
    const userData = {
      id: userRef.id,
      name,
      email,
      passwordHash,
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await userRef.set(userData);

    const token = generateToken({
      userId: userRef.id,
      email: userData.email,
      role: userData.role
    });

    const { passwordHash: _, ...userWithoutPassword } = userData;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const usersRef = db.collection(COLLECTIONS.USERS);
    const userQuery = await usersRef.where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const userDoc = userQuery.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(req.user.userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = { id: userDoc.id, ...userDoc.data() };
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = { register, login, getMe };
