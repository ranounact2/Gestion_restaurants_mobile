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
import { registerUser, clearError } from '../../store/slices/authSlice';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })).unwrap();
    } catch (err) {
      Alert.alert('Erreur d\'inscription', err);
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
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logo: {
      fontSize: theme.typography.sizes.xxxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textLight,
      textAlign: 'center',
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
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    loginText: {
      color: theme.colors.textLight,
      fontSize: theme.typography.sizes.sm,
    },
    loginLink: {
      color: theme.colors.primary,
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🍕 FoodApp</Text>
          <Text style={styles.subtitle}>
            Créez votre compte pour commencer
          </Text>
        </View>

        <Card style={styles.card} padding="large">
          <Text style={styles.title}>Inscription</Text>

          <Input
            label="Nom complet"
            placeholder="Votre nom"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            leftIcon="person-outline"
          />

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

          <Input
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry
            leftIcon="lock-closed-outline"
          />

          <Button
            title="S'inscrire"
            onPress={handleRegister}
            loading={isLoading}
            style={{ marginTop: theme.spacing.md }}
          />
        </Card>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Déjà un compte ?</Text>
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            Se connecter
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
