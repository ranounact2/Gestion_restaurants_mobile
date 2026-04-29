import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '../../contexts/ThemeContext';
import { updateUserProfile } from '../../store/slices/authSlice';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';

const EditProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    const resultAction = await dispatch(updateUserProfile({ name, email }));

    if (updateUserProfile.fulfilled.match(resultAction)) {
      Alert.alert('Succès', 'Votre profil a été mis à jour.');
      navigation.goBack();
    } else {
      Alert.alert('Erreur', resultAction.payload || 'Une erreur est survenue.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    input: {
      marginBottom: theme.spacing.md,
    },
    button: {
      marginTop: theme.spacing.lg,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Input
          label="Nom complet"
          value={name}
          onChangeText={setName}
          style={styles.input}
          leftIcon="person-outline"
        />
        <Input
          label="Adresse e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          leftIcon="mail-outline"
        />
        <Button
          title="Enregistrer les modifications"
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
