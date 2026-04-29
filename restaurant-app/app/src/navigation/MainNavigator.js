import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { useTheme } from '../contexts/ThemeContext';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import RestaurantListScreen from '../screens/main/RestaurantListScreen';
import RestaurantDetailScreen from '../screens/main/RestaurantDetailScreen';
import CartScreen from '../screens/main/CartScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import OrderTrackingScreen from '../screens/main/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/main/OrderHistoryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';

// Admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageRestaurantsScreen from '../screens/admin/ManageRestaurantsScreen';
import ManageMenuScreen from '../screens/admin/ManageMenuScreen';
import OrdersBoardScreen from '../screens/admin/OrdersBoardScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import EditRestaurantScreen from '../screens/admin/EditRestaurantScreen';
import EditMenuScreen from '../screens/admin/EditMenuScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators pour chaque tab
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RestaurantList" 
        component={RestaurantListScreen}
        options={{ title: 'Restaurants' }}
      />
      <Stack.Screen 
        name="RestaurantDetail" 
        component={RestaurantDetailScreen}
        options={{ title: 'Menu' }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Panier' }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ title: 'Commande' }}
      />
      <Stack.Screen 
        name="OrderTracking" 
        component={OrderTrackingScreen}
        options={{ title: 'Suivi de commande' }}
      />
    </Stack.Navigator>
  );
};

const OrdersStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen}
        options={{ title: 'Mes commandes' }}
      />
      <Stack.Screen 
        name="OrderTracking" 
        component={OrderTrackingScreen}
        options={{ title: 'Suivi de commande' }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Modifier le profil' }}
      />
    </Stack.Navigator>
  );
};

const AdminStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{ title: 'Dashboard Admin' }}
      />
      <Stack.Screen 
        name="ManageRestaurants" 
        component={ManageRestaurantsScreen}
        options={{ title: 'Gestion Restaurants' }}
      />
      <Stack.Screen 
        name="ManageMenu" 
        component={ManageMenuScreen}
        options={{ title: 'Gestion Menu' }}
      />
      <Stack.Screen 
        name="OrdersBoard" 
        component={OrdersBoardScreen}
        options={{ title: 'Gestion Commandes' }}
      />
      <Stack.Screen 
        name="ManageUsers" 
        component={ManageUsersScreen}
        options={{ title: 'Gestion Utilisateurs' }}
      />
      <Stack.Screen 
        name="EditRestaurant" 
        component={EditRestaurantScreen}
      />
      <Stack.Screen 
        name="EditMenu" 
        component={EditMenuScreen}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersStack}
        options={{ title: 'Commandes' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ title: 'Profil' }}
      />
      {isAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStack}
          options={{ title: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainNavigator;
