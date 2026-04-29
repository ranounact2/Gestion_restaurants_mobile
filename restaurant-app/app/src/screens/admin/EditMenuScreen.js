import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '../../contexts/ThemeContext';
import {
  createMenuItem,
  updateMenuItem,
} from '../../store/slices/restaurantSlice';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import ImagePicker from '../../components/UI/ImagePicker';

const EditMenuScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.restaurants);
  const { restaurantId, menuItemToEdit } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (menuItemToEdit) {
      setName(menuItemToEdit.name);
      setDescription(menuItemToEdit.description);
      setPrice(String(menuItemToEdit.price));
      setCategory(menuItemToEdit.category);
      setImage(menuItemToEdit.image);
      navigation.setOptions({ title: "Modifier l'article" });
    } else {
      navigation.setOptions({ title: 'Ajouter un article' });
    }
  }, [menuItemToEdit, navigation]);

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires.');
      return;
    }

    const menuItemData = {
      name,
      description,
      price: parseFloat(price) || 0,
      category,
      restaurantId,
      image: image,
    };

    let resultAction;
    if (menuItemToEdit) {
      resultAction = await dispatch(
        updateMenuItem({ id: menuItemToEdit.id, ...menuItemData })
      );
    } else {
      resultAction = await dispatch(createMenuItem(menuItemData));
    }

    if (
      createMenuItem.fulfilled.match(resultAction) ||
      updateMenuItem.fulfilled.match(resultAction)
    ) {
      Alert.alert('Succès', `Article ${menuItemToEdit ? 'mis a jour' : 'cree'} avec succès.`);
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
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ImagePicker onImageTaken={setImage} initialImage={image} />
        <Input label="Nom de l'article" value={name} onChangeText={setName} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline />
        <Input label="Prix" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <Input label="Catégorie" value={category} onChangeText={setCategory} />
        <Button
          title={menuItemToEdit ? "Mettre à jour" : "Créer l'article"}
          onPress={handleSave}
          isLoading={isLoading}
        />
      </ScrollView>
    </View>
  );
};

export default EditMenuScreen;
