import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

const ImagePickerComponent = ({ onImageTaken, initialImage }) => {
  const theme = useTheme();
  const [pickedImage, setPickedImage] = useState(initialImage);

  useEffect(() => {
    setPickedImage(initialImage);
  }, [initialImage]);

  const verifyPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissions insuffisantes',
        "Vous devez autoriser l'accès à la galerie pour utiliser cette fonctionnalité.",
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takeImageHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }

    const image = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!image.canceled) {
      setPickedImage(image.assets[0].uri);
      onImageTaken(image.assets[0].uri);
    }
  };

  const styles = StyleSheet.create({
    imagePicker: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    imagePreview: {
      width: '100%',
      height: 200,
      marginBottom: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.backgroundLight,
      overflow: 'hidden', // Ensures the image respects the border radius
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
      color: theme.colors.textLight,
      fontSize: theme.typography.sizes.md,
      marginTop: theme.spacing.sm,
    },
  });

  return (
    <View style={styles.imagePicker}>
      <TouchableOpacity style={styles.imagePreview} onPress={takeImageHandler}>
        {pickedImage ? (
          <Image style={styles.image} source={{ uri: pickedImage }} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="camera-outline" size={40} color={theme.colors.textLight} />
            <Text style={styles.placeholderText}>Appuyez pour choisir une image</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ImagePickerComponent;
