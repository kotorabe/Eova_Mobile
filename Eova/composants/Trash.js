import React, { useState, useEffect, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import { Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api_url } from '../helpers/api_url';

const MapComponent = () => {
    const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });
    const [apiData, setApiData] = useState(null);
    const [equipeIdFromStorage, setEquipeIdFromStorage] = useState(null);

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

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(api_url + '/getLivraison/' + equipeIdFromStorage);
            const data = await response.json();
            setApiData(data);
            console.log(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des données', error);
        }
    }, [equipeIdFromStorage]);

    useEffect(() => {
        if (equipeIdFromStorage) {
            fetchData();
        }
    }, [fetchData, equipeIdFromStorage]);

    // Rafraîchir toutes les 30 minutes
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchData();
        }, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(intervalId);
    }, [fetchData]);


    useEffect(() => {
        // Obtenir les mises à jour de la position de l'utilisateur
        const watchId = Geolocation.watchPosition(
            position => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            error => console.log(error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );

        return () => {
            Geolocation.clearWatch(watchId);
        };
    }, []);

    // Fonction pour mettre à jour la position sur la carte en JavaScript injecté
    const updateMapWithLocation = `
        var lat = ${userLocation.latitude};
        var lng = ${userLocation.longitude};
        var marker = L.marker([lat, lng]).addTo(map).bindPopup('Vous êtes ici');
        map.setView([lat, lng], 13);
    `;
    console.log(userLocation);

    // HTML content contenant la carte Leaflet avec l'injection de JavaScript
    const htmlContent = `
        <html>
        <head>
            <title>OpenStreetMap with Leaflet</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
            <style>
                #map { height: 100%; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
            <script>
                var map = L.map('map').setView([-18.90888487914695, 47.587352032427894], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="#">OpenStreetMap</a> contributors'
                }).addTo(map);

                ${updateMapWithLocation} // Injection du JavaScript pour mettre à jour la position sur la carte

                // Rafraîchissement automatique de la position toutes les X millisecondes
                setInterval(function() {
                    console.log('Rafraîchissement de la position...');
                    navigator.geolocation.getCurrentPosition(function(position) {
                        console.log('Nouvelle position :', position.coords.latitude, position.coords.longitude);
                        var lat = position.coords.latitude;
                        var lng = position.coords.longitude;
                        var newLatLng = new L.LatLng(lat, lng);
                        marker.setLatLng(newLatLng);
                        map.setView([lat, lng]);
                    });
                }, 5000); // Rafraîchissement toutes les 5 secondes
            </script>
        </body>
        </html>
    `;

    return (
        <View style={{ flex: 1 }}>
            <WebView originWhitelist={['*']} source={{ html: htmlContent }} />

            {apiData ? (
                <View style={{ flex: 2 }}>
                    <Text>Carte sdfsfsdfsfsd</Text>
                </View>
            ) : (
                <ActivityIndicator size="large" color="#0000ff" style={{ marginLeft: 10, marginTop: 50 }} />
            )}

        </View>
    );
};

export default MapComponent;
