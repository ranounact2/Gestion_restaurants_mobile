import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { fetchRestaurants } from '../../store/slices/restaurantSlice';
import Card from '../../components/UI/Card';

const RestaurantListScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { restaurants, isLoading } = useSelector((state) => state.restaurants);
  const { category } = route.params || {};

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchRestaurants());
  };

  // Filtrer par catégorie si spécifiée
  const filteredRestaurants = category 
    ? restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(category.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(category.toLowerCase())
      )
    : restaurants;

  const renderRestaurantItem = ({ item: restaurant }) => (
    <Card
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant })}
    >
      <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
      
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <Text style={styles.restaurantDescription} numberOfLines={2}>
          {restaurant.description}
        </Text>
        
        <View style={styles.restaurantMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color={theme.colors.warning} />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
          </View>
          
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryText}>
              {restaurant.deliveryFee}€ • {restaurant.eta} min
            </Text>
          </View>
        </View>
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
      marginBottom: theme.spacing.md,
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
    deliveryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    deliveryText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
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
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={80} color={theme.colors.textLight} />
            <Text style={styles.emptyStateText}>
              {category 
                ? `Aucun restaurant trouvé pour "${category}"`
                : 'Aucun restaurant disponible'
              }
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default RestaurantListScreen;
