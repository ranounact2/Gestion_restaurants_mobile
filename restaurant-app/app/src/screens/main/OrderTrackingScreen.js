import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { useTheme } from '../../contexts/ThemeContext';
import Card from '../../components/UI/Card';

const { width } = Dimensions.get('window');

const OrderTrackingScreen = ({ route }) => {
  const theme = useTheme();
  const { order } = route.params;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(order?.restaurant?.eta || 30);

  const orderSteps = [
    { id: 'PENDING', title: 'Commande reçue', description: 'Votre commande a été reçue', icon: 'receipt' },
    { id: 'CONFIRMED', title: 'Confirmée', description: 'Le restaurant a confirmé votre commande', icon: 'checkmark-circle' },
    { id: 'PREPARING', title: 'En préparation', description: 'Votre commande est en cours de préparation', icon: 'restaurant' },
    { id: 'READY', title: 'Prête', description: 'Votre commande est prête pour la livraison', icon: 'bag-check' },
    { id: 'DELIVERED', title: 'Livrée', description: 'Votre commande a été livrée', icon: 'checkmark-done-circle' },
  ];

  // Simulation de progression de commande
  useEffect(() => {
    const currentStepIndex = orderSteps.findIndex(step => step.id === order.status);
    setCurrentStep(currentStepIndex);

    // Simulation de mise à jour du temps estimé
    const interval = setInterval(() => {
      setEstimatedTime(prev => Math.max(0, prev - 1));
    }, 60000); // Décrémenter chaque minute

    return () => clearInterval(interval);
  }, [order.status]);

  // Coordonnées simulées pour la carte
  const restaurantLocation = {
    latitude: 48.8566,
    longitude: 2.3522,
  };

  const deliveryLocation = {
    latitude: 48.8606,
    longitude: 2.3376,
  };

  const routeCoordinates = [
    restaurantLocation,
    { latitude: 48.8586, longitude: 2.3449 },
    deliveryLocation,
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    header: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      ...theme.shadows.small,
    },
    orderNumber: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.xs,
    },
    restaurantName: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    estimatedTime: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.primary,
      fontWeight: theme.typography.weights.medium,
    },
    content: {
      padding: theme.spacing.lg,
    },
    mapContainer: {
      height: 200,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      marginBottom: theme.spacing.lg,
      ...theme.shadows.small,
    },
    map: {
      flex: 1,
    },
    stepsCard: {
      marginBottom: theme.spacing.lg,
    },
    stepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderLeftWidth: 2,
      borderLeftColor: theme.colors.border,
      marginLeft: 12,
      paddingLeft: theme.spacing.lg,
    },
    stepItemActive: {
      borderLeftColor: theme.colors.primary,
    },
    stepItemCompleted: {
      borderLeftColor: theme.colors.success,
    },
    stepIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      position: 'absolute',
      left: -21,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    stepIconActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    stepIconCompleted: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    stepContent: {
      flex: 1,
      marginLeft: 30,
    },
    stepTitle: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    stepTitleActive: {
      color: theme.colors.primary,
    },
    stepTitleCompleted: {
      color: theme.colors.success,
    },
    stepDescription: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    orderDetails: {
      marginBottom: theme.spacing.lg,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    detailLabel: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    detailValue: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      fontWeight: theme.typography.weights.medium,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    totalLabel: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary,
    },
  });

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const getStepIconColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.colors.textWhite;
      case 'active':
        return theme.colors.textWhite;
      default:
        return theme.colors.textLight;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>Commande #{order.id.slice(-8)}</Text>
        <Text style={styles.restaurantName}>{order.restaurant?.name}</Text>
        <Text style={styles.estimatedTime}>
          Temps estimé: {estimatedTime} minutes
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Carte */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 48.8586,
              longitude: 2.3449,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={restaurantLocation}
              title="Restaurant"
              description={order.restaurant?.name}
              pinColor={theme.colors.primary}
            />
            
            <Marker
              coordinate={deliveryLocation}
              title="Livraison"
              description="Votre adresse"
              pinColor={theme.colors.success}
            />
            
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={theme.colors.primary}
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          </MapView>
        </View>

        {/* Étapes de la commande */}
        <Card style={styles.stepsCard}>
          {orderSteps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <View
                key={step.id}
                style={[
                  styles.stepItem,
                  status === 'active' && styles.stepItemActive,
                  status === 'completed' && styles.stepItemCompleted,
                ]}
              >
                <View
                  style={[
                    styles.stepIcon,
                    status === 'active' && styles.stepIconActive,
                    status === 'completed' && styles.stepIconCompleted,
                  ]}
                >
                  <Ionicons
                    name={step.icon}
                    size={20}
                    color={getStepIconColor(status)}
                  />
                </View>
                
                <View style={styles.stepContent}>
                  <Text
                    style={[
                      styles.stepTitle,
                      status === 'active' && styles.stepTitleActive,
                      status === 'completed' && styles.stepTitleCompleted,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Détails de la commande */}
        <Card style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Articles</Text>
            <Text style={styles.detailValue}>{order.orderItems?.length || 0}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sous-total</Text>
            <Text style={styles.detailValue}>{order.subtotal?.toFixed(2)}€</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Livraison</Text>
            <Text style={styles.detailValue}>{order.deliveryFee?.toFixed(2)}€</Text>
          </View>
          
          {order.discount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Remise</Text>
              <Text style={[styles.detailValue, { color: theme.colors.success }]}>
                -{order.discount?.toFixed(2)}€
              </Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.total?.toFixed(2)}€</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

export default OrderTrackingScreen;
