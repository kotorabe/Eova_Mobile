// AppNavigation.js
import React from 'react';
import Login from './Login';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from './Welcome';
import Tabs from '../tabs';
import DeconnexionButton from '../composants/Deconnexion';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <Stack.Navigator initialRouteName='login' screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="welcome" component={Tabs} />
      {/* <Stack.Screen
        name="welcome"
        component={Tabs}
        options={({ navigation }) => ({
          headerRight: () => <DeconnexionButton onLogout={() => navigation.navigate('login')} />,
        })}
      /> */}
    </Stack.Navigator>
  );
};

export default AppNavigation;
