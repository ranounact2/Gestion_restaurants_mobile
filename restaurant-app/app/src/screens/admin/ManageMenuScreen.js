import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { fetchRestaurants, fetchMenuByRestaurant, deleteMenuItem } from '../../store/slices/restaurantSlice';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const ManageMenuScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { restaurants, currentMenu, isLoading } = useSelector((state) => state.restaurants);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0]);
    }
  }, [restaurants, selectedRestaurant]);

  useEffect(() => {
    if (selectedRestaurant) {
      dispatch(fetchMenuByRestaurant(selectedRestaurant.id));
    }
  }, [dispatch, selectedRestaurant]);

  useEffect(() => {
    if (currentMenu && Object.keys(currentMenu).length > 0 && !selectedCategory) {
      setSelectedCategory(Object.keys(currentMenu)[0]);
    }
  }, [currentMenu, selectedCategory]);

  const onRefresh = () => {
    if (selectedRestaurant) {
      dispatch(fetchMenuByRestaurant(selectedRestaurant.id));
    }
  };

  const handleAddMenuItem = () => {
    if (!selectedRestaurant) {
      Alert.alert('Erreur', 'Veuillez sélectionner un restaurant.');
      return;
    }
    navigation.navigate('EditMenu', { restaurantId: selectedRestaurant.id });
  };

  const handleEditMenuItem = (item) => {
    navigation.navigate('EditMenu', { restaurantId: selectedRestaurant.id, menuItemToEdit: item });
  };

  const handleDeleteMenuItem = (item) => {
    Alert.alert(
      'Supprimer l\'article',
      `Êtes-vous sûr de vouloir supprimer ${item.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => dispatch(deleteMenuItem(item.id)),
        },
      ]
    );
  };

  const handleToggleAvailability = (item) => {
    const action = item.isAvailable ? 'désactiver' : 'activer';
    Alert.alert(
      'Changer la disponibilité',
      `Voulez-vous ${action} ${item.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            Alert.alert('Succès', `Article ${action} avec succès`);
          }
        },
      ]
    );
  };

  const categories = Object.keys(currentMenu);
  const menuItems = selectedCategory ? currentMenu[selectedCategory] || [] : [];

  const renderRestaurantSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Restaurant :</Text>
      <FlatList
        data={restaurants}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.restaurantChip,
              selectedRestaurant?.id === item.id && styles.restaurantChipActive,
            ]}
            onPress={() => {
              setSelectedRestaurant(item);
              setSelectedCategory(null);
            }}
          >
            <Text
              style={[
                styles.restaurantChipText,
                selectedRestaurant?.id === item.id && styles.restaurantChipTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Catégorie :</Text>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === item && styles.categoryChipTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderMenuItem = ({ item }) => (
    <Card style={styles.menuItemCard}>
      <View style={styles.menuItemContent}>
        <Image source={{ uri: item.image }} style={styles.menuItemImage} />
        
        <View style={styles.menuItemInfo}>
          <View style={styles.menuItemHeader}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            <View style={[
              styles.availabilityBadge,
              { backgroundColor: item.isAvailable ? theme.colors.success + '20' : theme.colors.error + '20' }
            ]}>
              <Text style={[
                styles.availabilityText,
                { color: item.isAvailable ? theme.colors.success : theme.colors.error }
              ]}>
                {item.isAvailable ? 'Disponible' : 'Indisponible'}
              </Text>
            </View>
          </View>
          
          {item.description && (
            <Text style={styles.menuItemDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <Text style={styles.menuItemPrice}>{item.price.toFixed(2)}€</Text>
        </View>
      </View>

      <View style={styles.menuItemActions}>
        <Button
          title="Modifier"
          size="small"
          variant="outline"
          onPress={() => handleEditMenuItem(item)}
        />
        
        <Button
          title="Supprimer"
          size="small"
          variant="danger"
          onPress={() => handleDeleteMenuItem(item)}
          style={{ marginLeft: theme.spacing.sm }}
        />
      </View>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    header: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    headerTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
    },
    selectorContainer: {
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectorTitle: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    restaurantChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.backgroundLight,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    restaurantChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    restaurantChipText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      fontWeight: theme.typography.weights.medium,
    },
    restaurantChipTextActive: {
      color: theme.colors.textWhite,
    },
    categoryChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.backgroundLight,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryChipActive: {
      backgroundColor: theme.colors.secondary,
      borderColor: theme.colors.secondary,
    },
    categoryChipText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      fontWeight: theme.typography.weights.medium,
    },
    categoryChipTextActive: {
      color: theme.colors.textWhite,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    menuItemCard: {
      marginBottom: theme.spacing.md,
    },
    menuItemContent: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    menuItemImage: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.backgroundLight,
      marginRight: theme.spacing.md,
    },
    menuItemInfo: {
      flex: 1,
    },
    menuItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    menuItemName: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    availabilityBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    availabilityText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.medium,
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
    menuItemActions: {
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion du Menu</Text>
        <Button
          title="Ajouter"
          size="small"
          onPress={handleAddMenuItem}
        />
      </View>

      {renderRestaurantSelector()}
      
      {categories.length > 0 && renderCategorySelector()}

      <View style={styles.content}>
        {menuItems.length > 0 ? (
          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={80} color={theme.colors.textLight} />
            <Text style={styles.emptyStateText}>
              {selectedRestaurant && selectedCategory 
                ? 'Aucun article dans cette catégorie' 
                : 'Sélectionnez un restaurant et une catégorie'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ManageMenuScreen;
