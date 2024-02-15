import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api_url } from '../helpers/api_url';

const Planning = () => {
  const [planning, setPlanning] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(500);

  const fetchPlanning = async () => {
    try {
      const itemId = await AsyncStorage.getItem('equipeId');

      if (itemId) {
        const response = await fetch(api_url + '/planning/' + itemId);
        const data = await response.json();
        setPlanning(data.planning);

        // Passez à un délai de rafraîchissement de 5 secondes après la première mise à jour
        setRefreshInterval(5000);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données', error);
    }
  };

  useEffect(() => {
    // Appeler la fonction de récupération initiale
    fetchPlanning();

    // Configurer un intervalle pour rafraîchir toutes les 5 secondes (ou le délai actuel)
    const intervalId = setInterval(fetchPlanning, refreshInterval);

    // Nettoyer l'intervalle lors de la désactivation du composant
    return () => clearInterval(intervalId);
  }, [refreshInterval]); // Inclure refreshInterval dans la liste des dépendances pour s'assurer que l'intervalle est mis à jour

  const renderItem = ({ item }) => {
    const dateLivraison = new Date(item.date_livraison);
    const formattedDate = dateLivraison.toLocaleDateString('fr-FR');

    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{item.id}</Text>
        <Text style={styles.cell}>{item.client_nom}</Text>
        <Text style={styles.cell}>{formattedDate}</Text>
        <View style={styles.cell}>
          <Button title="Voir" onPress={() => handleAssignPress(item)} />
        </View>
      </View>
    );
  };

  const keyExtractor = (item) => item.id.toString();

  if (!planning || planning.length === 0) {
    return (
      <View style={styles.row}>
        <Text style={styles.cell}>---------------</Text>
        <Text style={styles.cell}>---------------</Text>
        <Text style={styles.cell}>---------------</Text>
        <Text style={styles.cell}>---------------</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={planning}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={
        <View style={[styles.row, styles.header]}>
          <Text style={styles.cell}>#</Text>
          <Text style={styles.cell}>Client</Text>
          <Text style={styles.cell}>Date de Livraison</Text>
          <Text style={styles.cell}>###</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Ajustez cette ligne selon votre préférence pour l'alignement horizontal
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1, // Utilisez une flexibilité égale pour chaque cellule
    textAlign: 'center', // Ajustez cela en fonction de votre préférence pour l'alignement horizontal
  },
  header: {
    backgroundColor: '#59B4C3',
    fontSize: 20,

  },
});

export default Planning;
