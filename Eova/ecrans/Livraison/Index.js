import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api_url } from '../../helpers/api_url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapComponent from '../../composants/MapComponent';

const Land = () => {
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



    return (
        <View style={{ padding: 5, backgroundColor: '#F6F5F2', flexDirection: 'column' }}>
            {apiData ? (
                <View style={{ marginBottom: 10 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                        alignItems: 'center'
                    }}>
                        <TouchableOpacity style={{ paddingTop: 40, alignItems: 'center' }}>
                            <Image style={{ height: 110, width: 110, marginLeft: 30, marginRight: 30 }} source={require('../asset/img/man.png')} />
                        </TouchableOpacity>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', paddingTop: 10, marginLeft: 20, marginEnd: 20, color: 'black', textAlign: 'center' }}> {apiData.details?.nom} </Text>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                        alignItems: 'center'
                    }}>
                        <TouchableOpacity style={{ paddingTop: 40, alignItems: 'center' }}>
                            <Image style={{ height: 110, width: 110, marginLeft: 30, marginRight: 30 }} source={require('../asset/img/calendar.png')} />
                        </TouchableOpacity>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', paddingTop: 10, marginLeft: 20, marginEnd: 20, color: 'black', textAlign: 'center' }}> {apiData.livraison?.date_livraison} </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <ActivityIndicator size="large" color="#0000ff" style={{ marginLeft: 10, marginTop: 50 }} />
            )}
        </View>
    );
};

export default Land;
