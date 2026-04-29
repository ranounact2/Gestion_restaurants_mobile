import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import Card from '../../components/UI/Card';
import { fetchAllUsers, updateUserRole, deleteUser } from '../../store/slices/authSlice';
import Button from '../../components/UI/Button';

const ManageUsersScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { allUsers: users, isLoading, user: currentUser } = useSelector((state) => state.auth);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchAllUsers());
  };

  const handleUpdateRole = (user, newRole) => {
    if (user.id === currentUser.id) {
      Alert.alert('Action non autorisée', 'Vous не pouvez pas modifier votre propre rôle.');
      return;
    }

    Alert.alert(
      'Confirmer le changement de rôle',
      `Voulez-vous vraiment changer le rôle de ${user.name} en ${newRole} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => dispatch(updateUserRole({ userId: user.id, role: newRole })),
        },
      ]
    );
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser.id) {
      Alert.alert('Action non autorisée', 'Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }

    Alert.alert(
      'Supprimer l\'utilisateur',
      `Êtes-vous sûr de vouloir supprimer ${user.name} ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => dispatch(deleteUser(user.id)),
        },
      ]
    );
  };

  const filterOptions = [
    { id: 'ALL', label: 'Tous', count: users.length },
    { id: 'CUSTOMER', label: 'Clients', count: users.filter(u => u.role === 'CUSTOMER').length },
    { id: 'ADMIN', label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length },
  ];

  const filteredUsers = selectedFilter === 'ALL' 
    ? users 
    : users.filter(user => user.role === selectedFilter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderUserItem = ({ item: user }) => (
    <Card style={styles.userCard}>
      <View style={styles.userContent}>
        <View style={[
          styles.avatar,
          { backgroundColor: user.role === 'ADMIN' ? theme.colors.primary : theme.colors.secondary }
        ]}>
          <Text style={styles.avatarText}>
            {getInitials(user.name)}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={[
              styles.roleBadge,
              { 
                backgroundColor: user.role === 'ADMIN' 
                  ? theme.colors.primary + '20' 
                  : theme.colors.secondary + '20' 
              }
            ]}>
              <Text style={[
                styles.roleText,
                { 
                  color: user.role === 'ADMIN' 
                    ? theme.colors.primary 
                    : theme.colors.secondary 
                }
              ]}>
                {user.role === 'ADMIN' ? 'Admin' : 'Client'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={styles.userActions}>
            <Button
              title={user.role === 'ADMIN' ? 'Rétrograder' : 'Promouvoir Admin'}
              size="small"
              variant="outline"
              onPress={() => handleUpdateRole(user, user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN')}
            />
            <Button
              title="Supprimer"
              size="small"
              variant="danger"
              onPress={() => handleDeleteUser(user)}
              style={{ marginLeft: theme.spacing.sm }}
            />
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
    header: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      ...theme.shadows.small,
    },
    headerTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    filterTabs: {
      flexDirection: 'row',
    },
    filterTab: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.backgroundLight,
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterTabActive: {
      backgroundColor: theme.colors.primary,
    },
    filterTabText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text,
      fontWeight: theme.typography.weights.medium,
    },
    filterTabTextActive: {
      color: theme.colors.textWhite,
    },
    filterTabCount: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.textLight,
      marginLeft: theme.spacing.xs,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    filterTabCountActive: {
      color: theme.colors.primary,
      backgroundColor: theme.colors.textWhite,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    userCard: {
      marginBottom: theme.spacing.md,
    },
    userContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.textWhite,
      fontWeight: theme.typography.weights.bold,
    },
    userInfo: {
      flex: 1,
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    userName: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    roleBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    roleText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.medium,
    },
    userActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing.md,
    },
    userEmail: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.sm,
    },
    userMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    joinDate: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textLight,
    },
    orderCount: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.primary,
      fontWeight: theme.typography.weights.medium,
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
        <Text style={styles.headerTitle}>Gestion des Utilisateurs</Text>
        
        <View style={styles.filterTabs}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter.id && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
              <Text
                style={[
                  styles.filterTabCount,
                  selectedFilter === filter.id && styles.filterTabCountActive,
                ]}
              >
                {filter.count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color={theme.colors.textLight} />
            <Text style={styles.emptyStateText}>
              Aucun utilisateur {selectedFilter !== 'ALL' ? selectedFilter.toLowerCase() : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ManageUsersScreen;
