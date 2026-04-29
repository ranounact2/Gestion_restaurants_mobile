import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

// Thunks asynchrones
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Sauvegarder le token de manière sécurisée
      await SecureStore.setItemAsync('authToken', token);
      
      return { token, user };
    } catch (error) {
      let errorMessage = 'Erreur de connexion';
      
      if (!error.response) {
        // Erreur réseau
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez:\n\n• Que le serveur backend est démarré\n• Que vous êtes sur le même réseau WiFi\n• Votre connexion internet';
      } else if (error.response.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.response.status === 404) {
        errorMessage = 'Serveur introuvable. Vérifiez la configuration.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      console.error('Login error:', error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
      
      // Sauvegarder le token de manière sécurisée
      await SecureStore.setItemAsync('authToken', token);
      
      return { token, user };
    } catch (error) {
      let errorMessage = 'Erreur d\'inscription';
      
      if (!error.response) {
        // Erreur réseau
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez:\n\n• Que le serveur backend est démarré\n• Que vous êtes sur le même réseau WiFi\n• Votre connexion internet';
      } else if (error.response.status === 409) {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Données invalides';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      console.error('Register error:', error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Vérifier le token avec l'API
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { token, user: response.data };
    } catch (error) {
      // Supprimer le token invalide
      await SecureStore.deleteItemAsync('authToken');
      return rejectWithValue('Invalid token');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await SecureStore.deleteItemAsync('authToken');
    return null;
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/me', userData);
      return response.data;
    } catch (error) {
      let errorMessage = 'Erreur de mise à jour';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (!error.response) {
        errorMessage = 'Impossible de se connecter au serveur.';
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'auth/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'auth/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${userId}`, { role });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    allUsers: [],
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch all users
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
      })

      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.allUsers.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.allUsers[index] = action.payload;
        }
      })

      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.allUsers = state.allUsers.filter(u => u.id !== action.payload);
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
