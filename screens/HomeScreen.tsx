import React, { useState, useRef, useEffect } from 'react'
import { Text, View, StyleSheet, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from './Footer';
import { ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import {useNetInfo} from "@react-native-community/netinfo";
import { Modalize } from 'react-native-modalize';
const height = Dimensions.get('window').height;
import Icon from 'react-native-vector-icons/Ionicons';

function HomeScreen(){
    const netInfo = useNetInfo();
    const route = useRoute();
    const navigation = useNavigation<any>();
    const [businessName, setBusinessName] = useState<any>('--');
    const [accountID, setAccountID] = useState<any>(0);
    const [joinedDate, setJoinedDate] = useState<any>('--');
    const [eventDetails, setEventDetails] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [data, setData] = useState([]);
    const [spinning, setSpinning] = useState(true);
    const modalErrorRef = useRef<Modalize>(null);

   
    AsyncStorage.getItem('accountName').then((accountName) => {
        setBusinessName(accountName);
      });
    
      AsyncStorage.getItem('accountID').then((accountID) => {
        setAccountID(accountID);
      });

      AsyncStorage.getItem('joinedDate').then((joinedDate) => {
        setJoinedDate(joinedDate);
      });
      
    const account_id = route.params?.account_id;
    const url = "https://karamale.com/apps/kscanner/webservices.php?query=ACTIVE-EVENT&accountID="+account_id;
    const base_url = "https://karamale.com/apps/kscanner";

 
    // live stored events
    const activeEvent = async() => {
        try{
      await axios.get(url,
        {headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8'
        }}
      )
      .then((res) => {
       setEventDetails(res.data);
       setSpinning(false);
       setRefreshing(false); 
       const data = res.data;
       if(res.data.length > 0){
       for(var i = 0; i < res.data.length; i++){
        let object = data[i];
        AsyncStorage.setItem(`event_id_${i}`, object.event_id);
        AsyncStorage.setItem(`event_name_${i}`, object.event_name);
        AsyncStorage.setItem(`event_poster_${i}`, object.poster);
        AsyncStorage.setItem(`event_poster_url_${i}`, `${base_url}/posters/${object.account_id}/${object.event_id}/${object.poster}`);
        AsyncStorage.setItem(`account_id_${i}`, `${accountID}`);
        AsyncStorage.setItem(`event_day_${i}`, object.event_day);

       }
    }
        console.log('Pulling information...' + account_id);
      })
      .catch((error) => {
        setEventDetails([]);
        setSpinning(false);
        setRefreshing(false); 
        console.log(error.message);
      });
    } catch(error) {
        console.log(error);
        setSpinning(false);
        setRefreshing(false); 
        setEventDetails([]);
    }
    }


    const onRefresh = React.useCallback(() => {
            setRefreshing(true);
            setSpinning(true);
            console.log('Refreshing...');
            activeEvent();
            
      }, []);

    // locally stored events
    const events = async () => {
        const result: any = {};
        const keys = await AsyncStorage.getAllKeys();
        for (const key of keys) {
            const val = await AsyncStorage.getItem(key);
        result[key] = val;
        }

        const param = [result];
        let eventInfo:any = [];
        for(var i = 0; i < keys.length; i++){
            
                let event_name = await AsyncStorage.getItem(`event_name_${i}`);
                let event_id = await AsyncStorage.getItem(`event_id_${i}`);
                let event_poster = await AsyncStorage.getItem(`event_poster_${i}`);
                let event_poster_url = await AsyncStorage.getItem(`event_poster_url_${i}`);
                let event_day = await AsyncStorage.getItem(`event_day_${i}`);

                if(event_name !== null){
                    eventInfo[i] = {"event_name": event_name, "event_poster": event_poster, "event_id": event_id, "event_poster_url": event_poster_url, "event_day": event_day};
                } 
        }

        const data = eventInfo;
        setData(data);
    }


        
       const details = netInfo.isConnected ? 
    
        <>{eventDetails.length == 0 ? <Text>This account has no event</Text>: eventDetails.map((item:any) => (
            <View key={item.event_id}>{item.event_name !== null || item.event_name !== '' || item.event_name !== undefined ?
                <TouchableOpacity  style={styles.row} key={item.event_id} onPress={() => navigation.navigate("Scan", {
                    event_id: item.event_id,
                    event_name: item.event_name,
                    event_poster: item.poster,
                    event_poster_url: `${base_url}/posters/${account_id}/${item.event_id}/${item.poster}`,
                    account_id: item.account_id
                })}>
                <Image style={styles.logo} source={{ uri: `${base_url}/posters/${account_id}/${item.event_id}/${item.poster}` }} />
                <Text style={styles.space}></Text>
                <View style={styles.buttonLabelsView}>
                    <Text style={styles.buttonLabels}>{item.event_name}</Text>
                    <Text style={styles.smallFont}>Happening... {item.event_day}</Text>
                    <Text style={{ alignSelf: 'flex-end', marginTop: '-30', marginRight: 5 }}>
                            <Icon
                            name="chevron-forward"
                            size={24}
                            color="#fff"
                            style={{ marginLeft: 0, fontSize: 30 }}
                            onPress={() => navigation.goBack()}
                        />
                    </Text>
                </View>
                </TouchableOpacity >
                : <Text>{""}</Text>}
                </View>
            
        ))}</>

       : data.map((item:any, index) => {
            return (
                <View key={index}>
                {item.event_poster_url !== undefined || item.event_name !== undefined || item.event_day !== undefined ? 
                
                <TouchableOpacity  style={[styles.row]} onPress={() => navigation.navigate("Scan", {
                    event_id: item.event_id,
                    event_name: item.event_name,
                    event_poster: item.event_poster,
                    event_poster_url: `${item.event_poster_url}`,
                    account_id: account_id
                })}>
                    <Image style={styles.logo} source={{ uri: `${item.event_poster_url}` }} />
                    <Text style={styles.space}></Text>
                    <View style={styles.buttonLabelsView}>
                        <Text style={styles.buttonLabels}>{item.event_name}</Text>
                        <Text style={styles.smallFont}>Happening... {item.event_day}</Text>
                        <Text style={{ alignSelf: 'flex-end', marginTop: '-30', marginRight: 5 }}>
                            <Icon
                            name="chevron-forward"
                            size={24}
                            color="#fff"
                            style={{ marginLeft: 0, fontSize: 30 }}
                            onPress={() => navigation.goBack()}
                        />
                    </Text>
                    </View>
                   
                </TouchableOpacity >
                
                : ''}
                
                </View>
            )
    });


    const checkConnection = () => {
        if (netInfo.isConnected && netInfo.isInternetReachable) {
        //   console.log('You are online' + " " + netInfo.isConnected);
        } else {
            // console.log('You are offline!');
        }
      };

    useEffect(() => {
        console.log(account_id);
            activeEvent();
            events();
            checkConnection();
        }, []);
        
        const closeModal = () => {
            modalErrorRef?.current?.close();
          }

          const accountDetails = () => {
            modalErrorRef?.current?.open();
          }

return (
    <>
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.topContainer}>

        <View style={styles.profileContainer}>
                <TouchableOpacity  style={styles.row} onPress={accountDetails}>
               {/* <Icon
                raised
                name='person-circle-outline'
                type='ionicon'
                color='#f50'
                size={40}
                onPress={() => navigation.navigate('Home')} /> */}

                {/* <Text style={styles.space}></Text> */}
                <View style={{ paddingBottom: 5 }}>
                    <Text style={styles.details}>{businessName.length > 35 ? businessName.slice(0, 35)+"..." : businessName}</Text>
                    <Text style={styles.smallFont}><Text style={{ fontWeight:"bold" }}>Joined:</Text> {joinedDate}</Text>
                </View>
                {/* <Text style={styles.note}>Requires no internet connection. <Text style={styles.readMore}>Read more...</Text></Text> */}
                </TouchableOpacity >
                
            </View>
        <Text style={styles.heading}>Events</Text>
        {/* <Text style={{ marginTop: -5, color: "grey",marginBottom: 15, fontSize: 12 }}>Don't see your events? Pull down the screen to refresh.</Text> */}
                    
                    <View style={styles.innerContainer}>

                    {spinning && <><ActivityIndicator color={"#fff"} /></>}
                    {details}
                    {eventDetails.length >= 1 ? 
                        <Text style={{ width: "100%", textAlign:"center",color:"red" }}>
                            <Image style={styles.logoBottom} source={require('../assets/karamale.png')} />
                        </Text> : ''
                    }

                        {/* {eventDetails.length == 0 ? <Text>This account has not event</Text>: eventDetails.map((item:any) => (
                            <>{item.event_name !== null || item.event_name !== '' || item.event_name !== undefined ?
                                <TouchableOpacity  style={styles.row} key={item.event_id} onPress={() => navigation.navigate("Scan", {
                                    event_id: item.event_id,
                                    event_name: item.event_name,
                                    event_poster: item.poster,
                                    event_poster_url: `${base_url}/posters/${account_id}/${item.event_id}/${item.poster}`,
                                    account_id: account_id
                                })}>
                                <Image style={styles.logo} source={{ uri: `${base_url}/posters/${account_id}/${item.event_id}/${item.poster}` }} />
                                <Text style={styles.space}></Text>
                                <Text style={styles.buttonLabels}>{item.event_name}{"\n"}
                                <Text style={styles.smallFont}>{item.event_day}</Text></Text>
                                </TouchableOpacity >
                                : <Text>{""}</Text>}</>
                            
                        ))} */}
                    </View>
            </View>

           

    </ScrollView>
    <Modalize ref={modalErrorRef} modalHeight={210} avoidKeyboardLikeIOS={true} disableScrollIfPossible={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
                <View style={{ padding: 30 }}>
                 <Text style={{ color: "#000",fontSize: 18, fontWeight:"bold", width: "100%" }}>Account details</Text>
                 <Text style={{ color: "grey" }}>
                    <Text style={styles.textBold}>Name:</Text> {businessName}{"\n"}
                    <Text style={styles.textBold}>Joined:</Text> {joinedDate}{"\n"}{"\n"}
                    <Text style={styles.textBold}>You currently have {data.length == 0 || data.length >= 2 ? eventDetails.length + ' Events' : data.length + ' Event'}</Text>
                </Text>
                  <Button mode='contained' style={{ marginTop: 20, backgroundColor:"red", borderRadius: 5  }} onPress={closeModal}><Text style={{ color:"#fff", fontWeight:"bold", fontSize: 16 }}>Close</Text></Button>
                </View>
        </Modalize>
    
    <Footer />
    </>
)
}


const styles = StyleSheet.create({
    textBold: {
        fontWeight: "bold",
        fontSize: 13
    },

    smallFont: {
        fontSize: 12,
        color: "#ffffff",
        fontWeight: 400
    },
    topContainer: {
        padding: 15,
        backgroundColor: "#000000",
        height: height
    },

    profileContainer: {
        padding: 0,
        paddingLeft: 10,
        paddingRight: 0,
        backgroundColor:"rgba(51,51,51, 0.8)",
        width: "100%",
        borderRadius: 10,
        marginBottom: 15,
        marginTop: 10
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 1,
        // shadowRadius: 2,
        // elevation: 1,
    },
    innerContainer: {
        padding: 10,
        paddingRight: 0,
        backgroundColor:"rgba(51,51,51, 0.8)",
        width: "100%",
        borderRadius: 10,
        marginBottom: 15,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 1,
        shadowRadius: 2,
        // elevation: 1,
    },
    row: {
        marginBottom: 8,
        marginTop: 8,
        flexDirection: "row",
        flexWrap:"wrap",
    },

    rowLive: {
        marginBottom: -5,
        flexDirection: "row",
        flexWrap:"wrap",
    },
    space: {
        width: "3%"
    },
    iconsLocal: {
        width: "10%",
        padding:5,
        borderRadius: 5,
        marginBottom: 5,
    },
  
    details: {
        fontSize: 16,
        color: "#ffffff",
        letterSpacing: 1,
        width: "100%",
        fontWeight: "500",
        paddingTop: 5,
        paddingBottom: 5,
    },

    buttonLabelsView: {
        width: "86%",
        borderBottomColor: "#ececec",
        borderBottomWidth: 1,
        paddingTop: 2,
        paddingBottom: 13

    },

    buttonLabels: {
        fontSize: 14.5,
        color: "#ffffff",
        letterSpacing: 1,
        width: "86%",
        fontWeight: 400,

    },

    buttonLabelsLive: {
        fontSize: 14.5,
        color: "#333",
        letterSpacing: 1,
        width: "86%",
        paddingTop: 5,
        fontWeight: 400,

    },

    logoBottom: {
        width: 70,
        height: 30,
        padding: 0,
        resizeMode: "contain"
      },

    logo: {
        width: 40,
        height: 40,
        resizeMode: "cover",
        borderRadius: 100,
        // borderWidth: 1,
        // borderColor: "red",
        // borderStyle: "solid"
      },
    activeEvent: {
        textAlign:"center",
        fontSize: 18,
        fontWeight: "bold",
    },
    heading: {
        fontWeight: "400",
        width: "100%",
        color: "#ffffff",
        fontSize: 16,
        marginBottom: 15,
        marginTop: 15,
        letterSpacing: 1,
    },
    textInput: {
        alignSelf: "stretch",
        marginHorizontal: 12,
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "grey",
        color: "white",
        textAlign: "center",
      },
    contentContainer: {
        flex: 1,
        alignItems: "center",
      },
   
})
export default HomeScreen;