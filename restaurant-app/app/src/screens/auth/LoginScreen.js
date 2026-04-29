import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '../../contexts/ThemeContext';
import { loginUser, clearError } from '../../store/slices/authSlice';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) {
      dispatch(clearError());
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
    } catch (err) {
      Alert.alert('Erreur de connexion', err);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
    },
    headerTitle: {
      fontSize: theme.typography.sizes.xxxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    headerSubtitle: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.textLight,
    },
    card: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    forgotPassword: {
      textAlign: 'center',
      color: theme.colors.primary,
      fontSize: theme.typography.sizes.sm,
      marginTop: theme.spacing.md,
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    registerText: {
      color: theme.colors.textLight,
      fontSize: theme.typography.sizes.sm,
    },
    registerLink: {
      color: theme.colors.primary,
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      marginLeft: theme.spacing.xs,
    },
    demoContainer: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
    },
    demoTitle: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    demoText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.textLight,
      lineHeight: 16,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Bienvenue</Text>
          <Text style={styles.headerSubtitle}>Connectez-vous pour continuer</Text>
        </View>

        <Card style={styles.card} padding="large">
          <Text style={styles.title}>Connexion</Text>

          <Input
            label="Email"
            placeholder="votre@email.com"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />

          <Input
            label="Mot de passe"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
            leftIcon="lock-closed-outline"
          />

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={isLoading}
            style={{ marginTop: theme.spacing.md }}
          />

          <Text
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            Mot de passe oublié ?
          </Text>
        </Card>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Pas encore de compte ?</Text>
          <Text
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            S'inscrire
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

export default LoginScreen;
