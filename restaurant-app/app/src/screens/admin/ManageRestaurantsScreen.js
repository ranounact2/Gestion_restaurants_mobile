import React, { useEffect } from 'react';
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
import { fetchRestaurants, deleteRestaurant } from '../../store/slices/restaurantSlice';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const ManageRestaurantsScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { restaurants, isLoading } = useSelector((state) => state.restaurants);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchRestaurants());
  };

  const handleAddRestaurant = () => {
    navigation.navigate('EditRestaurant');
  };

  const handleEditRestaurant = (restaurant) => {
    navigation.navigate('EditRestaurant', { restaurant });
  };

  const handleDeleteRestaurant = (restaurant) => {
    Alert.alert(
      'Supprimer le restaurant',
      `Êtes-vous sûr de vouloir supprimer ${restaurant.name} ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => dispatch(deleteRestaurant(restaurant.id)),
        },
      ]
    );
  };

  const handleToggleStatus = (restaurant) => {
    const action = restaurant.isActive ? 'désactiver' : 'activer';
    Alert.alert(
      'Changer le statut',
      `Voulez-vous ${action} ${restaurant.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            // Ici on appellerait l'API pour changer le statut
            Alert.alert('Succès', `Restaurant ${action} avec succès`);
          }
        },
      ]
    );
  };

  const renderRestaurantItem = ({ item: restaurant }) => (
    <Card style={styles.restaurantCard}>
      <View style={styles.restaurantContent}>
        <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
        
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantHeader}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: restaurant.isActive ? theme.colors.success + '20' : theme.colors.error + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: restaurant.isActive ? theme.colors.success : theme.colors.error }
              ]}>
                {restaurant.isActive ? 'Actif' : 'Inactif'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.restaurantDescription} numberOfLines={2}>
            {restaurant.description}
          </Text>
          
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

      <View style={styles.actions}>
        <Button
          title="Modifier"
          size="small"
          variant="outline"
          onPress={() => handleEditRestaurant(restaurant)}
        />
        
        <Button
          title="Supprimer"
          size="small"
          variant="danger"
          onPress={() => handleDeleteRestaurant(restaurant)}
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
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    restaurantCard: {
      marginBottom: theme.spacing.md,
    },
    restaurantContent: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    restaurantImage: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.backgroundLight,
      marginRight: theme.spacing.md,
    },
    restaurantInfo: {
      flex: 1,
    },
    restaurantHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    restaurantName: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.sm,
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
    deliveryInfo: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion des Restaurants</Text>
        <Button
          title="Ajouter"
          size="small"
          onPress={handleAddRestaurant}
        />
      </View>

      <View style={styles.content}>
        {restaurants.length > 0 ? (
          <FlatList
            data={restaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={80} color={theme.colors.textLight} />
            <Text style={styles.emptyStateText}>Aucun restaurant trouvé</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ManageRestaurantsScreen;
