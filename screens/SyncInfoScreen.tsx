import React, { useRef, useState } from 'react'
import { Text, View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modalize } from 'react-native-modalize';
import Footer from './Footer';
const height = Dimensions.get('window').height;

function SyncInfo(){
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
        <>
           <View style={styles.container}>
            
            <Text style={[styles.textWhite, styles.heading]}>Sync Comparison</Text>
            <ScrollView style={{ paddingBottom: 60 }}>
                <View style={styles.innerContainer}>
                    <View style={styles.row}>
                        {/* <Text style={styles.columnHeader}>Feature</Text> */}
                        <Text style={styles.columnHeader}>Selective Sync</Text>
                        <Text style={styles.columnHeader}>Globalnc Sync</Text>
                    </View>

                    <View style={styles.row}>
                        {/* <Text style={[styles.cell, styles.cellBold]}>Scope</Text> */}
                        <Text style={styles.cell}>Sync data for a specific even only</Text>
                        <Text style={styles.cell}>Syncs data for all events in your account</Text>
                    </View>
                    <View style={styles.row}>
                        {/* <Text style={[styles.cell, styles.cellBold]}>Use case</Text> */}
                        <Text style={styles.cell}>Ideal when you're scanning tickets for just one event</Text>
                        <Text style={styles.cell}>Best when you need to update everything across all events</Text>
                    </View>
                    <View style={styles.row}>
                        {/* <Text style={[styles.cell, styles.cellBold]}>Data downloaded</Text> */}
                        <Text style={styles.cell}>Only tickets {'\n'}data related to the selected event</Text>
                        <Text style={styles.cell}>All ticket data for every event</Text>
                    </View>
                    <View style={styles.row}>
                        {/* <Text style={[styles.cell, styles.cellBold]}>Speed &{'\n'}effiency</Text> */}
                        <Text style={styles.cell}>Faster and lighter--uses {'\n'}less bandwidth and storage</Text>
                        <Text style={styles.cell}>Slower and heavier--downloads more data</Text>
                    </View>
                    <View style={styles.row}>
                        {/* <Text style={[styles.cell, styles.cellBold]}>Recommended for</Text> */}
                        <Text style={styles.cell}>Recommended for {'\n'}events with limited internet connectivity or when focusing on one event</Text>
                        <Text style={styles.cell}>Full sync before a major event or when preparing multiple devices</Text>
                    </View>
                    <View style={styles.row}>
                        {/* <Text style={[styles.cell, styles.cellBold]}>Internet{'\n'}required</Text> */}
                        <Text style={styles.cell}>Yes, requires a reliable connection to perform Pull & Merge and Push actions</Text>
                        <Text style={styles.cell}>Yes, also requires a stable connection for complete data transfer</Text>
                    </View>
                    <View style={[styles.rowSummary, {marginBottom: '-25'}]}>
                        <Text style={[styles.cell, styles.cellBold]}>Quick summary</Text>
                    </View>
                    <View style={styles.rowSummary}>
                        {/* <Text style={[styles.cell, styles.cellBold]}>Quick {'\n'}summary</Text> */}
                        <Text style={styles.cell}>Targeted and efficient. Great for syncing just what you need</Text>
                        <Text style={styles.cell}>Comprenhensive and thorough. Best when you want everything up to date</Text>
                    </View>
                </View>
            </ScrollView>
            </View>
            <Footer/>
            </>

        
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

     heading: {
        fontWeight: 400,
        width: "100%",
        color: "#ffffff",
        fontSize: 16,
        marginBottom: 15,
        marginTop: 5,
        letterSpacing: 1,
    },

    rowSummary: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
      },
        row: {
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: '#ddd',
          paddingVertical: 12,
          paddingHorizontal: 8,
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        columnHeader: {
          flex: 1,
          fontWeight: 'bold',
          fontSize: 14,
          color: '#fff',
        },
        cellBold: {
            fontWeight: 'bold'
        },

        cell: {
          flex: 1,
          fontSize: 14,
          color: '#fff',
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
    }
  
  });



export default SyncInfo