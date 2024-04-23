import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';

const MapComponent = () => {
    const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });

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
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

    return <WebView originWhitelist={['*']} source={{ html: htmlContent }} />;
};

export default MapComponent;
