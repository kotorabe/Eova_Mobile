// DéconnexionButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
    button: {
      backgroundColor: '#BE3144',
      padding: 12,
      borderRadius: 5,
      margin:10,
      marginTop: 20,
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
    },
  });



const DeconnexionButton = ({ onLogout }) => {
    const navigation = useNavigation();
    
  const handleLogout = async () => {
    try {
      // Supprimer l'ID de l'équipe lors de la déconnexion
      await AsyncStorage.removeItem('equipeId');
      
      // Appeler la fonction de déconnexion fournie en prop
      navigation.navigate('login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.button}>
      <Text style={styles.buttonText}>Déconnexion</Text>
    </TouchableOpacity>
  );
};

export default DeconnexionButton;
