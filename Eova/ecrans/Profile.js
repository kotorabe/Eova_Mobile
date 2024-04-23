import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Avatar, Title, Caption, Text } from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api_url } from '../helpers/api_url';
import DeconnexionButton from '../composants/Deconnexion';
import { ActivityIndicator } from 'react-native';

const imag = require('./asset/img/profiles.jpg');

const Profile = () => {
  const [apiData, setApiData] = useState(null);
  const [equipeIdFromStorage, setEquipeIdFromStorage] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(500);

  useEffect(() => {
    const fetchEquipeIdFromStorage = async () => {
      try {
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
        if (equipeIdFromStorage) {
          const response = await fetch(api_url + '/profile/' + equipeIdFromStorage);
          const data = await response.json();
          setApiData(data);
          console.log(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données', error);
      }
    };
    // fetchData();

    // Configurer un intervalle pour rafraîchir
    const intervalId = setInterval(() => {
      fetchData();
      // Si le délai actuel est de 2 secondes, changer pour 5 secondes après la première exécution
      if (refreshInterval === 500) {
        setRefreshInterval(30000);
      }
    }, refreshInterval);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [equipeIdFromStorage, refreshInterval]);

  let statut;
  let couleur;

  if (apiData && apiData.profile.etat == 0) {
    couleur = 'orange';
    statut = 'Pause';
  } else if (apiData && apiData.profile.etat == 1) {
    couleur = 'green';
    statut = 'Vers Récupération';
  } 
  else if (apiData && apiData.profile.etat == 2) {
    couleur = 'green';
    statut = 'Livraison';
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#EEF5FF' }]}>
      <View style={styles.userInfoSection}>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Avatar.Image source={imag} size={70} marginLeft={35} />
          {apiData ? (
            <View style={{ marginLeft: 19 }}>
              <Title style={[styles.title, { marginTop: 15, marginBottom: 5 }]}>
                {apiData.profile.nom}
              </Title>
              <Caption style={styles.caption}> {apiData.profile.email} </Caption>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#0000ff" style={{ marginLeft: 50 }} />
          )}
          <View style={[styles.connectionIndicator, { backgroundColor: couleur }]}></View>
        </View>
      </View>
      <View style={[styles.infoBoxWrapper, { marginTop: 35 }]}>
        <View style={styles.infoBox}>
          <FontAwesome name="gear" size={25} color="black" />
          <Title>{apiData ? apiData.profile.categorie : ''}</Title>
        </View>
        <View style={styles.infoBox}>
          <FontAwesome name="exclamation" size={25} color="black" />
          <Title>{apiData ? apiData.profile.poids_total.toLocaleString() + ' KG' : ''}</Title>
        </View>
      </View>
      <View style={styles.infoBoxWrapper}>
        <View style={styles.infoBox}>
          <Title style={{ fontSize: 25 }}>Statut:</Title>
        </View>
        <View style={styles.infoBox}>
          <Title style={{ color: couleur, fontSize: 20 }}>{statut}</Title>
        </View>
      </View>
      <DeconnexionButton onLogout={() => navigation.navigate('login')} />
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 12,
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
