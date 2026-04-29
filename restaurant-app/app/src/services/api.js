import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configuration de base de l'API
// ⚠️ IMPORTANT : L'IP locale change quand vous changez de WiFi !
// 
// Pour trouver votre IP actuelle :
//   Linux/Mac : hostname -I
//   Windows   : ipconfig (cherchez "IPv4 Address")
//
// Quand vous changez de WiFi, mettez à jour LOCAL_IP ci-dessous
// puis redémarrez Expo : npx expo start
const LOCAL_IP ='192.168.1.22'; // ← Mettez votre IP actuelle ici

const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://your-production-api.com/api';
  }
  
  // Détection de l'environnement
  const isExpoGo = Constants.executionEnvironment !== 'standalone';
  const isRealDevice = Constants.isDevice;
  
  console.log('🔍 Environment detection:', {
    Platform: Platform.OS,
    isDevice: isRealDevice,
    executionEnvironment: Constants.executionEnvironment,
    isExpoGo,
    appOwnership: Constants.appOwnership
  });
  
  // Pour Expo Go, TOUJOURS utiliser l'IP locale car localhost ne fonctionnera pas
  // même si isDevice est false dans certains cas
  if (isExpoGo) {
    const apiUrl = `http://${LOCAL_IP}:3001/api`;
    console.log(`🌐 API URL: Using Expo Go - forced to IP (${apiUrl})`);
    return apiUrl;
  }
  
  // Si vous êtes sur un émulateur Android (build standalone)
  if (Platform.OS === 'android' && !isRealDevice) {
    console.log('🌐 API URL: Using Android emulator (10.0.2.2)');
    return 'http://10.0.2.2:3001/api';
  }
  
  // Si vous êtes sur un émulateur iOS (build standalone)
  if (Platform.OS === 'ios' && !isRealDevice) {
    console.log('🌐 API URL: Using iOS simulator (localhost)');
    return 'http://localhost:3001/api';
  }
  
  // Pour les builds standalone sur appareil réel, utiliser l'IP locale
  const apiUrl = `http://${LOCAL_IP}:3001/api`;
  console.log(`🌐 API URL: Using standalone build on device (${apiUrl})`);
  
  if (LOCAL_IP === '192.168.1.XXX') {
    console.warn('⚠️ Veuillez configurer LOCAL_IP dans src/services/api.js avec votre adresse IP locale');
    console.warn('Pour trouver votre IP: ifconfig (Linux/Mac) ou ipconfig (Windows)');
  }
  
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();
const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Augmenté à 30 secondes pour les requêtes Firebase
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fonction pour transformer les URL des images
const transformImageUrls = (data) => {
  if (Array.isArray(data)) {
    data.forEach(transformImageUrls);
  } else if (data && typeof data === 'object') {
    for (const key in data) {
      if (key === 'image' && typeof data[key] === 'string' && data[key].startsWith('/')) {
        data[key] = `${SERVER_BASE_URL}${data[key]}`;
      } else {
        transformImageUrls(data[key]);
      }
    }
  }
  return data;
};

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = transformImageUrls(response.data);
    }
    return response;
  },
  async (error) => {
    // Log des erreurs pour le débogage
    if (error.request && !error.response) {
      console.error('❌ Erreur réseau - Impossible de se connecter au serveur:', error.message);
      console.error('URL tentée:', error.config?.url);
      console.error('Base URL:', error.config?.baseURL);
      console.error('Vérifiez que:');
      console.error('  1. Le serveur backend est démarré (port 3001)');
      console.error('  2. Votre téléphone est sur le même réseau WiFi');
      console.error('  3. L\'IP configurée est correcte:', LOCAL_IP);
    } else if (error.response) {
      console.error('❌ Erreur API:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erreur:', error.message);
    }
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide, supprimer le token stocké
      try {
        await SecureStore.deleteItemAsync('authToken');
      } catch (e) {
        console.error('Error removing auth token:', e);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
