import React from 'react'
import { Image, StatusBar, Text, View } from 'react-native';

const Eova = ({navigation}) => {

    setTimeout(()=>{
        navigation.replace('login')
    },3000)


  return (
    <View style={{ flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', backgroundColor:'#F6F5F2' }}>
        <StatusBar barStyle="light-content" hidden={false} backgroundColor="#465bd8" />
        <Image source={require('./asset/img/logo.png')} style={{ width:140, height:140 }}/>
    </View>
  );
}

export default Eova
