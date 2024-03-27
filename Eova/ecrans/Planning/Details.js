import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Button, Linking  } from 'react-native';
import { TouchableOpacity, GestureHandlerRootView  } from 'react-native-gesture-handler';
import {Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';

const Details = ({ route }) => {
  const { selectedItem, details } = route.params;
  console.log(selectedItem);
  console.log("io :",details);
  const  coord_recup  = details.detail.coord_recup;
  const  coord_livr  = details.detail.coord_livr; 

  const [isModalVisible, setModalVisible] = useState(false);
  console.log(coord_recup);
  console.log(coord_livr);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Leaflet Map</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    </head>
    <body>
    <style>
    .custom-marker {
      margin-left: -10px;
      margin-top: -10px;
      position: absolute;
    }
    </style>
      <div id="map" style="height: 91vh;"></div>
      <script>
        var map = L.map('map').setView([${coord_recup}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Ajouter le marqueur pour coord_recup
        L.marker([${coord_recup}], { icon: L.divIcon({ className: 'custom-marker', html: '<div style="background-color: green; width: 20px; height: 20px; border-radius: 50%;"></div>' }) }).addTo(map).bindPopup('Récuperation: ${details.detail.recuperation}');
        L.marker([${coord_livr}]).addTo(map).bindPopup('Livraison: ${details.detail.livraison}');

        // ... (ajouter d'autres marqueurs ou personnaliser la carte selon vos besoins)
      </script>
    </body>
    </html>
  `;

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const showClientDetails = () => {
    toggleModal();
  };

  const callPhoneNumber = () => {
    const phoneNumber = details.detail.numero;
    Linking.openURL(`tel:${phoneNumber}`);
  };


  return (
    // <View style={styles.container}>
    //   <WebView
    //     source={{ html }}
    //     style={styles.map}
    //   />
    // </View>
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          source={{ html }}
          style={styles.map}
          injectedJavaScript={`
            // You can add additional JavaScript here if needed
          `}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => showClientDetails()}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Détails client</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Détails du client:</Text>
            {/* Afficher les détails du client ici */}
            <Text>Nom : {details.detail.nom}</Text>
            <Text>Prénom : {details.detail.prenom}</Text>
            <Text>Email : {details.detail.email}</Text>
            <Text onPress={() => callPhoneNumber()}>N° : {details.detail.numero}</Text>
            <Text style= {{ textAlign : 'center' }}>-----</Text>
            <Button title="Fermer" color="red" onPress={toggleModal} />
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
    
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
});

export default Details;
