import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const CheckoutScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { items, restaurant, total, deliveryFee, subtotal, discount, couponCode } = useSelector((state) => state.cart);
  const { isLoading } = useSelector((state) => state.orders);

  const [deliveryAddress, setDeliveryAddress] = useState('123 Main Street, Paris 75001');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const paymentMethods = [
    { id: 'card', name: 'Carte bancaire', icon: 'card' },
    { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
    { id: 'cash', name: 'Espèces à la livraison', icon: 'cash' },
  ];

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse de livraison');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
      Alert.alert('Erreur', 'Veuillez remplir toutes les informations de carte');
      return;
    }

    const orderData = {
      restaurantId: restaurant.id,
      items: items.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
      })),
      deliveryAddress,
      paymentMethod,
      couponCode,
    };

    try {
      const result = await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      
      Alert.alert(
        'Commande confirmée !',
        'Votre commande a été passée avec succès.',
        [
          {
            text: 'Suivre ma commande',
            onPress: () => navigation.navigate('OrderTracking', { order: result })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', error || 'Impossible de passer la commande');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    addressCard: {
      marginBottom: theme.spacing.md,
    },
    addressText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
      lineHeight: 20,
    },
    changeAddressButton: {
      marginTop: theme.spacing.sm,
    },
    paymentMethod: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    paymentMethodActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    paymentIcon: {
      marginRight: theme.spacing.md,
    },
    paymentMethodText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
      flex: 1,
    },
    cardForm: {
      marginTop: theme.spacing.md,
    },
    cardRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    cardInput: {
      flex: 1,
    },
    orderSummary: {
      marginBottom: theme.spacing.lg,
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
    placeOrderButton: {
      marginTop: theme.spacing.lg,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Adresse de livraison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <Card style={styles.addressCard}>
            <Text style={styles.addressText}>{deliveryAddress}</Text>
            <Button
              title="Modifier l'adresse"
              variant="ghost"
              size="small"
              style={styles.changeAddressButton}
              onPress={() => {
                // Ici on pourrait ouvrir un modal ou naviguer vers un écran d'adresses
                Alert.alert('Fonctionnalité', 'Modification d\'adresse à implémenter');
              }}
            />
          </Card>
        </View>

        {/* Mode de paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                paymentMethod === method.id && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Ionicons
                name={method.icon}
                size={24}
                color={paymentMethod === method.id ? theme.colors.primary : theme.colors.textLight}
                style={styles.paymentIcon}
              />
              <Text style={styles.paymentMethodText}>{method.name}</Text>
              {paymentMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}

          {paymentMethod === 'card' && (
            <View style={styles.cardForm}>
              <Input
                label="Numéro de carte"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={19}
              />
              
              <View style={styles.cardRow}>
                <Input
                  style={styles.cardInput}
                  label="Date d'expiration"
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  keyboardType="numeric"
                  maxLength={5}
                />
                
                <Input
                  style={styles.cardInput}
                  label="CVV"
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          )}
        </View>

        {/* Résumé de la commande */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé de la commande</Text>
          <Card style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total ({items.length} articles)</Text>
              <Text style={styles.summaryValue}>{subtotal.toFixed(2)}€</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>{deliveryFee.toFixed(2)}€</Text>
            </View>
            
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remise {couponCode && `(${couponCode})`}</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -{discount.toFixed(2)}€
                </Text>
              </View>
            )}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total à payer</Text>
              <Text style={styles.totalValue}>{total.toFixed(2)}€</Text>
            </View>
          </Card>
        </View>

        <Button
          title="Confirmer la commande"
          onPress={handlePlaceOrder}
          loading={isLoading}
          style={styles.placeOrderButton}
        />
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;
