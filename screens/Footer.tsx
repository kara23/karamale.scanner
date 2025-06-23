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
const width = Dimensions.get('window').width;

function Footer(){
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

  const screen = route.params?.screen;
    return (
           <View style={styles.menuRow}>
            <View style={[styles.menuItems, screen == 'home' ? styles.activeTap : '']}><Text style={[styles.textCenter, styles.text14, styles.definePadding, {color: screen == 'home' ? '#fff' : '#fff', fontWeight: screen == 'home' ? 'bold' : 'normal'}]} onPress={() => navigation.navigate('Home', {
                    account_id: accountID,
                    screen: 'home'
                })}> <Feather
                name='home'
                color={screen == 'home' ? '#fff' : '#fff'}
                size={25}
                 />
                {'\n'}Home
                </Text>
            </View>
            {/* <View style={styles.menuItems}><Text style={styles.textCenter}> <Icon
                raised
                name='scan-outline'
                type='ionicon'
                color='green'
                size={16}
                onPress={() => navigation.navigate('Scan')} />
                {'\n'}Scan
                </Text>
            </View> */}

            <View style={[styles.menuItems, screen == 'sync' ? styles.activeTap : '']}><Text style={[styles.textCenter, styles.text14, styles.definePadding, {color: screen == 'sync' ? '#fff' : '#fff', fontWeight: screen == 'sync' ? 'bold' : 'normal'}]}  onPress={() => navigation.navigate('Sync', {
                    account_id: accountID,
                    screen: 'sync'
                })} > <Icon
                name='sync-outline'
                color={screen == 'sync' ? '#fff' : '#fff'}
                size={25}
               />
                {'\n'}Sync
                </Text>
            </View>

            <View style={[styles.menuItems, screen == 'sync info' ? styles.activeTap : '']}><Text style={[styles.textCenter, styles.text14, styles.definePadding, {color: screen == 'sync info' ? '#fff' : '#fff', fontWeight: screen == 'sync info' ? 'bold' : 'normal'}]} onPress={() => navigation.navigate('Sync Info', {
                    account_id: accountID,
                    screen: 'sync info'
                })} > <Icon
                // raised
                name='information-circle-outline'
                color={screen == 'sync info' ? '#fff' : '#fff'}
                size={25}
                 />
                {'\n'}Info
                </Text>
            </View>

            <View style={[styles.menuItems, screen == 'logout' ? styles.activeTap : '']}><Text style={[styles.textCenter, styles.text14, styles.definePadding]} onPress={() => navigation.navigate('Logout', {
                    account_id: accountID,
                    screen: 'logout'
                })} > <Icon
                // raised
                name='log-out-outline'
                color='#fff'
                size={25}
                 />
                {'\n'}Log out
                </Text>
            </View>

      <Modalize ref={modalLogoutRef} modalHeight={snapPoints} avoidKeyboardLikeIOS={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
        <ScrollView style={{ padding: 20 }}>
                <View style={{ flex: 1 }}>
                <Text style={{ fontWeight:"bold", fontSize: 15, color: "black" }}>Log out of Kscanner?</Text>
                <Text style={{ marginBottom: 15 }}>You can always log back in at any time.</Text>
                <Text style={{ fontWeight:"bold", fontSize: 15, color: "black" }}>Important.</Text>
                <Text style={{ marginBottom: 25 }}>
                    Before you log out, please sync the scanned data to the server, here's how...{"\n"}{"\n"}
                    1. Cancel this log out screen.{"\n"}
                    2. Tap "Home" on the bottom left of the screen.{"\n"}
                    3. Tap the event you want sync data for.{"\n"}
                    4. Under "Sync" Tap "Push", wait until it finish.{"\n"}
                    5. Then log out. {"\n"}{"\n"}
                    Unless there's nothing to sync, failing to follow the above guidliness will cause you to lose data, and this will be a permanent loss.
                </Text>

                <Text style={{ fontWeight:"bold", fontSize: 15, color: "black" }}>How to download data after syncing?</Text>
                <Text style={{ marginBottom: 25 }}>
                    After syncing and logging out, here's how you can download data back into your device...{"\n"}{"\n"}
                    1. Log in.{"\n"}
                    2. Tap the event you want sync data for.{"\n"}
                    3. Under "Sync" Tap "Pull", wait until it finish.{"\n"}{"\n"}
                    Wala! This process will download all the scanned data into your device including data uploaded from other scanning devices.
                </Text>

                <Button mode='contained' onPress={logOut} buttonColor='red' loading={loading} style={{ marginBottom: 15, borderRadius: 5 }}><Text style={{ fontSize: 16 }}>{logout}</Text></Button>
                <Button mode='contained' onPress={closeModalToggle} buttonColor='#f3f4f4' textColor='black' style={{ borderRadius: 5 }}><Text style={{ fontSize: 16 }}>Cancel</Text></Button>
                </View>
                </ScrollView>
        </Modalize>
        </View>

        
    )
}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'space-between',
        borderWidth: 1
     },
     activeTap: {
        borderTopWidth: 3, 
        borderColor: '#fff'
     },

     definePadding: {
        paddingTop: 10,
     },
    textCenter: {
        textAlign:"center",
        color:"#fff"
    },
    subtItems: {
    backgroundColor: "rgb(255,0,0, 0.4)",
    padding: 10,
    borderRadius: 100,
    borderWidth: 0,
    textAlign:"center",
    alignItems:"center"
    },

    text14:  {
        fontSize: 13.5
    },

    menuItems:{
        width: "24%",
        textAlign: "center",
        fontWeight: 600,
        color: "#fff"
    },
    menuRow: {
        backgroundColor: "#000",
        borderTopWidth: .5,
        borderTopColor: "silver",
        padding: 10,
        paddingTop: 0,
        flexDirection: "row",
        flexWrap:"wrap",
        position:"absolute",
        bottom:0,
        left: 0,
        width: width
        // zIndex: 10000,
    },
  
  });



export default Footer