import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks asynchrones
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/my');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    allOrders: [], // Pour admin
    currentOrder: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch all orders (admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allOrders = action.payload;
        state.error = null;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        
        // Mettre à jour dans allOrders
        const allOrderIndex = state.allOrders.findIndex(order => order.id === updatedOrder.id);
        if (allOrderIndex !== -1) {
          state.allOrders[allOrderIndex] = updatedOrder;
        }
        
        // Mettre à jour dans orders si c'est la commande de l'utilisateur
        const orderIndex = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        // Mettre à jour currentOrder si c'est la commande actuelle
        if (state.currentOrder && state.currentOrder.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      });
  },
});

export const {
  setCurrentOrder,
  clearCurrentOrder,
  clearError,
} = orderSlice.actions;

export default orderSlice.reducer;
