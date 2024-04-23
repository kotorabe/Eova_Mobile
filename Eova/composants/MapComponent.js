import React, { useState, useEffect, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import { Dimensions, View, ActivityIndicator, TouchableOpacity, Image, Linking, Modal, StyleSheet, ScrollView, FlatList, Animated, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api_url } from '../helpers/api_url';
import { Text } from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'react-native-image-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');


const MapComponent = () => {
    const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });
    const [apiData, setApiData] = useState(null);
    const [equipeIdFromStorage, setEquipeIdFromStorage] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isModalVisible2, setModalVisible2] = useState(false);
    const [isModalVisible3, setModalVisible3] = useState(false);
    const [isModalVisible4, setModalVisible4] = useState(false);
    const [isModalVisible5, setModalVisible5] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    // const [image, setImage] = useState(null);


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
        }, 45 * 60 * 1000); // 30 minutes

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
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 }
        );

        return () => {
            Geolocation.clearWatch(watchId);
        };
    }, []);

    // Fonction pour mettre à jour la position sur la carte en JavaScript injecté
    const updateMapWithLocation = `
    var lat = ${userLocation.latitude};
    var lng = ${userLocation.longitude};
    var marker = null;
    if (${apiData?.details?.coord_recup}) {
        L.marker([${apiData?.details?.coord_recup}], { icon: L.divIcon({ className: 'custom-marker', html: '<div style="background-color: green; width: 20px; height: 20px; border-radius: 50%;"></div>' }) }).addTo(map).bindPopup('Récuperation: ${apiData?.details?.recuperation}');
        L.marker([${apiData?.details?.coord_livr}], { icon: L.divIcon({ className: 'custom-marker', html: '<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%;"></div>' }) }).addTo(map).bindPopup('Livraison: ${apiData?.details?.livraison}');
        var userMarker = L.marker([lat, lng]).addTo(map).bindPopup('Vous êtes ici');
        marker = userMarker;
        map.setView([lat, lng], 11);
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
        }, 5000);
    } else {
        var userMarker = L.marker([lat, lng]).addTo(map).bindPopup('Vous êtes ici');
        marker = userMarker;
        map.setView([lat, lng], 13);
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
        }, 5000);
    }
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
            <style>
            .custom-marker {
                margin-left: -10px;
                margin-top: -10px;
                position: absolute;
            }
            </style>
            <div id="map"></div>
            <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
            <script>
                var map = L.map('map').setView([-18.90888487914695, 47.587352032427894], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="#">OpenStreetMap</a>'
                }).addTo(map);

                ${updateMapWithLocation} // Injection du JavaScript pour mettre à jour la position sur la carte
            </script>
        </body>
        </html>
    `;

    const formatNumber = (number) => {
        const firstPart = number.substring(0, 3);
        const secondPart = number.substring(3, 5);
        const thirdPart = number.substring(5, 8);
        const fourthPart = number.substring(8, 10);

        return `${firstPart} ${secondPart} ${thirdPart} ${fourthPart}`;
    };

    let formattedNumber;

    if (apiData != null && apiData.details != null) {
        formattedNumber = formatNumber(apiData.details.numero);
    } else {
        formattedNumber = '';
    }


    const callPhoneNumber = () => {
        if (apiData?.details?.numero != null) {
            const phoneNumber = apiData.details.numero;
            Linking.openURL(`tel:${phoneNumber}`);
        }
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const showClientDetails = () => {
        if (apiData?.details?.numero != null) {
            toggleModal();
        }
    };

    const keyExtractor = (item) => item.id.toString();

    const renderItem = ({ item }) => {

        return (
            <View style={styles.row}>
                <Text style={styles.cell2}>{item.nom}</Text>
                <Text style={styles.cell2}>{item.type_objet}</Text>
                <Text style={styles.cell2}>{item.taille}</Text>
                <Text style={styles.cell2}>{item.kilo} Kg</Text>
            </View>
        );
    };

    animation = new Animated.Value(0);

    toggleMenu = () => {
        const toValue = this.open ? 0 : 1;

        Animated.spring(this.animation, {
            toValue,
            friction: 5,
            useNativeDriver: true
        }).start();

        this.open = !this.open;
    }

    const beginLivraison = {
        transform: [
            { scale: this.animation },
            {
                translateY: this.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -80]
                })
            }
        ]
    }

    const cameraStyle = {
        transform: [
            { scale: this.animation },
            {
                translateY: this.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -140]
                })
            }
        ]
    }

    const checkStyle = {
        transform: [
            { scale: this.animation },
            {
                translateY: this.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -200]
                })
            }
        ]
    }

    const rotation = {
        transform: [
            {
                rotate: this.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "45deg"]
                })
            }
        ]
    }

    let couleurGo;
    let couleurCam;
    let couleurCheck;
    if (apiData?.livraison?.etat == 1) {
        couleurGo = '#4CCD99';
        couleurCam = "#EEEEEE";
        couleurCheck = "#EEEEEE";
    } else if (apiData?.livraison?.etat == 2) {
        couleurGo = '#EEEEEE';
        couleurCam = "#4CCD99";
        couleurCheck = "#EEEEEE";
    } else if (apiData?.livraison?.etat == 3) {
        couleurGo = '#EEEEEE';
        couleurCam = "#EEEEEE";
        couleurCheck = "#4CCD99";
    }

    let som;
    if (apiData?.somme_poids == null) {
        som = 0;
    } else {
        som = apiData?.somme_poids;
    }

    const uploadImageRecup = async (image) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('image', {
            uri: image.assets[0].uri,
            type: image.assets[0].type,
            name: image.assets[0].fileName,
        });
        formData.append('id', apiData?.livraison?.id);
        formData.append('position', `${userLocation.latitude}, ${userLocation.longitude}`);
        console.log(image.assets[0].fileName);
        try {
            const response = await fetch(api_url + '/Livraison', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            })
            console.log(response);
        } catch (error) {
            console.error(error);
        } finally {
            fetchData();
            setIsLoading(false); // Arrêtez l'indicateur de chargement
            showModalConfirmeLivre();
        }
    };

    const uploadImageFini = async (image) => {
        setIsLoading2(true);
        const formData2 = new FormData();
        formData2.append('image', {
            uri: image.assets[0].uri,
            type: image.assets[0].type,
            name: image.assets[0].fileName,
        });
        formData2.append('id', apiData?.livraison?.id);
        console.log(image.assets[0].fileName);
        try {
            const response = await fetch(api_url + '/Fini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData2,
            })
            console.log(response);
        } catch (error) {
            console.error(error);
        } finally {
            fetchData();
            setIsLoading2(false); // Arrêtez l'indicateur de chargement
            showModalConfirmeFini();
        }
    };

    const sendPosition = async () => {
        try {
            const posit = `${userLocation.latitude}, ${userLocation.longitude}`;
            const response = await fetch(api_url + '/Position', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    posit,
                    equipeIdFromStorage
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur de position');
            }
            console.log('Position actuelle envoyé:' + posit);

        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(sendPosition, 10 * 60 * 1000); // 10 minutes

        return () => {
            clearInterval(intervalId); // Nettoyer l'intervalle lors du démontage du composant
        };
    }, []);

    const takePhoto = () => {
        if (apiData?.livraison?.etat == 2) {
            const options = {
                mediaType: 'photo',
                quality: 1,
                saveToPhotos: true
            };

            launchCamera(options, (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.error) {
                    console.log('ImagePicker Error: ', response.error);
                } else {
                    console.log(response.assets[0].fileName);
                    uploadImageRecup(response);
                }
            });
        } else {
            console.log("Tsy misy");
        }
    };

    const takePhotoFini = () => {
        if (apiData?.livraison?.etat == 3) {
            const options = {
                mediaType: 'photo',
                quality: 1,
                saveToPhotos: true
            };

            launchCamera(options, (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.error) {
                    console.log('ImagePicker Error: ', response.error);
                } else {
                    console.log(response.assets[0].fileName);
                    uploadImageFini(response);
                }
            });
        } else {
            console.log("Tsy misy");
        }
    };

    const toggleModalConfirmation = () => {
        setModalVisible2(!isModalVisible2);
    };

    const showConfirmation = () => {
        if (apiData?.livraison?.etat == 1) {
            toggleModalConfirmation();
        } else {

        }
    };

    const showModalConfirme = () => {
        setModalVisible3(true);
        setTimeout(() => {
            setModalVisible2(!isModalVisible2);
            setModalVisible3(false);
        }, 2000); // 2000 millisecondes = 2 secondes
    };

    const showModalConfirmeLivre = () => {
        setModalVisible4(true);
        setTimeout(() => {
            setModalVisible4(false);
        }, 2000);
    };

    const showModalConfirmeFini = () => {
        setModalVisible5(true);
        setTimeout(() => {
            setModalVisible5(false);
        }, 2000);
    };

    const begin = async () => {
        try {
            const pos = `${userLocation.latitude}, ${userLocation.longitude}`;
            const response = await fetch(api_url + '/beginLivraison/' + apiData?.livraison?.id + '/' + pos);
            const data = await response.json();
            console.log('data:' + data);
            fetchData();
            showModalConfirme();
        } catch (error) {
            console.error(error);
        }
    };



    return (
        <View style={{ flex: 1 }}>
            <WebView originWhitelist={['*']} source={{ html: htmlContent }} />

            {apiData ? (
                <View style={{ marginBottom: height * 0.02, flex: 0.7, backgroundColor: '#B3C8CF' }}>
                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                        <TouchableOpacity style={{ paddingTop: height * 0.01 }} onPress={() => showClientDetails()}>
                            <Image style={{ height: 70, width: 70, marginLeft: width * 0.05, marginRight: width * 0.05 }} source={require('../ecrans/asset/img/man.png')} />
                            <Text style={{ fontSize: width * 0.03, fontWeight: 'bold', paddingTop: 5, paddingBottom: 80, marginLeft: width * 0.07, marginEnd: width * 0.07, color: 'black', textAlign: 'center' }}> {apiData.details?.nom} </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                        <TouchableWithoutFeedback onPress={() => showConfirmation()}>
                            <Animated.View style={[styles.button, styles.secondary, beginLivraison, { backgroundColor: couleurGo }]}>
                                <FontAwesome name="arrow-up" color="black" size={20}/>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={takePhoto}>
                            <Animated.View style={[styles.button, styles.secondary, cameraStyle, { backgroundColor: couleurCam }]}>
                                {!isLoading && <FontAwesome name="camera" color="black" size={20} />}
                                {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
                            </Animated.View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback onPress={takePhotoFini}>
                            <Animated.View style={[styles.button, styles.secondary, checkStyle, { backgroundColor: couleurCheck }]}>
                                {!isLoading2 && <FontAwesome name="calendar-check-o" color="black" size={20} />}
                                {isLoading2 && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
                            </Animated.View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback onPress={this.toggleMenu}>
                            <Animated.View style={[styles.button, styles.menu, rotation]}>
                                <FontAwesome name="plus" color="white" size={20} />
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>

                    <View style={{ flexDirection: 'row', paddingBottom: 150, justifyContent: 'space-between' }}>
                        <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => callPhoneNumber()}>
                            <Image style={{ height: 60, width: 60, marginLeft: width * 0.05, marginRight: width * 0.05 }} source={require('../ecrans/asset/img/telephone.png')} />
                            <Text style={{ fontSize: width * 0.03, fontWeight: 'bold', paddingTop: height * 0.01, marginLeft: width * 0.07, marginEnd: width * 0.03, color: 'black', textAlign: 'center' }}> {formattedNumber} </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ alignItems: 'center' }}>
                            <Image style={{ height: 60, width: 60, marginLeft: width * 0.05, marginRight: width * 0.01 }} source={require('../ecrans/asset/img/calendar.png')} />
                            <Text style={{ fontSize: width * 0.03, fontWeight: 'bold', paddingTop: height * 0.01, marginLeft: width * 0.07, marginEnd: width * 0.03, color: 'black', textAlign: 'center' }}> {apiData.livraison?.date_livraison} </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal 1 */}
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
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline', textAlign: 'center' }}>Biens du client:</Text>
                                <Text style={{ textAlign: 'center' }}>-----</Text>
                                <FlatList
                                    data={apiData.objets}
                                    renderItem={renderItem}
                                    keyExtractor={keyExtractor}
                                    ListHeaderComponent={
                                        <View style={[styles.row, styles.header]}>
                                            <Text style={styles.cell}>Objet</Text>
                                            <Text style={styles.cell}>Type</Text>
                                            <Text style={styles.cell}>Taille</Text>
                                            <Text style={styles.cell}>Poids</Text>
                                        </View>
                                    }
                                    ListFooterComponent={
                                        <View style={[styles.row, styles.footer]}>
                                            <Text style={styles.cell}>***</Text>
                                            <Text style={styles.cell}>***</Text>
                                            <Text style={styles.cell}>***</Text>
                                            <Text style={styles.cell3}>{som} Kg</Text>
                                        </View>
                                    }
                                />
                                <Text style={{ textAlign: 'center' }}>-----</Text>
                                <TouchableOpacity onPress={toggleModal} style={{ borderRadius: 5, alignItems: 'center', margin: 5, padding: 10, backgroundColor: '#FA7070' }}>
                                    <Text>Fermer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* Modal 2 */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisible2}
                        onRequestClose={() => {
                            setModalVisible2(!isModalVisible2);
                        }}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Commencer la livraison ?</Text>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={[styles.button2, { backgroundColor: 'red' }]} onPress={() => {
                                        setModalVisible2(!isModalVisible2);
                                    }}>
                                        <Text style={styles.buttonText}>Non</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.button2, { backgroundColor: 'green' }]} onPress={() => {
                                        begin()
                                    }}>
                                        <Text style={styles.buttonText}>Oui</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Modal 3 */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisible3}
                        onRequestClose={() => {
                            setModalVisible3(!isModalVisible3);
                        }}
                    >
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, { justifyContent: 'center', alignContent: 'center', alignItems: 'center', padding: 50 }]}>
                                <FontAwesome name="check-circle" color="green" size={40} />
                                <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'green' }}>En route vers récupération!</Text>
                            </View>
                        </View>
                    </Modal>

                    {/* Modal 4 */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisible4}
                        onRequestClose={() => {
                            setModalVisible4(!isModalVisible4);
                        }}
                    >
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, { justifyContent: 'center', alignContent: 'center', alignItems: 'center', padding: 50 }]}>
                                <FontAwesome name="truck" color="green" size={40} />
                                <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'green' }}>Livraison Commencer !</Text>
                            </View>
                        </View>
                    </Modal>

                    {/* Modal 5 */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisible5}
                        onRequestClose={() => {
                            setModalVisible5(!isModalVisible5);
                        }}
                    >
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, { justifyContent: 'center', alignContent: 'center', alignItems: 'center', padding: 50 }]}>
                                <FontAwesome name="check-circle" color="green" size={40} />
                                <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'green' }}>Livraison Fini !</Text>
                            </View>
                        </View>
                    </Modal>
                </View>

            ) : (
                <ActivityIndicator size="large" color="#0000ff" style={{ marginLeft: width * 0.04, marginTop: height * 0.1 }} />
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingTop: height * 0.07,
        paddingBottom: height * 0.07,
    },
    modalContent: {
        flexDirection: 'column',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        elevation: 5,
    },
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
        fontSize: 15,
        fontWeight: 'bold',
    },
    cell2: {
        flex: 1, // Utilisez une flexibilité égale pour chaque cellule
        textAlign: 'center', // Ajustez cela en fonction de votre préférence pour l'alignement horizontal
        fontSize: 12,
    },
    cell3: {
        flex: 1, // Utilisez une flexibilité égale pour chaque cellule
        textAlign: 'center', // Ajustez cela en fonction de votre préférence pour l'alignement horizontal
        fontSize: 13,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: '#59B4D6',
        fontSize: 20,
    },
    footer: {
        backgroundColor: '#BBE2EC',
    },
    button: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 60 / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowRadius: 10,
        shadowColor: "#F02A4B",
        shadowOpacity: 0.3,
        shadowOffset: { height: 10 }
    },
    menu: {
        backgroundColor: 'green'
    },
    secondary: {
        width: 55,
        height: 55,
        borderRadius: 55 / 2,
        // backgroundColor: coleraCam
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center'
    },
    button2: {
        marginHorizontal: 10,
        padding: 20,
        borderRadius: 10,
        width: 100,
        height: 60,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold'
    }
});

export default MapComponent;
