import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
// import { Container } from 'native-base';
import React, {useState, useEffect, useRef} from 'react'
import { Text,View, StyleSheet, Alert, Platform, Image, Linking, ImageBackground } from 'react-native'
import { Modalize } from 'react-native-modalize';
import {Button, TextInput, Icon } from "react-native-paper";


function IntroScreen(){
    const [snapPoints, setSnapPoints] = useState(265);
    const modalScanInSessionRef = useRef<Modalize>(null);

    // modalScanInSessionRef?.current?.open();
    
    // const modalToggle = () => {
    //     modalScanInSessionRef?.current?.open();
    // };

    // const closeModalToggle = () => {
    //     modalScanInSessionRef?.current?.close();
    // }

    const navigation = useNavigation<any>();
    useEffect(() => {
        modalScanInSessionRef?.current?.open();
    }, []);

    const loginScreen = () => {
        navigation.navigate("Login");
    }
    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/sun.jpg')} resizeMode="cover" style={styles.image}>
                <View style={{ padding: 20 }}>
                    <View style={{ width: "100%", alignItems:"center" }}><Image style={styles.logo} source={require('../assets/k.png')} /></View>
                </View>
        <Modalize onClose={loginScreen} ref={modalScanInSessionRef} modalHeight={snapPoints} avoidKeyboardLikeIOS={true} disableScrollIfPossible={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
                <View style={{ padding: 30 }}>
                 <Text style={{ color: "#000",fontSize: 18, fontWeight:"bold", width: "100%" }}>Welcome to Kscanner</Text>
                 <Text style={{ color: "#000" }}>
                    Kscanner is a high-performance scanning app trusted by hundreds of event organizers.{"\n"}{"\n"}
                    With lightning-fast technology, it detects counterfeit and invalid tickets—ensuring your event stays secure and runs smoothly.
                </Text>
                  <Button mode='contained' style={{ marginTop: 20, backgroundColor:"#000", borderRadius: 15  }} onPress={loginScreen}><Text style={{ fontSize: 16 }}>Proceed to login</Text></Button>
                </View>
        </Modalize>
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

  
export default IntroScreen;