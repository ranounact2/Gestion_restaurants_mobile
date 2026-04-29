import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { fetchMenuByRestaurant } from '../../store/slices/restaurantSlice';
import { addToCart } from '../../store/slices/cartSlice';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const RestaurantDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { restaurant } = route.params;
  const { currentMenu, isLoading } = useSelector((state) => state.restaurants);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchMenuByRestaurant(restaurant.id));
  }, [dispatch, restaurant.id]);

  useEffect(() => {
    // Sélectionner la première catégorie par défaut
    if (currentMenu && Object.keys(currentMenu).length > 0 && !selectedCategory) {
      setSelectedCategory(Object.keys(currentMenu)[0]);
    }
  }, [currentMenu, selectedCategory]);

  const handleAddToCart = (menuItem) => {
    dispatch(addToCart({
      menuItem,
      quantity: 1,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
      }
    }));
    
    Alert.alert('Ajouté au panier', `${menuItem.name} a été ajouté à votre panier`);
  };

  const renderMenuItem = ({ item }) => (
    <Card style={styles.menuItem}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.menuItemDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text style={styles.menuItemPrice}>{item.price.toFixed(2)}€</Text>
        </View>
        
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.menuItemImage} />
        )}
      </View>
      
      <Button
        title="Ajouter"
        size="small"
        onPress={() => handleAddToCart(item)}
        style={styles.addButton}
      />
    </Card>
  );

  const categories = Object.keys(currentMenu);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    header: {
      position: 'relative',
    },
    restaurantImage: {
      width: '100%',
      height: 200,
      backgroundColor: theme.colors.backgroundLight,
    },
    restaurantInfo: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      ...theme.shadows.small,
    },
    restaurantName: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    restaurantDescription: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.md,
      lineHeight: 20,
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
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    cartButton: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.round,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.large,
    },
    cartBadge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: theme.colors.error,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartBadgeText: {
      color: theme.colors.textWhite,
      fontSize: 12,
      fontWeight: theme.typography.weights.bold,
    },
    categoriesContainer: {
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    categoriesList: {
      paddingHorizontal: theme.spacing.lg,
    },
    categoryButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.backgroundLight,
    },
    categoryButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    categoryText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      fontWeight: theme.typography.weights.medium,
    },
    categoryTextActive: {
      color: theme.colors.textWhite,
    },
    menuContainer: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    menuItem: {
      marginBottom: theme.spacing.md,
    },
    menuItemContent: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    menuItemInfo: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    menuItemName: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    menuItemDescription: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.sm,
      lineHeight: 18,
    },
    menuItemPrice: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary,
    },
    menuItemImage: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.backgroundLight,
    },
    addButton: {
      alignSelf: 'flex-start',
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
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
          
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
            
            <View style={styles.restaurantMeta}>
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color={theme.colors.warning} />
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
              </View>
              <Text style={styles.deliveryInfo}>
                {restaurant.deliveryFee}€ • {restaurant.eta} min
              </Text>
            </View>
          </View>
        </View>

        {categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedCategory === item && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === item && styles.categoryTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={styles.menuContainer}>
          {selectedCategory && currentMenu[selectedCategory] ? (
            <FlatList
              data={currentMenu[selectedCategory]}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={64} color={theme.colors.textLight} />
              <Text style={styles.emptyStateText}>
                {isLoading ? 'Chargement du menu...' : 'Aucun plat disponible'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {cartItems.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="basket" size={28} color={theme.colors.textWhite} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RestaurantDetailScreen;
