import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { fetchRestaurants, setSearchQuery } from '../../store/slices/restaurantSlice';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { restaurants, isLoading, searchQuery } = useSelector((state) => state.restaurants);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchRestaurants());
    setRefreshing(false);
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'burger', name: 'Burger', icon: '🍔' },
    { id: 'sushi', name: 'Sushi', icon: '🍣' },
    { id: 'dessert', name: 'Dessert', icon: '🍰' },
  ];

  const renderRestaurantCard = ({ item }) => (
    <Card
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
    >
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.restaurantMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color={theme.colors.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.deliveryFee}>{item.deliveryFee}€ • {item.eta} min</Text>
        </View>
      </View>
    </Card>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('RestaurantList', { category: item.id })}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    header: {
      backgroundColor: theme.colors.background,
      paddingTop: 50,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      ...theme.shadows.small,
    },
    greeting: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    location: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.md,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      height: 48,
    },
    searchInput: {
      flex: 1,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    cartButton: {
      position: 'absolute',
      right: theme.spacing.lg,
      top: 60,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.round,
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    cartBadge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: theme.colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartBadgeText: {
      color: theme.colors.textWhite,
      fontSize: 12,
      fontWeight: theme.typography.weights.bold,
    },
    content: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    categoriesContainer: {
      marginBottom: theme.spacing.xl,
    },
    categoryItem: {
      alignItems: 'center',
      marginRight: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      minWidth: 80,
      ...theme.shadows.small,
    },
    categoryIcon: {
      fontSize: 32,
      marginBottom: theme.spacing.xs,
    },
    categoryName: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      textAlign: 'center',
    },
    restaurantCard: {
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
    },
    restaurantImage: {
      width: '100%',
      height: 150,
      backgroundColor: theme.colors.backgroundLight,
    },
    restaurantInfo: {
      padding: theme.spacing.md,
    },
    restaurantName: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    restaurantDescription: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.sm,
      lineHeight: 18,
    },
    restaurantMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      marginLeft: theme.spacing.xs,
    },
    deliveryFee: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxxl,
    },
    emptyStateText: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textLight,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour {user?.name} ! 👋</Text>
        <Text style={styles.location}>📍 Paris, France</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un restaurant..."
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={(text) => dispatch(setSearchQuery(text))}
          />
        </View>

        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="basket" size={24} color={theme.colors.textWhite} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <Text style={styles.sectionTitle}>Restaurants populaires</Text>
        
        {filteredRestaurants.length > 0 ? (
          <FlatList
            data={filteredRestaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={theme.colors.textLight} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Aucun restaurant trouvé' : 'Aucun restaurant disponible'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
