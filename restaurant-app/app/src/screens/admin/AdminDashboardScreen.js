import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { fetchAllOrders } from '../../store/slices/orderSlice';
import { fetchRestaurants } from '../../store/slices/restaurantSlice';
import Card from '../../components/UI/Card';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 cartes par ligne avec marges

const AdminDashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { allOrders, isLoading } = useSelector((state) => state.orders);
  const { restaurants } = useSelector((state) => state.restaurants);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [dispatch]);

  const loadDashboardData = async () => {
    await Promise.all([
      dispatch(fetchAllOrders()),
      dispatch(fetchRestaurants()),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Calculs des statistiques
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = allOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  const pendingOrders = allOrders.filter(order => 
    ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)
  ).length;

  const completedOrders = allOrders.filter(order => order.status === 'DELIVERED').length;

  const activeRestaurants = restaurants.filter(restaurant => restaurant.isActive).length;

  // Restaurants populaires (par nombre de commandes)
  const restaurantOrderCounts = allOrders.reduce((acc, order) => {
    const restaurantId = order.restaurantId;
    acc[restaurantId] = (acc[restaurantId] || 0) + 1;
    return acc;
  }, {});

  const popularRestaurants = restaurants
    .map(restaurant => ({
      ...restaurant,
      orderCount: restaurantOrderCounts[restaurant.id] || 0,
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 3);

  const statsCards = [
    {
      title: 'Commandes du jour',
      value: todayOrders.length.toString(),
      icon: 'receipt',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('OrdersBoard'),
    },
    {
      title: 'Revenus du jour',
      value: `${todayRevenue.toFixed(2)}€`,
      icon: 'cash',
      color: theme.colors.success,
    },
    {
      title: 'Commandes en cours',
      value: pendingOrders.toString(),
      icon: 'time',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('OrdersBoard'),
    },
    {
      title: 'Restaurants actifs',
      value: activeRestaurants.toString(),
      icon: 'restaurant',
      color: theme.colors.info,
      onPress: () => navigation.navigate('ManageRestaurants'),
    },
  ];

  const quickActions = [
    {
      title: 'Gestion Restaurants',
      icon: 'restaurant',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('ManageRestaurants'),
    },
    {
      title: 'Gestion Menu',
      icon: 'menu',
      color: theme.colors.success,
      onPress: () => navigation.navigate('ManageMenu'),
    },
    {
      title: 'Suivi Commandes',
      icon: 'list',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('OrdersBoard'),
    },
    {
      title: 'Utilisateurs',
      icon: 'people',
      color: theme.colors.info,
      onPress: () => navigation.navigate('ManageUsers'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    content: {
      padding: theme.spacing.lg,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textLight,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: cardWidth,
      marginBottom: theme.spacing.md,
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    statIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    statValue: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    statTitle: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
      textAlign: 'center',
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionCard: {
      width: cardWidth,
      marginBottom: theme.spacing.md,
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    actionIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    actionTitle: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      textAlign: 'center',
    },
    popularRestaurant: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.small,
    },
    restaurantInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    restaurantName: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    restaurantOrders: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    restaurantRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard Admin</Text>
          <Text style={styles.subtitle}>Vue d'ensemble de votre activité</Text>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            {statsCards.map((stat, index) => (
              <Card
                key={index}
                style={styles.statCard}
                onPress={stat.onPress}
                variant="elevated"
              >
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Card
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                variant="elevated"
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Restaurants populaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurants populaires</Text>
          {popularRestaurants.map((restaurant, index) => (
            <View key={restaurant.id} style={styles.popularRestaurant}>
              <Text style={{ fontSize: 24 }}>🏆</Text>
              
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantOrders}>
                  {restaurant.orderCount} commande{restaurant.orderCount > 1 ? 's' : ''}
                </Text>
              </View>
              
              <View style={styles.restaurantRating}>
                <Ionicons name="star" size={16} color={theme.colors.warning} />
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboardScreen;
