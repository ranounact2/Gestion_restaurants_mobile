import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const OrdersBoardScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { allOrders, isLoading } = useSelector((state) => state.orders);

  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllOrders());
    setRefreshing(false);
  };

  const statusOptions = [
    { id: 'ALL', label: 'Toutes', count: allOrders.length },
    { id: 'PENDING', label: 'En attente', count: allOrders.filter(o => o.status === 'PENDING').length },
    { id: 'CONFIRMED', label: 'Confirmées', count: allOrders.filter(o => o.status === 'CONFIRMED').length },
    { id: 'PREPARING', label: 'En préparation', count: allOrders.filter(o => o.status === 'PREPARING').length },
    { id: 'READY', label: 'Prêtes', count: allOrders.filter(o => o.status === 'READY').length },
    { id: 'DELIVERED', label: 'Livrées', count: allOrders.filter(o => o.status === 'DELIVERED').length },
  ];

  const filteredOrders = selectedStatus === 'ALL' 
    ? allOrders 
    : allOrders.filter(order => order.status === selectedStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return theme.colors.warning;
      case 'CONFIRMED':
        return theme.colors.info;
      case 'PREPARING':
        return theme.colors.primary;
      case 'READY':
        return theme.colors.success;
      case 'DELIVERED':
        return theme.colors.success;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.textLight;
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

  const getNextStatus = (currentStatus) => {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    Alert.alert(
      'Changer le statut',
      `Voulez-vous changer le statut vers "${getStatusText(newStatus)}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => dispatch(updateOrderStatus({ orderId, status: newStatus }))
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item: order }) => {
    const nextStatus = getNextStatus(order.status);
    
    return (
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{order.id.slice(-8)}</Text>
            <Text style={styles.customerName}>{order.user?.name}</Text>
            <Text style={styles.restaurantName}>{order.restaurant?.name}</Text>
          </View>
          
          <View style={styles.orderMeta}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {getStatusText(order.status)}
              </Text>
            </View>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderItems}>
            {order.orderItems?.length || 0} article{(order.orderItems?.length || 0) > 1 ? 's' : ''}
          </Text>
          <Text style={styles.orderTotal}>{order.total?.toFixed(2)}€</Text>
        </View>

        {order.deliveryAddress && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textLight} />
            <Text style={styles.address} numberOfLines={1}>
              {order.deliveryAddress}
            </Text>
          </View>
        )}

        {nextStatus && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <View style={styles.actions}>
            <Button
              title={`Marquer comme ${getStatusText(nextStatus)}`}
              size="small"
              onPress={() => handleStatusUpdate(order.id, nextStatus)}
            />
            
            {order.status === 'PENDING' && (
              <Button
                title="Annuler"
                size="small"
                variant="outline"
                onPress={() => handleStatusUpdate(order.id, 'CANCELLED')}
                style={{ marginLeft: theme.spacing.sm }}
              />
            )}
          </View>
        )}
      </Card>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    statusTabs: {
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    statusTabsList: {
      paddingHorizontal: theme.spacing.lg,
    },
    statusTab: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.backgroundLight,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusTabActive: {
      backgroundColor: theme.colors.primary,
    },
    statusTabText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      fontWeight: theme.typography.weights.medium,
    },
    statusTabTextActive: {
      color: theme.colors.textWhite,
    },
    statusTabCount: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.textLight,
      marginLeft: theme.spacing.xs,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    statusTabCountActive: {
      color: theme.colors.primary,
      backgroundColor: theme.colors.textWhite,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    orderCard: {
      marginBottom: theme.spacing.md,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    orderInfo: {
      flex: 1,
    },
    orderId: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    customerName: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    restaurantName: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    orderMeta: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
    },
    statusText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.medium,
    },
    orderDate: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.textLight,
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
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    address: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
      marginLeft: theme.spacing.xs,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.textLight,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      {/* Onglets de statut */}
      <View style={styles.statusTabs}>
        <FlatList
          data={statusOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusTabsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.statusTab,
                selectedStatus === item.id && styles.statusTabActive,
              ]}
              onPress={() => setSelectedStatus(item.id)}
            >
              <Text
                style={[
                  styles.statusTabText,
                  selectedStatus === item.id && styles.statusTabTextActive,
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.statusTabCount,
                  selectedStatus === item.id && styles.statusTabCountActive,
                ]}
              >
                {item.count}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Liste des commandes */}
      <View style={styles.content}>
        {filteredOrders.length > 0 ? (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={80} color={theme.colors.textLight} />
            <Text style={styles.emptyStateText}>
              Aucune commande {selectedStatus !== 'ALL' ? getStatusText(selectedStatus).toLowerCase() : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default OrdersBoardScreen;
