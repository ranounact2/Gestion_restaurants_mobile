import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { fetchUserOrders } from '../../store/slices/orderSlice';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const OrderHistoryScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchUserOrders());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return theme.colors.success;
      case 'CANCELLED':
        return theme.colors.error;
      case 'PREPARING':
      case 'READY':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'PREPARING':
        return 'En préparation';
      case 'READY':
        return 'Prête';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item: order }) => (
    <Card
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderTracking', { order })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.restaurantName}>{order.restaurant?.name}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderItems}>
          {order.orderItems?.length || 0} article{(order.orderItems?.length || 0) > 1 ? 's' : ''}
        </Text>
        <Text style={styles.orderTotal}>{order.total?.toFixed(2)}€</Text>
      </View>

      {order.orderItems && order.orderItems.length > 0 && (
        <View style={styles.itemsList}>
          {order.orderItems.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.orderItemRow}>
              {item.menuItem?.image && (
                <Image source={{ uri: item.menuItem.image }} style={styles.itemImage} />
              )}
              <Text style={styles.itemName} numberOfLines={1}>
                {item.quantity}x {item.menuItem?.name}
              </Text>
            </View>
          ))}
          {order.orderItems.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.orderItems.length - 2} autre{order.orderItems.length - 2 > 1 ? 's' : ''} article{order.orderItems.length - 2 > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}

      <View style={styles.orderActions}>
        {(order.status === 'PREPARING' || order.status === 'READY') && (
          <Button
            title="Suivre"
            size="small"
            variant="outline"
            onPress={() => navigation.navigate('OrderTracking', { order })}
          />
        )}
        
        {order.status === 'DELIVERED' && (
          <Button
            title="Recommander"
            size="small"
            onPress={() => navigation.navigate('RestaurantDetail', { restaurant: order.restaurant })}
          />
        )}
      </View>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    content: {
      padding: theme.spacing.lg,
    },
    orderCard: {
      marginBottom: theme.spacing.md,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    orderInfo: {
      flex: 1,
    },
    restaurantName: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    orderDate: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    statusText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.medium,
    },
    orderDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    orderItems: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    orderTotal: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary,
    },
    itemsList: {
      marginBottom: theme.spacing.md,
    },
    orderItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    itemImage: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.backgroundLight,
      marginRight: theme.spacing.sm,
    },
    itemName: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      flex: 1,
    },
    moreItems: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.textLight,
      fontStyle: 'italic',
      marginTop: theme.spacing.xs,
    },
    orderActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxxl,
    },
    emptyStateText: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.textLight,
      textAlign: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
  });

  if (orders.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color={theme.colors.textLight} />
          <Text style={styles.emptyStateText}>
            Vous n'avez pas encore passé de commande
          </Text>
          <Button
            title="Découvrir les restaurants"
            onPress={() => navigation.navigate('HomeMain')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default OrderHistoryScreen;
