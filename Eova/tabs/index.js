import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Welcome from '../ecrans/Welcome';
import Profile from '../ecrans/Profile';
import Planning from '../ecrans/Planning';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Details from '../ecrans/Planning/Details';
import MapComponent from '../composants/MapComponent';
import Land from '../ecrans/Livraison/Index';

const Tabs = () => {

  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#40A2E3',
      }}
    >
      <Tab.Screen
        name="Tableau de bord"
        component={Welcome}
        options={{
          tabBarLabel: 'Tableau de Bord',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bar-chart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Planning"
        component={Planning}
        options={{
          tabBarLabel: 'Planning',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" color={color} size={size} />
          ),
          tabBarBadge: 0,
        }}
      />
        {/* {() => {
          // Utilisez un état local pour stocker l'ID récupéré d'AsyncStorage
          const [equipeId, setEquipeId] = useState(null);

          // Effectuez la récupération de l'ID dans un effet useEffect
          useEffect(() => {
            const fetchItemId = async () => {
              try {
                const itemId = await AsyncStorage.getItem('equipeId');
                setEquipeId(itemId);
                console.log(itemId);
              } catch (error) {
                console.error('Erreur lors de la récupération de l\'id de l\'équipe depuis AsyncStorage:', error);
                setEquipeId(null);
              }
            };

            fetchItemId();
          }, []);

          // Rendez le composant Planning conditionnellement en fonction de l'ID
          return <Planning id={equipeId} />;
        }}
      </Tab.Screen> */}
      <Tab.Screen
        name="Livraison"
        component={MapComponent}
        options={{
          tabBarLabel: 'Livraison',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="truck" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default Tabs;