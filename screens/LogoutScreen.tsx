import React, { useRef, useState } from 'react'
import { Text, View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modalize } from 'react-native-modalize';
const height = Dimensions.get('window').height;

function Logout(){
    const route = useRoute();
    const modalLogoutRef = useRef<Modalize>(null);
    const modalToggle = () => {
        modalLogoutRef?.current?.open();
        setLoading(false);
        setLogout("Log out");
    };

    const closeModalToggle = () => {
        modalLogoutRef?.current?.close();
    }
    const [snapPoints, setSnapPoints] = useState(height);
    const [accountID, setAccountID] = useState<any>(0);
    const [isModalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logout, setLogout] = useState("Log out");
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const navigation = useNavigation<any>();

  const logOut = async() => {
    modalLogoutRef?.current?.close();
    setLoading(true);
    setLogout("Logging out...");
    AsyncStorage.clear();
    navigation.navigate("Login");
  }
  
  AsyncStorage.getItem('accountID').then((accountID) => {
    setAccountID(accountID);
  });

  const items = [
    'Exit the logout screen.', 
    'Tap "Home" in the bottom-left corner', 
    'Select the event you want to sync.', 
    'Under the "Sync" section, tap "Push" and wait until the process is complete.',
    'Once done, you can safely log out.'
    ];

    const steps = ['Log in to your account.', 'Select the event you want to sync.', 'Under the "Sync" section, tap "Pull" and wait for the process to complete.']

  const screen = route.params?.screen;
    return (
           <View style={styles.container}>
            
            <Text style={[styles.textWhite, styles.heading]}>Confirm logout from Kscanner.</Text>
            <ScrollView>
                <View style={styles.innerContainer}>
                    <Text style={[styles.textWhite, styles.content, styles.textBold, styles.text16]}>You’re free to log back in whenever you need.{'\n'}</Text>
                    <Text style={[styles.textWhite, styles.content, styles.textBold, styles.text16]}>Important:{'\n'}</Text>

                    <Text style={[styles.textWhite, styles.content]}>
                        Before logging out, we highly recommend syncing your scanned data to the Karamale servers. Follow these steps to ensure nothing is lost:{"\n"}{"\n"}
                    <Text style={[styles.textWhite, styles.content, styles.textBold, styles.text16]}>Steps to Sync Data Safely:{'\n'}{'\n'}</Text>
                        
                        {items.map((item, index) => (
                            <View key={index} style={{ flexDirection: 'row', marginBottom: 10 }}>
                                 <Text style={[styles.textWhite, { marginRight: 8, marginBottom:10}]}>{index + 1}.</Text>
                                 <Text style={[styles.textWhite, styles.content, {flex: 1, marginBottom:10}]}>{item}</Text>
                            </View>
                        ))}
                        
                        <Text style={[styles.textWhite, styles.content, styles.textBold, styles.text16]}>{'\n'}Important:{'\n'}{'\n'}</Text>
                        If you skip these steps and there’s unsynced data, it will be permanently lost.{'\n'}

                    </Text>

                    <Text style={[styles.textWhite, styles.content, styles.textBold, styles.text16]}>To download synced data to your device:{'\n'}</Text>
                    <Text style={[styles.textWhite, styles.content]}>
                        Once you've synced and logged out, follow these steps to restore the data to your device:{"\n"}{"\n"}
                        {steps.map((step, index) => (
                            <View key={index} style={{ flexDirection: 'row', marginBottom: 10 }}>
                                 <Text style={[styles.textWhite, { marginRight: 8, marginBottom:10}]}>{index + 1}.</Text>
                                 <Text style={[styles.textWhite, styles.content, {flex: 1, marginBottom:10}]}>{step}</Text>
                            </View>
                        ))}

                        {'\n'}{'\n'}This process will transfer all scanned data to your device, including entries submitted by teammates using other scanners at different entrances.
                    </Text>
                </View>
            </ScrollView>

                <View style={styles.actionButtons}>
                    <Button mode='contained' onPress={logOut} loading={loading} style={[styles.logoutButton, { marginBottom: 10, borderRadius: 5 }]}><Text style={{ fontSize: 16 }}>{logout}</Text></Button>
                    <Button mode='contained' onPress={() => navigation.goBack()} buttonColor='#f3f4f4' textColor='black' style={{ borderRadius: 5 }}><Text style={{ fontSize: 16 }}>Exit</Text></Button>
                </View>
            </View>

        
    )
}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'space-between',
        borderWidth: 1,
        backgroundColor: "#000",
        padding: 20
     },
    
     logoutButton: {
        backgroundColor: 'red'
     },
     textWhite: {
        color: '#ffffff'
     },

     innerContainer: {
        // alignItems: 'center',
        backgroundColor: 'rgba(51,51,51, 0.8)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        height: 'auto'
        // justifyContent: 'space-between'
    },

    actionButtons: {
        flexDirection: 'column'
    },

    heading: {
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center'
        
    },
    content: {
        fontSize: 14.5
    },

    textBold: {
        fontWeight: 'bold'
    },

    text16: {
        fontSize: 16
    }
    
  
  });



export default Logout