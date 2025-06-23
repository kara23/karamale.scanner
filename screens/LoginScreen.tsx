import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
// import { Container } from 'native-base';
import React, {useState, useRef} from 'react'
import { Text,View, StyleSheet, Platform, Image, Linking, ImageBackground, Keyboard } from 'react-native'
import { Modalize } from 'react-native-modalize';
import {Button, TextInput, Icon } from "react-native-paper";
// import NetInfo from '@react-native-community/netinfo';


function LoginScreen(){
    const [secureEntry, setSecureEntry] = useState(true);
    const [eye, setEye] = useState("eye-off-outline");
    const [isModalVisible, setModalVisible] = useState(false);
    const [snapPoints, setSnapPoints] = useState(210);
    const [errorMsg, setErrorMsg] = useState<any>("");
    const modalScanInSessionRef = useRef<Modalize>(null);
    const modalToggle = () => {
        modalScanInSessionRef?.current?.open();
    };

    const closeModalToggle = () => {
        modalScanInSessionRef?.current?.close();
    }

    const [loading, setLoading] = useState(false);
    const [loggingIn, setLogginIn] = useState("Log In");
    const [disabled, setDisabled] = useState(false);
    const [closeModalText, setCloseModalText] = useState<any>('');
    const navigation = useNavigation<any>();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');


    const login = async() => {
        Keyboard.dismiss();
        if(email == ''){
            modalToggle();
            setSnapPoints(180);
            setErrorMsg(
                <View>
                    <Text style={{ width: "100%", textAlign:"left",fontWeight:"bold", marginTop: 0, fontSize: 20, color:"#000" }}>Email address</Text>
                    <Text style={{ width: "100%", textAlign:"left", color:"#333", fontSize: 16 }}>Enter your email address if you wish to continue...</Text>
                </View>
            )
                
            setCloseModalText('OK');
            return;
        }
        else if(password == ''){
            modalToggle();
            setSnapPoints(160);
            setErrorMsg(
                <View>
                    <Text style={{ width: "100%", textAlign:"left",fontWeight:"bold", marginTop: 0, fontSize: 20, color:"#000" }}>Password</Text>
                    <Text style={{ width: "100%", textAlign:"left", color:"#333", fontSize: 16 }}>Enter your password to log in</Text>
                </View>
            )
            setCloseModalText('OK');

            return;
        }

        setLogginIn("Logging in...");
        setLoading(true);
        setDisabled(true);
    const operating_system = Platform.OS;
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('os', operating_system);
    formData.append('pincode', '');
    formData.append('query', 'LOGIN');

    const api = `https://karamale.com/apps/kscanner/webservices.php`;


    try{
        await axios({
          url: api,
          method: 'POST',
          data: formData,
            headers: {
                  // Crucial: Explicitly set Content-Type for this request
                  'Content-Type': 'multipart/form-data',
                  // 'Accept': 'application/json', // Optional: what response type you accept
                },
        })
        .then(function (response) {
            if(response.data.value == 1 || response.data.value == 2){
//                 console.log(response.data);
                if(response.data.accounttype == "business"){
                    setLogginIn("Log In");
                    setLoading(false);
                    setDisabled(false);
                                    // set AsyncStorage if user is logged in successfully
                                    AsyncStorage.setItem('loggedin', "true");
                                    AsyncStorage.setItem('accountID', response.data.businessid);
                                    AsyncStorage.setItem('accountName', response.data.businessname);
                                    AsyncStorage.setItem('accountType', response.data.accounttype);
                                    AsyncStorage.setItem('joinedDate', response.data.joinedDate);

                                    // AsyncStorage.setItem('564405E3', '564405E3');
                                    // AsyncStorage.setItem('YQCZXDS', 'YQCZXDS');
                                  // navigate to scan screen
                        navigation.navigate("Home", {
                        account_id: response.data.businessid,
                        screen: 'home'
                        }); 
        
                  
                } else{
                    setLogginIn("Log In");
                    setLoading(false);
                    setDisabled(false);
                    setSnapPoints(230);

                    setErrorMsg(
                        <View>
                            <Text style={{ width: "100%", textAlign:"left",fontWeight:"bold", marginTop: 0, fontSize: 20, color:"#000" }}>Access denied</Text>
                            <Text style={{ width: "100%", textAlign:"left", color:"#333", fontSize: 16 }}>Hi {response.data.customername.trim()}, unfortunately this app may only be used by Event organisers.</Text>
                            <Text style={{ width: "100%", textAlign:"left", color: "grey", fontSize: 14, marginTop: 10}}>
                            To access your ticket, click <Text style={{ textAlign:"left", color:"#3399cc", fontSize: 14 }} onPress={() => Linking.openURL('https://karamale.com/password')}>here</Text>
                            </Text>
                        </View>
                    )
                    
                    setCloseModalText('OK');
                    modalToggle();
                }
            } else{
                setSnapPoints(190);
                setErrorMsg(
                    <View>
                        <Text style={{ width: "100%", textAlign:"left",fontWeight:"bold", marginTop: 0, fontSize: 20, color:"#000" }}>Invalid details, login failed</Text>
                        <Text style={{ width: "100%", textAlign:"left", color:"#333", fontSize: 16 }}>Forgot your logging details?</Text>
                        <Text style={{ width: "100%", textAlign:"left", color:"#3399cc", fontSize: 16 }} onPress={() => Linking.openURL('https://karamale.com/password')}>Reset password</Text>
                    </View>
                )
                
                setCloseModalText('Try again');
                modalToggle();
                setLogginIn("Log In");
                setLoading(false);
                setDisabled(false);
            }
        }).catch(function(error) {

            console.log("Error: ", error);
            setLogginIn("Log In");
            setLoading(false);
            setDisabled(false);

            setSnapPoints(180);
                setErrorMsg(
                    <View>
                        <Text style={{ width: "100%", textAlign:"left",fontWeight:"bold", marginTop: 0, fontSize: 20, color:"#000" }}>Oops!</Text>
                        <Text style={{ width: "100%", textAlign:"left", color:"#333", fontSize: 16 }}>{error.message}</Text>
                    </View>
                )
                setCloseModalText('Try again');
                modalToggle();
                setLogginIn("Log In");
                setLoading(false);
                setDisabled(false);
        })
        } catch(error){
            setLogginIn("Log In");
            setLoading(false);
            setDisabled(false);

            setSnapPoints(180);
                setErrorMsg(
                    <View>
                        <Text style={{ width: "100%", textAlign:"left",fontWeight:"bold", marginTop: 0, fontSize: 20, color:"#000" }}>Oops!</Text>
                        <Text style={{ width: "100%", textAlign:"left", color:"#333", fontSize: 16 }}>Something went wrong while attempting to log in.</Text>
                    </View>
                )
                setCloseModalText('Try again');
                modalToggle();
                setLogginIn("Log In");
                setLoading(false);
                setDisabled(false);
     }

    }

    const showPassword = () => {
        if(eye == 'eye-off-outline'){
            setEye('eye-outline');
            setSecureEntry(false);
        } else{
            setEye('eye-off-outline');
            setSecureEntry(true);
        }
    }
    const image = {uri: 'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D'};
    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/sun.jpg')} resizeMode="cover" style={styles.image}>
                <View style={{ padding: 20 }}>
            <View style={{ width: "100%", alignItems:"center", marginTop: -150 }}><Image style={styles.logo} source={require('../assets/k.png')} /></View>
            <View>
            <TextInput style={styles.textInputs}
             theme={{ colors: {onSurfaceVariant:"#333"}, roundness:15 }}
            mode='outlined'
            // label="Email address"
            value={email}
            onChangeText={text => setEmail(text)}
            outlineStyle={{ borderWidth: 1 }}
            activeOutlineColor='#39c'
            outlineColor='grey'
            textColor='#fff'
            placeholderTextColor={"silver"}
            placeholder='Email address'
            />
            <TextInput style={[styles.textInputs]}
            theme={{ colors: {onSurfaceVariant:"#333"}, roundness:15 }}
            mode='outlined'
            // label="Password"
            value={password}
            onChangeText={text => setPassword(text)}
            secureTextEntry={secureEntry}
            outlineStyle={{ borderWidth: 1 }}
            activeOutlineColor='#39c'
            outlineColor='grey'
            textColor='#fff'
            placeholderTextColor={"silver"}
            placeholder='Password'
//             right={<TextInput.Icon icon={eye} color={"#fff"} onPress={showPassword} style={{ marginTop:6,backgroundColor:"transparent" }} />}
            />

            {/* <Button mode='contained' onPress={login} disabled={disabled} loading={loading} style={{ backgroundColor: disabled ? "#ff3232" : '#ff3232', borderRadius: 7 }}><Text style={{ fontSize: 16, color:"#fff" }}>{loggingIn}</Text></Button> */}
            <Button mode='contained' onPress={login} loading={loading} style={{ backgroundColor: disabled ? "#ff3232" : '#ff3232', borderRadius: 10 }}><Text style={{ fontSize: 16, color:"#fff" }}>{loggingIn}</Text></Button>
            <Text style={{ marginTop: 15, color:"silver", textAlign:"center", width: "100%", fontSize: 16 }} onPress={() => Linking.openURL('https://karamale.com/password')}>Forgot password?</Text>
            </View>

        </View>
        <View style={{ position:"absolute",bottom: 30, width: "100%", alignItems: 'center' }}>
            <Text style={{ textAlign:"center",color:"#fff", width: '100%' }}>By</Text>
            <Image style={styles.logoBottom} source={require('../assets/karamale.png')} />
        </View>
        
        <Modalize ref={modalScanInSessionRef} modalHeight={snapPoints} avoidKeyboardLikeIOS={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
                <View style={{ padding: 30 }}>
                 {errorMsg}
                  <Button mode='contained' style={{ marginTop: 20, borderRadius: 15, backgroundColor:"#000" }} onPress={closeModalToggle}><Text style={{ fontSize: 16 }}>{closeModalText}</Text></Button>
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
        height: 30,
        resizeMode: "contain",
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
        backgroundColor: "transparent",
        height: 48,
        marginBottom: 15,
        color:"#fff"
        
    },
  
  });

  
export default LoginScreen;