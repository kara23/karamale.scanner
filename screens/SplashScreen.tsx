import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
// import { Container } from 'native-base';
import React, {useState, useEffect, useRef} from 'react'
import { Text,View, StyleSheet, Alert, Platform, Image, Linking, ImageBackground } from 'react-native'
import { Modalize } from 'react-native-modalize';
import {Button, TextInput, Icon } from "react-native-paper";


function SplashScreen(){
    console.log("This is a splashScreen");
    const [snapPoints, setSnapPoints] = useState(240);
    const modalScanInSessionRef = useRef<Modalize>(null);
    const navigation = useNavigation<any>();
    useEffect(() => {
        AsyncStorage.getItem("accountID").then((accountID) => {
            if(accountID !== null){
                navigation.navigate("Home", {
                    account_id: accountID,
                    screen: 'home'
                    });
                    return;
            } else{
                navigation.navigate("Intro");
            }
        })
    
    }, []);


    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/dots.jpg')} resizeMode="cover" style={styles.image}>
                <View style={{ padding: 20 }}>
                    <View style={{ width: "100%", alignItems:"center" }}><Image style={styles.logo} source={require('../assets/k.png')} /></View>
                </View>
       
        </ImageBackground>
       </View>
    )
}


const styles = StyleSheet.create({
    image: {
        flex: 1,
        justifyContent: 'center',
      },
      logoBottom: {
        width: 70,
        resizeMode: "contain"
      },
    logo: {
        width: 50,
        resizeMode: "contain"
      },
    container: {
        padding: 0,
        borderWidth: 0,
        height: "100%",
        backgroundColor:"#ececec",
        justifyContent: "center",
    },
    textInputs: {
        // borderWidth: .5,
        borderColor: "silver",
        borderRadius: 4,
        backgroundColor: "#fff",
        height: 48,
        marginBottom: 15,
        
    },
  
  });

  
export default SplashScreen;