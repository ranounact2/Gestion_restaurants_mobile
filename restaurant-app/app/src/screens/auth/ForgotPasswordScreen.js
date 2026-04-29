import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';

const ForgotPasswordScreen = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    setIsLoading(true);
    
    // Simulation d'envoi d'email
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Email envoyé',
        'Un lien de réinitialisation a été envoyé à votre adresse email.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]
      );
    }, 2000);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundLight,
      padding: theme.spacing.lg,
      justifyContent: 'center',
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
    card: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    description: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textLight,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    backButton: {
      marginTop: theme.spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🍕 FoodApp</Text>
      </View>

      <Card style={styles.card} padding="large">
        <Text style={styles.title}>Mot de passe oublié</Text>
        
        <Text style={styles.description}>
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </Text>

        <Input
          label="Email"
          placeholder="votre@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
        />

        <Button
          title="Envoyer le lien"
          onPress={handleResetPassword}
          loading={isLoading}
        />

        <Button
          title="Retour à la connexion"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
          style={styles.backButton}
        />
      </Card>
    </View>
  );
};

export default ForgotPasswordScreen;
