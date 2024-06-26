// AppNavigation.js
import React from 'react';
import Login from './Login';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from './Welcome';
import Tabs from '../tabs';
import DeconnexionButton from '../composants/Deconnexion';
import Details from './Planning/Details';
import Eova from './Eova';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <Stack.Navigator initialRouteName='acceuil' screenOptions={{ headerShown: false }} >
      <Stack.Screen name="acceuil" component={Eova} screenOptions={{ headerShown: false }} />
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="welcome" component={Tabs} />
      <Stack.Screen
        name="DetailsView"
        component={Details}
        options={{ headerShown: true, title: 'Détails' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigation;
