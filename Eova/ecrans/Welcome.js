// Welcome.js
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View, FlatList, RefreshControl, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { api_url } from '../helpers/api_url';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { Text, Title } from 'react-native-paper';
import MapComponent from '../composants/MapComponent';

const { width, height } = Dimensions.get('window');

const Welcome = ({ navigation }) => {
  const [apiData, setApiData] = useState(null);
  const [equipeIdFromStorage, setEquipeIdFromStorage] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [equipe, setData] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(15000);

  // Obtenez le mois actuel
  const currentMonthIndex = new Date().getMonth();

  const onRefresh = () => {
    setRefreshing(true); // Activer le rafraîchissement
    fetchData(); // Appeler votre fonction fetchData pour récupérer les données
    setRefreshing(false); // Désactiver le rafraîchissement une fois que les données sont récupérées
  };


  const allMonths = [
    { label: 'Janvier', value: '1' },
    { label: 'Février', value: '2' },
    { label: 'Mars', value: '3' },
    { label: 'Avril', value: '4' },
    { label: 'Mai', value: '5' },
    { label: 'Juin', value: '6' },
    { label: 'Juillet', value: '7' },
    { label: 'Août', value: '8' },
    { label: 'Septembre', value: '9' },
    { label: 'Octobre', value: '10' },
    { label: 'Novembre', value: '11' },
    { label: 'Décembre', value: '12' },
  ];

  const filteredMonths = allMonths.slice(currentMonthIndex);
  // console.log(filteredMonths);
  const currentMonth = new Date().getMonth() + 1; // JavaScript renvoie les mois de 0 à 11, donc ajoutez 1
  const currentMonthObject = allMonths.find(month => parseInt(month.value) === currentMonth);
  const currentValueOfMonth = currentMonthObject ? currentMonthObject.value : null;

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

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

  const fetchDataequipe = async () => {
    try {
      const itemId = await AsyncStorage.getItem('equipeId');

      if (itemId) {
        const response = await fetch(api_url + '/getDataEquipe/' + itemId);
        const data = await response.json();
        setData(data.about);
        console.log(data);

        // Passez à un délai de rafraîchissement de 5 secondes après la première mise à jour
        setRefreshInterval(50000);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données', error);
    }
  };

  useEffect(() => {
    // Appeler la fonction de récupération initiale
    fetchDataequipe();

    // Configurer un intervalle pour rafraîchir toutes les 5 secondes (ou le délai actuel)
    const intervalId = setInterval(fetchDataequipe, refreshInterval);

    // Nettoyer l'intervalle lors de la désactivation du composant
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Utiliser 'equipeIdFromStorage' dans votre requête API
        setLoading(true);
        const response = await fetch(api_url + '/dash/' + equipeIdFromStorage + '/' + currentValueOfMonth);
        const data = await response.json();
        setApiData(data);
        console.log(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données', error);
      } finally {
        setLoading(false); // Désactiver l'indicateur de chargement une fois que les données sont récupérées ou en cas d'erreur
      }
    };

    // Vérifiez si 'equipeIdFromStorage' est disponible avant de lancer la requête API
    if (equipeIdFromStorage) {
      fetchData();
    }
  }, [equipeIdFromStorage]);

  const fetchData = async () => {
    try {
      if (equipeIdFromStorage && selectedMonth) {
        setLoading(true);
        const response = await fetch(api_url + '/dash/' + equipeIdFromStorage + '/' + selectedMonth);
        const data = await response.json();
        setApiData(data);
        console.log(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données', error);
    } finally {
      setLoading(false); // Désactiver l'indicateur de chargement une fois que les données sont récupérées ou en cas d'erreur
    }
  };

  useEffect(() => {
    if (selectedMonth) {
      fetchData(); // Appeler fetchData lorsque la valeur du mois sélectionné change
    }
  }, [selectedMonth]);

  let stat;
  let couleur;

  if (equipe.etat == 0) {
    couleur = 'orange';
    stat = 'Pause';
  }
  if (equipe.etat == 1) {
    couleur = 'green';
    stat = 'Vers récupération';
  }
  if (equipe.etat == 2) {
    couleur = 'green';
    stat = 'Livraison';
  }

  const renderItem = ({ item }) => {
    let back;
    if (item.id === 1) {
      sary = require('./asset/img/check.png');
      back = '#7BC9FF';
    } else if (item.id === 2) {
      sary = require('./asset/img/checklist.png');
      back = '#C5EBAA';
    } else {
      sary = require('./asset/img/check-list.png');
      back = '#F7C566';
    }
    return (
      <View style={{ position: 'relative', flexDirection: 'column', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: back, borderRadius: 20, marginRight: 10, marginTop: 110, paddingBottom: 5, elevation: 10, shadowColor: '#000', shadowRadius: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 50, paddingBottom: 50 }}>
          <Image style={{ height: 130, width: 130 }} source={sary} />
          {/* <Text style={{ fontSize: 35, fontWeight: 'bold', paddingBottom: 80, marginLeft: 10 }}>{item.label} : </Text> */}
          {/* <View style={{ flexDirection: 'row', marginEnd: 25 }}> */}
          <Text style={{ fontSize: 40, fontWeight: 'bold', paddingTop: 10, marginLeft: 20, marginEnd: 35 }}>{item.val}</Text>
          {/* </View> */}
        </View>
      </View>
    );
  };

  // console.log('Navigation dans le composant Welcome :', navigation); // Ajoutez cette ligne pour vérifier l'objet navigation
  // console.log(equipeIdFromStorage);
  return (
    <View style={{ backgroundColor: '#fff' }}>
      <View style={{ marginTop: 5, padding: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Sélectionnez le mois :</Text>
        <Picker
          selectedValue={selectedMonth}
          onValueChange={(itemValue) => handleMonthChange(itemValue)}
          style={{ backgroundColor: '#59B4C3', color: 'black', marginTop: 5 }}
        >
          {filteredMonths.map((month, index) => (
            <Picker.Item key={index} label={month.label} value={month.value} />
          ))}
        </Picker>
      </View>
      {apiData ? (

        <View style={{ marginTop: 5, paddingTop: 40, padding: 3 }}>
          <View style={{ flex: 2.5, backgroundColor: '#fff', paddingHorizontal: '10%' }}>
            <View style={{
              flexDirection: 'row', backgroundColor: '#fff', height: '13%', width: '100%', alignItems: 'center', justifyContent: 'space-around', borderRadius: 10,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', elevation: 10, shadowColor: '#000', shadowRadius: 10, marginTop: 10
            }}>
              <TouchableOpacity style={{ paddingTop: 40, alignItems: 'center' }}>
                <Image style={{ height: 110, width: 110 }} source={require('./asset/img/stats.png')} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView>
            <View style={{ flexDirection: 'column' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                {apiData && (
                  <FlatList
                    data={apiData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                      />
                    }
                  />
                )}
              </View>
            </View>
            <View style={{ padding: 40, backgroundColor: '#FFF5E0' }}>
              <Text style={{ textAlign: 'center', fontSize: 35, textDecorationLine: 'underline', paddingBottom: 20 }}>Statut:</Text>
              <Text style={{ textAlign: 'center', fontSize: 32, color: couleur, fontWeight: 'bold' }}>{stat}</Text>
            </View>
          </ScrollView>
        </View>

      ) : (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginLeft: 10, marginTop: 50 }} />
      )}

      {/* <MapComponent /> */}
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 8,
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '500',
  },
  connectionIndicator: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginLeft: 10,
    alignSelf: 'center',
  },
  infoBoxWrapper: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 100,
  },
  infoBox: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
