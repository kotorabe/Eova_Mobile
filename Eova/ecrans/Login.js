import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { api_url } from '../helpers/api_url';

const logo = require('./asset/img/logo.png');

const Login = () => {

    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    // const handleLogin = async () => {
    //     try {
    //         if (email.trim() === '' || password.trim() === '') {
    //             setEmail('Veuillez remplir tous les champs.');
    //         } else {
    //             const response = await axios.post(api_url + '/authentification', {
    //                 email,
    //                 password,
    //             });

    //             const donnee = response.data.equipe;
    //             const id = donnee.id;

    //             // Utilisez 'await' pour attendre la résolution de la promesse
    //             await AsyncStorage.setItem('equipeId', id.toString());

    //             console.log('L\'ID de l\'équipe a été stocké avec succès.');

    //             navigation.navigate('welcome');
    //         }
    //     } catch (error) {
    //         // Gérez les erreurs d'authentification ici
    //         console.error('Erreur d\'authentification:', error);
    //     }
    // };

    const handleLogin = async () => {
        try {
            if (email.trim() === '' || password.trim() === '') {
                setEmail('Veuillez remplir tous les champs.');
            } else {
                const response = await fetch(api_url + '/authentification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Erreur d\'authentification');
                }

                const responseData = await response.json();
                const equipeId = responseData.equipe.id;

                await AsyncStorage.setItem('equipeId', equipeId.toString());

                console.log('L\'ID de l\'équipe a été stocké avec succès.');

                navigation.navigate('welcome');
            }
        } catch (error) {
            console.error('Erreur d\'authentification:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ backgroundColor: '#ffffff', flex: 1, paddingHorizontal: 15 }}>

                <View style={styles.container}>
                    <Card style={styles.card}>

                        <View style={styles.container2}>
                            <Image
                                source={logo} // Remplacez le chemin par le chemin de votre image
                                style={styles.image}
                            />
                            <Text style={styles.signupTitle}>E-ova Trano</Text>
                        </View>
                        <TextInput style={[styles.input]}
                            underlineColorAndroid="transparent"
                            placeholder="Email"
                            placeholderTextColor="grey"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                        />

                        <TextInput style={[styles.input]}
                            underlineColorAndroid="transparent"
                            placeholder="Password"
                            secureTextEntry={true}
                            placeholderTextColor="grey"
                            autoCapitalize="none"
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                        />
                        <Text style={styles.text}></Text>

                        <Button
                            title="Login"
                            color="green"
                            onPress={handleLogin}
                        />


                    </Card>


                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    image: {
        width: 40, // Ajustez la largeur selon vos besoins
        height: 40, // Ajustez la hauteur selon vos besoins
        marginRight: 10, // Ajoute une marge à droite du composant Image
    },

    container2: {
        flexDirection: 'row',
        justifyContent: 'center', // Aligner les composants verticalement au centre
        alignItems: 'center', // Aligner les composants horizontalement au centre
    },

    container: {
        flex: 1,
        justifyContent: 'center',
    },

    input: {
        width: 'auto',
        color: 'black',
        fontSize: 18,
        height: 44,
        paddingLeft: 10,
        borderBottomWidth: 1,
        marginVertical: 10,
        paddingLeft: 15,
        borderBottomColor: 'grey',
        marginLeft: 4,
        marginRight: 4
    },

    card: {
        color: 'black',
        padding: 20
    },

    signupTitle: {
        textAlign: 'left',
        fontFamily: 'serif',
        fontWeight: 'bold',
        fontSize: 25,
        textAlign: 'center',
        color: 'black',
        padding: 10
    },

    text: {
        marginBottom: 10, // ajustez la valeur selon vos besoins
    }

});

export default Login;