import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks asynchrones
export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/restaurants');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants');
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurants/fetchRestaurantById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant');
    }
  }
);

export const fetchMenuByRestaurant = createAsyncThunk(
  'restaurants/fetchMenuByRestaurant',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/menu/${restaurantId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
    }
  }
);

export const createRestaurant = createAsyncThunk(
  'restaurants/createRestaurant',
  async (restaurantData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in restaurantData) {
        if (key === 'image' && restaurantData.image) {
          formData.append('image', {
            uri: restaurantData.image,
            type: 'image/jpeg',
            name: 'image.jpg',
          });
        } else {
          formData.append(key, restaurantData[key]);
        }
      }
      const response = await api.post('/restaurants', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create restaurant');
    }
  }
);

export const updateRestaurant = createAsyncThunk(
  'restaurants/updateRestaurant',
  async (restaurantData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in restaurantData) {
        if (key === 'image' && restaurantData.image && !restaurantData.image.startsWith('http')) {
          formData.append('image', {
            uri: restaurantData.image,
            type: 'image/jpeg',
            name: 'image.jpg',
          });
        } else if (key !== 'image') {
          formData.append(key, restaurantData[key]);
        }
      }
      const response = await api.put(`/restaurants/${restaurantData.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update restaurant');
    }
  }
);

export const deleteRestaurant = createAsyncThunk(
  'restaurants/deleteRestaurant',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/restaurants/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete restaurant');
    }
  }
);

export const createMenuItem = createAsyncThunk(
  'restaurants/createMenuItem',
  async (menuItemData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in menuItemData) {
        if (key === 'image' && menuItemData.image) {
          formData.append('image', {
            uri: menuItemData.image,
            type: 'image/jpeg',
            name: 'image.jpg',
          });
        } else {
          formData.append(key, menuItemData[key]);
        }
      }
      const response = await api.post('/menu', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create menu item');
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  'restaurants/updateMenuItem',
  async (menuItemData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in menuItemData) {
        if (key === 'image' && menuItemData.image && !menuItemData.image.startsWith('http')) {
          formData.append('image', {
            uri: menuItemData.image,
            type: 'image/jpeg',
            name: 'image.jpg',
          });
        } else if (key !== 'image') {
          formData.append(key, menuItemData[key]);
        }
      }
      const response = await api.put(`/menu/${menuItemData.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update menu item');
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  'restaurants/deleteMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/menu/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete menu item');
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState: {
    restaurants: [],
    currentRestaurant: null,
    currentMenu: {},
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedCategory: null,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearCurrentRestaurant: (state) => {
      state.currentRestaurant = null;
      state.currentMenu = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.restaurants = action.payload;
        state.error = null;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch restaurant by ID
      .addCase(fetchRestaurantById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRestaurant = action.payload;
        state.error = null;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch menu
      .addCase(fetchMenuByRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuByRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMenu = action.payload;
        state.error = null;
      })
      .addCase(fetchMenuByRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create restaurant
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.restaurants.push(action.payload);
      })

      // Update restaurant
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        const index = state.restaurants.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.restaurants[index] = action.payload;
        }
      })

      // Delete restaurant
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.restaurants = state.restaurants.filter(r => r.id !== action.payload);
      })

      // Create menu item
      .addCase(createMenuItem.fulfilled, (state, action) => {
        if (state.currentMenu[action.payload.category]) {
          state.currentMenu[action.payload.category].push(action.payload);
        } else {
          state.currentMenu[action.payload.category] = [action.payload];
        }
      })

      // Update menu item
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const { category, id } = action.payload;
        const index = state.currentMenu[category].findIndex(item => item.id === id);
        if (index !== -1) {
          state.currentMenu[category][index] = action.payload;
        }
      })

      // Delete menu item
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        const menuItemId = action.payload;
        for (const category in state.currentMenu) {
          state.currentMenu[category] = state.currentMenu[category].filter(item => item.id !== menuItemId);
        }
      });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  clearCurrentRestaurant,
  clearError,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;
