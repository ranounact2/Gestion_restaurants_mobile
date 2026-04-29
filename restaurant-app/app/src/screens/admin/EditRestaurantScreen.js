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
  createRestaurant,
  updateRestaurant,
} from '../../store/slices/restaurantSlice';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import ImagePicker from '../../components/UI/ImagePicker';

const EditRestaurantScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.restaurants);
  const restaurantToEdit = route.params?.restaurant;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [eta, setEta] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (restaurantToEdit) {
      setName(restaurantToEdit.name);
      setDescription(restaurantToEdit.description);
      setAddress(restaurantToEdit.address);
      setPhone(restaurantToEdit.phone);
      setCuisine(restaurantToEdit.cuisine);
      setDeliveryFee(String(restaurantToEdit.deliveryFee));
      setEta(restaurantToEdit.eta);
      setImage(restaurantToEdit.image);
      navigation.setOptions({ title: 'Modifier le restaurant' });
    } else {
      navigation.setOptions({ title: 'Ajouter un restaurant' });
    }
  }, [restaurantToEdit, navigation]);

  const handleSave = async () => {
    if (!name || !address || !cuisine) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires.');
      return;
    }

    const restaurantData = {
      name,
      description,
      address,
      phone,
      cuisine,
      deliveryFee: parseFloat(deliveryFee) || 0,
      eta,
      image: image,
    };

    let resultAction;
    if (restaurantToEdit) {
      resultAction = await dispatch(
        updateRestaurant({ id: restaurantToEdit.id, ...restaurantData })
      );
    } else {
      resultAction = await dispatch(createRestaurant(restaurantData));
    }

    if (
      createRestaurant.fulfilled.match(resultAction) ||
      updateRestaurant.fulfilled.match(resultAction)
    ) {
      Alert.alert('Succès', `Restaurant ${restaurantToEdit ? 'mis à jour' : 'créé'} avec succès.`);
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
        <Input label="Nom du restaurant" value={name} onChangeText={setName} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline />
        <Input label="Adresse" value={address} onChangeText={setAddress} />
        <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Type de cuisine" value={cuisine} onChangeText={setCuisine} />
        <Input label="Frais de livraison" value={deliveryFee} onChangeText={setDeliveryFee} keyboardType="numeric" />
        <Input label="Temps de livraison estimé (ETA)" value={eta} onChangeText={setEta} />
        <Button
          title={restaurantToEdit ? 'Mettre à jour' : 'Créer le restaurant'}
          onPress={handleSave}
          isLoading={isLoading}
        />
      </ScrollView>
    </View>
  );
};

export default EditRestaurantScreen;
