import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { logoutUser } from '../../store/slices/authSlice';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => dispatch(logoutUser())
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'personal-info',
      title: 'Informations personnelles',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'addresses',
      title: 'Mes adresses',
      icon: 'location-outline',
      onPress: () => Alert.alert('Fonctionnalité', 'Gestion des adresses à implémenter'),
    },
    {
      id: 'payment',
      title: 'Moyens de paiement',
      icon: 'card-outline',
      onPress: () => Alert.alert('Fonctionnalité', 'Gestion des paiements à implémenter'),
    },
    {
      id: 'favorites',
      title: 'Mes favoris',
      icon: 'heart-outline',
      onPress: () => Alert.alert('Fonctionnalité', 'Favoris à implémenter'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => Alert.alert('Fonctionnalité', 'Paramètres de notifications à implémenter'),
    },
    {
      id: 'help',
      title: 'Aide et support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Aide', 'Contactez-nous à support@foodapp.com'),
    },
    {
      id: 'about',
      title: 'À propos',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('À propos', 'FoodApp v1.0.0\nApplication de livraison de repas'),
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
    profileHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatarText: {
      fontSize: theme.typography.sizes.xxxl,
      color: theme.colors.textWhite,
      fontWeight: theme.typography.weights.bold,
    },
    userName: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    userEmail: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.sm,
    },
    userRole: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: user?.role === 'ADMIN' ? theme.colors.primary + '20' : theme.colors.backgroundLight,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: user?.role === 'ADMIN' ? theme.colors.primary : theme.colors.border,
    },
    userRoleText: {
      fontSize: theme.typography.sizes.sm,
      color: user?.role === 'ADMIN' ? theme.colors.primary : theme.colors.textLight,
      fontWeight: theme.typography.weights.medium,
    },
    menuSection: {
      marginBottom: theme.spacing.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    menuIcon: {
      marginRight: theme.spacing.lg,
    },
    menuContent: {
      flex: 1,
    },
    menuTitle: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
      fontWeight: theme.typography.weights.medium,
    },
    menuArrow: {
      marginLeft: theme.spacing.sm,
    },
    logoutButton: {
      marginTop: theme.spacing.lg,
    },
    version: {
      textAlign: 'center',
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.textLight,
      marginTop: theme.spacing.lg,
    },
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* En-tête du profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.name || 'U')}
            </Text>
          </View>
          
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.userRole}>
            <Text style={styles.userRoleText}>
              {user?.role === 'ADMIN' ? 'Administrateur' : 'Client'}
            </Text>
          </View>
        </View>

        {/* Menu des options */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <Card key={item.id} style={styles.menuItem} onPress={item.onPress}>
              <Ionicons
                name={item.icon}
                size={24}
                color={theme.colors.textLight}
                style={styles.menuIcon}
              />
              
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textLight}
                style={styles.menuArrow}
              />
            </Card>
          ))}
        </View>

        {/* Bouton de déconnexion */}
        <Button
          title="Se déconnecter"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
        />

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
