// import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
// import Login from './ecrans/Login';
// import Welcome from './ecrans/Welcome';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigation from './ecrans/NavigationLogin';


const MyTabs = () => {
  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>

    // <Login />
  );
};

export default MyTabs;