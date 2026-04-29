import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    restaurant: null,
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
    couponCode: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { menuItem, quantity = 1, restaurant } = action.payload;
      
      // Si le panier est vide ou contient des items d'un autre restaurant, le vider
      if (state.restaurant && state.restaurant.id !== restaurant.id) {
        state.items = [];
        state.restaurant = restaurant;
      } else if (!state.restaurant) {
        state.restaurant = restaurant;
      }
      
      // Chercher si l'item existe déjà
      const existingItem = state.items.find(item => item.menuItem.id === menuItem.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          menuItem,
          quantity,
        });
      }
      
      // Recalculer les totaux
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    removeFromCart: (state, action) => {
      const menuItemId = action.payload;
      state.items = state.items.filter(item => item.menuItem.id !== menuItemId);
      
      // Si le panier est vide, réinitialiser le restaurant
      if (state.items.length === 0) {
        state.restaurant = null;
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    updateQuantity: (state, action) => {
      const { menuItemId, quantity } = action.payload;
      const item = state.items.find(item => item.menuItem.id === menuItemId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.menuItem.id !== menuItemId);
        } else {
          item.quantity = quantity;
        }
      }
      
      // Si le panier est vide, réinitialiser le restaurant
      if (state.items.length === 0) {
        state.restaurant = null;
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    applyCoupon: (state, action) => {
      const couponCode = action.payload;
      state.couponCode = couponCode;
      
      // Logique simple de coupon
      if (couponCode === 'WELCOME10') {
        state.discount = state.subtotal * 0.1;
      } else if (couponCode === 'SAVE20') {
        state.discount = state.subtotal * 0.2;
      } else {
        state.discount = 0;
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discount = 0;
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.discount = 0;
      state.total = 0;
      state.couponCode = null;
    },
    
    calculateTotals: (state) => {
      // Calculer le sous-total
      state.subtotal = state.items.reduce((sum, item) => {
        return sum + (item.menuItem.price * item.quantity);
      }, 0);
      
      // Frais de livraison
      state.deliveryFee = state.restaurant ? state.restaurant.deliveryFee : 0;
      
      // Recalculer la remise si un coupon est appliqué
      if (state.couponCode) {
        if (state.couponCode === 'WELCOME10') {
          state.discount = state.subtotal * 0.1;
        } else if (state.couponCode === 'SAVE20') {
          state.discount = state.subtotal * 0.2;
        }
      }
      
      // Total final
      state.total = state.subtotal + state.deliveryFee - state.discount;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
