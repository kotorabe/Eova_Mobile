// Welcome.js
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { api_url } from '../helpers/api_url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

const Welcome = ({ navigation }) => {
  const [apiData, setApiData] = useState(null);
  const [equipeIdFromStorage, setEquipeIdFromStorage] = useState(null);

  useEffect(() => {
    const fetchEquipeIdFromStorage = async () => {
      try {
        // Récupérer l'ID de l'équipe depuis AsyncStorage
        const equipeId = await AsyncStorage.getItem('equipeId');
        setEquipeIdFromStorage(equipeId);
      } catch (error) {
        console.error('Erreur lors de la récupération de equipeId depuis AsyncStorage:', error);
      }
    };

    fetchEquipeIdFromStorage();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Utiliser 'equipeIdFromStorage' dans votre requête API
        const response = await fetch(api_url + '/tableauBord/' + equipeIdFromStorage);
        const data = await response.json();
        setApiData(data);
        console.log(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données', error);
      }
    };

    // Vérifiez si 'equipeIdFromStorage' est disponible avant de lancer la requête API
    if (equipeIdFromStorage) {
      fetchData();
    }
  }, [equipeIdFromStorage]);

  const handleLogout = () => {
    console.log('Bouton de déconnexion cliqué'); // Ajoutez cette ligne pour vérifier si la fonction est appelée
    // Naviguez vers la page de connexion ou effectuez d'autres actions de déconnexion
    // Dans cet exemple, je vais simplement naviguer vers une page hypothétique "connexion"
    navigation.navigate('login');
  };

  console.log('Navigation dans le composant Welcome :', navigation); // Ajoutez cette ligne pour vérifier l'objet navigation

  return (
    <View>
      {apiData ? (
        <View>
          <Text>Count: {apiData.count}</Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginLeft: 20, marginTop: 50 }} />
      )}
    </View>
  );
};

export default Welcome;
