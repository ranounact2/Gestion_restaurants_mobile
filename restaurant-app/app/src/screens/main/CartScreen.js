import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { updateQuantity, removeFromCart, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const CartScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { items, restaurant, subtotal, deliveryFee, discount, total, couponCode } = useSelector((state) => state.cart);

  const [couponInput, setCouponInput] = useState('');

  const handleQuantityChange = (menuItemId, newQuantity) => {
    if (newQuantity === 0) {
      Alert.alert(
        'Supprimer l\'article',
        'Voulez-vous supprimer cet article du panier ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', onPress: () => dispatch(removeFromCart(menuItemId)) },
        ]
      );
    } else {
      dispatch(updateQuantity({ menuItemId, quantity: newQuantity }));
    }
  };

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      dispatch(applyCoupon(couponInput.trim().toUpperCase()));
      setCouponInput('');
      Alert.alert('Coupon appliqué', 'Votre coupon a été appliqué avec succès !');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    Alert.alert('Coupon supprimé', 'Le coupon a été retiré de votre commande.');
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }) => (
    <Card style={styles.cartItem}>
      <View style={styles.itemContent}>
        <Image source={{ uri: item.menuItem.image }} style={styles.itemImage} />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.menuItem.name}</Text>
          <Text style={styles.itemPrice}>{item.menuItem.price.toFixed(2)}€</Text>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          {(item.menuItem.price * item.quantity).toFixed(2)}€
        </Text>
      </View>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    restaurantInfo: {
      marginBottom: theme.spacing.lg,
    },
    restaurantName: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    restaurantMeta: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    cartItem: {
      marginBottom: theme.spacing.md,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.backgroundLight,
      marginRight: theme.spacing.md,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    itemPrice: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.backgroundLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quantity: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      marginHorizontal: theme.spacing.md,
      minWidth: 30,
      textAlign: 'center',
    },
    itemTotal: {
      alignItems: 'flex-end',
    },
    itemTotalText: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary,
    },
    couponSection: {
      marginVertical: theme.spacing.lg,
    },
    couponContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: theme.spacing.sm,
    },
    couponInput: {
      flex: 1,
      marginRight: theme.spacing.md,
      marginBottom: 0,
    },
    appliedCoupon: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.success + '20',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.success,
    },
    appliedCouponText: {
      color: theme.colors.success,
      fontWeight: theme.typography.weights.medium,
    },
    removeCouponButton: {
      padding: theme.spacing.xs,
    },
    summaryCard: {
      marginTop: theme.spacing.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
    },
    summaryValue: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
    },
    discountValue: {
      color: theme.colors.success,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    totalLabel: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary,
    },
    checkoutButton: {
      marginTop: theme.spacing.lg,
    },
    emptyCart: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyCartText: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.textLight,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
  });

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCart}>
          <Ionicons name="basket-outline" size={80} color={theme.colors.textLight} />
          <Text style={styles.emptyCartText}>Votre panier est vide</Text>
          <Button
            title="Découvrir les restaurants"
            onPress={() => navigation.navigate('HomeMain')}
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.menuItem.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={() => (
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant?.name}</Text>
            <Text style={styles.restaurantMeta}>
              Livraison {restaurant?.deliveryFee}€ • Temps estimé {restaurant?.eta || 30} min
            </Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View>
            <View style={styles.couponSection}>
              {!couponCode ? (
                <View style={styles.couponContainer}>
                  <Input
                    style={styles.couponInput}
                    placeholder="Code promo"
                    value={couponInput}
                    onChangeText={setCouponInput}
                    autoCapitalize="characters"
                  />
                  <Button
                    title="Appliquer"
                    size="small"
                    onPress={handleApplyCoupon}
                    disabled={!couponInput.trim()}
                  />
                </View>
              ) : (
                <View style={styles.appliedCoupon}>
                  <Text style={styles.appliedCouponText}>
                    Coupon {couponCode} appliqué
                  </Text>
                  <TouchableOpacity
                    style={styles.removeCouponButton}
                    onPress={handleRemoveCoupon}
                  >
                    <Ionicons name="close" size={20} color={theme.colors.success} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sous-total</Text>
                <Text style={styles.summaryValue}>{subtotal.toFixed(2)}€</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais de livraison</Text>
                <Text style={styles.summaryValue}>{deliveryFee.toFixed(2)}€</Text>
              </View>
              
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Remise</Text>
                  <Text style={[styles.summaryValue, styles.discountValue]}>
                    -{discount.toFixed(2)}€
                  </Text>
                </View>
              )}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{total.toFixed(2)}€</Text>
              </View>
            </Card>

            <Button
              title="Passer la commande"
              onPress={handleCheckout}
              style={styles.checkoutButton}
            />
          </View>
        )}
      />
    </View>
  );
};

export default CartScreen;
