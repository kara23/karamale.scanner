import React, { useRef, useState } from 'react'
import { Text } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Modalize } from 'react-native-modalize';
import {useNetInfo} from "@react-native-community/netinfo";
import Footer from './Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const height = Dimensions.get('window').height;

function SyncScreen(){
    const url = 'https://karamale.com/apps/kscanner/webservices.php';
    const [syncingStatusPush, setSyncingStatusPush] = useState(false);
    const [pushLabel, setPushLabel] = useState<any>('Push');
    const [syncLabel, setSyncLabel] = useState<any>("Global sync");
    const [internetConnect, setInternetConnect] = useState('');
    const [accountID, setAccountID] = useState<any>(0);

    const [syncingStatusPull, setSyncingStatusPull] = useState(false);
    const [pullLabel, setPullLabel] = useState<any>('Pull & Merge');

    const [checkPush, setCheckPush] = useState(false);
    const[check, setCheck] = useState(false);

    const netInfo = useNetInfo();
    const modalRef = useRef<Modalize>(null);
  const openModal = () => modalRef?.current?.open();
    const navigation = useNavigation();

    AsyncStorage.getItem('accountID').then((id:any) => {
        setAccountID(id);
      });

    const pull = async () => {
        setInternetConnect('');
        if(!netInfo.isConnected){
            setInternetConnect("This operation requires internet connection.");
            setTimeout(() => {
                setInternetConnect('');
            }, 3000);
        } else{
            setPullLabel('Pulling...');
        setSyncingStatusPull(true);
        
        setSyncLabel(<Text style={styles.heading}>Syncing...</Text>);
        const result: any = {};
        const keys = await AsyncStorage.getAllKeys();
        for (const key of keys) {
        const val = await AsyncStorage.getItem(key);
        result[key] = val;
        
        }
        const params = result;
        // console.log(route.params);
        // console.log(event_id);
        // console.log(JSON.stringify(params));
        axios.get(url+"?query=PULL&account_id="+accountID+"&keys="+JSON.stringify(params),
            {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        .then(response => {
            const data = response.data;
            for(var i = 0; i < data.length; i++){
                let keys = data[i];
                AsyncStorage.setItem(keys.code, keys.code);
            }

            setPullLabel("Merging...");
            setTimeout(() => {
                setCheck(true);
                setSyncingStatusPull(false);
                
                setSyncLabel(<Text style={styles.heading}>Global sync</Text>);
                setPullLabel(
                    <Text style={{ color:"#99CC99", marginLeft: 0, fontWeight:400, letterSpacing: 2, marginTop:10 }}>      
                        Successful
                    </Text>);
            }, 6000);

            setTimeout(() => {
                setPullLabel("Pull & Merge");
                setCheck(false);
            }, 9000);
            console.log(response.data);
        })
        .catch((error) => {
            setInternetConnect("Syncronization failed, please try again.");
            setSyncLabel(<Text style={styles.heading}>Sync</Text>);
            setPullLabel("Pull & Merge");
            setSyncingStatusPull(false);
            setCheck(false);
            console.log(error);

            setTimeout(() => {
                setInternetConnect('');
            }, 3000);
        });
    }
      }

      const push = async () => {
        setInternetConnect('');
        if(!netInfo.isConnected){
            setInternetConnect("This operation requires internet connection.");
            setTimeout(() => {
                setInternetConnect('');
            }, 3000);
        } else{
        setSyncingStatusPush(true);
        setPushLabel('Pushing...');
        setSyncLabel(<Text style={styles.heading}>Syncing...</Text>);
        const result: any = {};
        const keys = await AsyncStorage.getAllKeys();
        for (const key of keys) {
        const val = await AsyncStorage.getItem(key);
        result[key] = val;
        }
        console.log(result);
        const params = result;

        axios.get(url+"?query=PUSH&account_id="+accountID+"&keys="+JSON.stringify(params),
            {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        .then(response => {
            setCheckPush(true);
            setSyncingStatusPush(false);
            setSyncLabel(<Text style={styles.heading}>Global sync</Text>);
            setPushLabel(
                <Text style={{ color:"#99CC99", marginLeft: 0, fontWeight:400, letterSpacing: 2, marginTop:10 }}>      
                    {response.data.message}
                </Text>);
            setTimeout(() => {

                setPushLabel("Push");
                setCheckPush(false);
            }, 3000);
        })
        .catch((error) => {
            setInternetConnect("Syncronization failed, please try again.");
            setSyncLabel(<Text style={styles.heading}>Sync</Text>);
            setPushLabel("Push");
            setSyncingStatusPush(false);
            setCheckPush(false);
            console.log(error);

            setTimeout(() => {
                setInternetConnect('');
            }, 3000);
        });
    }
      }
    
    return (
        <>
        <ScrollView style={{ backgroundColor: '#000', height: height}}>
            <View style={styles.topContainer}>
            <Text style={{ alignSelf: "flex-start", backgroundColor: netInfo.isConnected ? '#c1e0c1' : '#ffcccc', color:netInfo.isConnected ? '#329932' : '#ff3232', padding: 10, paddingLeft: 7, paddingRight: 7, borderRadius: 5, marginBottom: 15, width: '100%'}}>{netInfo.isConnected ? '' : "This device is Offline. The Sync feature is not available."} {netInfo.type == 'cellular' ? "This device is using mobile data." : netInfo.type == 'wifi' ? 'This device is using wifi' : ''}</Text>
           
            {internetConnect.trim() !== '' ? <Text style={{ color: "#996300" }}>{internetConnect}</Text>: ''}
            
            
            <View style={[ !netInfo.isConnected ? {display: 'none'} : '' ]}>
                        <Text style={styles.heading}>{syncLabel}</Text>
                        {internetConnect.trim() !== '' ? <Text style={{ color: "#996300" }}>{internetConnect}</Text> : ''}
                            <View style={styles.innerContainer}>
                            <View style={styles.panels}>
                                <TouchableOpacity style={styles.rowLiveLocal} onPress={pull}>
                                    <Text style={check ? styles.iconPullPushSuccessful : syncingStatusPull ? styles.iconPullPushLoading : styles.iconsPull}>
                                        {syncingStatusPull && <ActivityIndicator color={"#fff"} />}
                                        {!syncingStatusPull && !check && <Icon
                                            name='git-merge-outline'
                                            color='#fff'
                                            size={20} />}

                                        {check && <Icon
                                            name='checkmark-outline'
                                            color='#99CC99'
                                            size={20} />}
                                    </Text>
                                    {/* <Text style={styles.space}>{""}</Text> */}
                                    {!syncingStatusPull && <Text style={styles.buttonLabels}>{pullLabel}</Text>}
                                    {syncingStatusPull && <Text style={styles.buttonLabels}>{pullLabel}</Text>}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.panels2}>
                                <TouchableOpacity style={styles.rowLiveLocal} onPress={push}>
                                    <Text style={checkPush ? styles.iconPullPushSuccessful : syncingStatusPush ? styles.iconPullPushLoading : styles.iconsPush}>
                                        {syncingStatusPush && <ActivityIndicator color={"#ffffff"} />}
                                        {!syncingStatusPush && !checkPush && <Icon
                                            name='git-pull-request-outline'
                                            color='#fff'
                                            size={20} />
                                        }

                                        {checkPush && <Icon
                                            name='checkmark-outline'
                                            color='#99CC99'
                                            size={20} />
                                        }
                                    </Text>
                                    {/* <Text style={styles.space}>{""}</Text> */}
                                    {!syncingStatusPush && <Text style={styles.buttonLabelsLive}>{pushLabel}</Text>}
                                    {syncingStatusPush && <Text style={styles.buttonLabelsLive}>{pushLabel}</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.note}>We recommend syncing the data for the event you're currently scanning. <Text style={[styles.readMore]} onPress={openModal}>Learn more...</Text></Text>
           
                    </View>

            
            
        </View>
        
        </ScrollView>

        <Modalize ref={modalRef} modalHeight={400} avoidKeyboardLikeIOS={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
          <View style={{padding: 20, paddingBottom: 20}}>
          <Text>
                <Text style={{ fontWeight:"bold", fontSize: 18 }}>Global sync</Text>{"\n"}
                        <Text>Global Sync syncs data both to and from the server for all your events. In contrast, Selective Sync only syncs data for a specific event—typically the one you're actively scanning.                        .{"\n"}{"\n"}
                        There are two ways to sync data: Pull and Push. {"\n"}{"\n"}
                        <Text style={ {fontWeight:"bold"}}>Pull</Text>{"\n"}
                        Updates your device with the latest data from the server, ensuring you have the most current ticket scans and status changes made by your team.{"\n"}{"\n"}
                        It's especially useful when multiple scanners are in use—Pull collects data uploaded by others, keeping your device fully in sync with the event’s live status. To avoid scanning duplicates or out-of-date tickets, we recommend using Pull regularly, especially before and during active scanning{'\n'}{'\n'}

                        <Text style={ {fontWeight:"bold"}}>Push</Text>{"\n"}
                        Sends scanned ticket data from your device to the server, making it accessible to other team members in real time. This ensures everyone on your scanning team has a consistent view of which tickets have already been used.{"\n"}{"\n"}
                        Use Push after scanning new tickets or making changes locally, especially before logging out, to avoid any data gaps or conflicts across devices.{'\n'}{'\n'}

                        <Text style={ {fontWeight:"bold"}}>Conclusion</Text>{"\n"}
                        Using the Pull and Push sync functions is essential for maintaining ticket security. By keeping all devices updated in real time, you minimize the risk of unauthorized access and ensure that counterfeit tickets are flagged before they become a problem. Frequent syncing keeps your scanning team coordinated and your event protected.
                </Text>
            </Text>
          </View>
        </Modalize>
        
        <Footer />
        </>
    )
}


const styles = StyleSheet.create({
    topContainer: {
        flex: 1,
        backgroundColor: '#000000',
        padding: 20,
        paddingBottom: 0,
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

    innerContainerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(51,51,51, 0.8)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
    },

      
    panelsProgress: {
        borderBottomWidth: 1,
        paddingBottom: 11,
        paddingTop:10,
        borderBottomColor: "#ececec",
        width: '100%'
    },

    panelsCompletion: {
        width: '100%',
        flexDirection:"row",
        flex: 1,
        paddingBottom: 7,
        paddingTop:2,
    },

    panelsActivity: {
        width: '100%',
        flexDirection:"row",
        flex: 1,
        borderBottomWidth: 1,
        paddingBottom: 10,
        paddingTop:10,
        borderBottomColor: "#ececec"
    },
   
    panels: {
        width: '100%',
        flexDirection:"row",
        flex: 1,
        borderBottomWidth: 1,
        paddingBottom: 7,
        paddingTop:2,
        borderBottomColor: "#ececec"
    },

    panels2: {
        width: '100%',
        flexDirection:"row",
        flex: 1,
        paddingBottom: 7,
        paddingTop:2,
    },

    innerContainer: {
        // flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(51,51,51, 0.8)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        justifyContent: 'space-between'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        padding: 10,
        backgroundColor: '#006600',
        borderRadius: 10,
        marginRight: 5
    },
    rowLiveLocal: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        padding: 0,
        borderRadius: 10,
        marginLeft: 0,
        width: '100%'
    },
    rowHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        padding: 0,
        borderRadius: 10
    },
    logo: {
        width: 40,
        height: 40,
        resizeMode: "cover",
        borderRadius: 100,
      },

      divider: {
        borderBottomColor: '#ececec',
        borderBottomWidth: 1,
        width: "100%",
        flex: 1,
        flexDirection:"row",
    },

    inwardHeading: {
        width: '100%', 
        color: '#ffffff', 
        textAlign: 'left', 
        fontSize: 16, 
        paddingTop: 10, 
        paddingBottom: 0, 
        fontWeight: 'bold'
    },
    
    ticketActivityProgressView: {
        width: '100%'
    },
    ticketActivityProgress: {
        color: '#fff',
        fontSize: 14.5,
        fontWeight: 400,
    },

    ticketActivityCenter: {
        color: '#fff',
        fontSize: 14.5,
        fontWeight: 400,
        width: '46%'
    },

    ticketActivityLeft: {
        color: '#fff',
        fontSize: 14.5,
        fontWeight: 400,
        width: '8%'
    },

    ticketActivityRight: {
        color: '#fff',
        fontSize: 14.5,
        fontWeight: 400,
        width: '46%',
        textAlign: 'right'
    },

    buttonLabels: {
        color: '#fff',
        fontSize: 14.5,
        fontWeight: 400,
    },
    buttonLabelsLive: {
        color: '#fff',
        fontSize: 14.5,
        fontWeight: 400
    },
    buttonLabelsHeading: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 400,
        marginTop:'-5'
    },
    iconsLocal: {
        // backgroundColor: "#005500",
        borderRadius: 50,
        height: 30,
        width: 30,
        paddingTop: 7,
        textAlign: "left"
    },
    iconsLive: {
        // backgroundColor: "#002255",
        borderRadius: 50,
        height: 30,
        width: 30,
        paddingTop: 7,
        textAlign: "left"
    },
    iconsPull: {
        // backgroundColor: "#005500",
        borderRadius: 50,
        height: 30,
        width: 30,
        paddingTop: 7,
        textAlign: "left"
    },
    iconPullPushSuccessful: {
        // backgroundColor: "#c1e0c1",
        borderRadius: 50,
        height: 30,
        width: 30,
        paddingTop: 7,
        textAlign: "left"
    },
    iconPullPushLoading: {
        // backgroundColor: "#f4f4f4",
        borderRadius: 50,
        height: 30,
        width: 30,
        paddingTop: 7,
        textAlign: "left"
    },
    iconsPush: {
        // backgroundColor: "#002255",
        borderRadius: 50,
        height: 30,
        width: 30,
        paddingTop: 7,
        textAlign: "left"
    },
    space: {
        width: 10
    },
    note: {
        fontSize: 15,
        color: '#888',
        marginTop: -10,
        marginBottom: 15,
        alignSelf: "flex-start",
        borderWidth: 1,
        width: "100%"
    },
    readMore: {
        color: '#3399CC',
        fontWeight: 400,
        alignSelf: 'flex-end'
    },
    activityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    activity: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        padding: 15
    },
    activityLabels: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "#000"
    },
    progress: {
        width: "100%",
        backgroundColor: "#f4f4f4",
        height: 10,
        borderRadius: 50,
        position: "relative",
        marginTop: 5,
        overflow: "hidden"
    },
    modalScanInSession: {
        backgroundColor: 'black',
        flex: 2,
        margin: 0,
        position: 'relative',
    },
    cameraContainer: {
        flex: 1,
        position: 'relative'
    },
    scanOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scanArea: {
        width: Dimensions.get('window').width * 0.7,
        height: Dimensions.get('window').width * 0.7,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 10,
    },
    scanDetailsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 20,
        alignItems: 'center',
    },
    scanDetailsText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: 'bold',
    },
    validateTrue: {
        color: 'lightgreen',
    },
    validateFalse: {
        color: 'red',
    },
    validateNull: {
        color: 'white',
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    controlButton: {
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    modalError: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    modalLearnMore: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333'
    },
    modalContent: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 15,
        color: '#555'
    },
    smallFont: {
        fontSize: 12,
        color: "#ffffff"
    }
});

export default SyncScreen;