// import 'react-native-gesture-handler';
import React, { useCallback, useRef, useState } from 'react';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { View, StyleSheet, Alert, Dimensions, ActivityIndicator, Platform, Linking, TouchableOpacity } from 'react-native';
import { Image } from 'react-native-elements';
import { Modalize } from 'react-native-modalize';
import Footer from './Footer';
import { useFrameProcessor, useCameraDevices, useCameraDevice, Camera, useCameraFormat } from 'react-native-vision-camera';
import { decode, DBRConfig, TextResult, initLicense } from 'vision-camera-dynamsoft-barcode-reader';
import * as REA from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BottomSheetModalProvider, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNetInfo } from "@react-native-community/netinfo";
import SoundPlayer from 'react-native-sound-player'; // Ensure this is correctly linked/installed
const height = Dimensions.get('window').height;
const snapPoints = ['100%']; // 👈 Fullscreen height
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


console.log('height', height);
// console.log('Hermes enabled:', !!global.HermesInternal);

function ScanScreen({ route }: any) {
    const url = 'https://karamale.com/apps/kscanner/webservices.php';

    const netInfo = useNetInfo();
    const modalRef = useRef<Modalize>(null);
    const openModal = () => modalRef?.current?.open();

    const modalScanRef = useRef<Modalize>(null);
    const openModalScan = () => modalScanRef?.current?.open();

    const [spinner, setSpinner] = useState(true);
    const [attendees, setAttendees] = useState(0);
    const [sales, setSales] = useState(0);
    const [tickets, setTickets] = useState(0);
    const [physcal, setPhysical] = useState(0);
    const [digital, setDigital] = useState(0);
    const [state, setState] = useState<any>({});
    const [checkPush, setCheckPush] = useState(false);
    const [check, setCheck] = useState(false);
    const [internetConnect, setInternetConnect] = useState('');
    const [scanModal, setScanModal] = useState(0);
    const [scanDetails, setScanDetails] = useState('Place QRCode inside the frame');
    const [validate, setValidate] = useState('null');
    const [channel, setChannel] = useState<string>('');
    const [accountID, setAccountID] = useState<any>(0);
    const [syncingStatusPush, setSyncingStatusPush] = useState(false);
    const [pushLabel, setPushLabel] = useState<any>('Push');
    const [syncLabel, setSyncLabel] = useState<any>("Sync");
    const [count, setCount] = useState(0);
    const [qrcode, setQrcode] = useState<any>(null);
    const [torch, setTorch] = useState<any>('off');
    const [zapIcon, setZapIcon] = useState('flash-outline');
    const [zapIconColor, setZapIconColor] = useState('#b2b200');

    const [syncingStatusPull, setSyncingStatusPull] = useState(false);
    const [pullLabel, setPullLabel] = useState<any>('Pull & Merge');

    const modalScanInSessionRef = useRef<Modalize>(null);
    const modalErrorRef = useRef<Modalize>(null);
    const modalCamPermissionRef = useRef<Modalize>(null);

    const closeError = () => {
        modalErrorRef?.current?.close();
    }

    const openModalScanSession = async (channelSelected: string) => {
        setScanModal(height);
      
        if (!netInfo.isConnected && channelSelected === 'live') {
          modalErrorRef?.current?.open?.();
          return;
        }
      
        try {
          const currentStatus = await Camera.getCameraPermissionStatus();
      
          if (currentStatus === 'denied' || currentStatus === 'not-determined') {
            const newStatus = await Camera.requestCameraPermission();
      
            if (newStatus === 'denied') {
              modalCamPermissionRef?.current?.open?.();
              return;
            }
          }
      
          setHasPermission(true);
          setChannel(channelSelected);
          setScanDetails('Place QRCode inside the frame');
          setValidate('null');
          setTorch('off');
          setZapIcon('flash-outline');
          setZapIconColor('#b2b200');
      
          // Delay to allow layout/permission handoff before modal opens
          setTimeout(() => {
            modalScanInSessionRef?.current?.open?.();
          }, 100);
      
          console.log('✅ Camera permission granted & modal opened');
        } catch (err) {
          console.error('❌ Camera permission error:', err);
          modalErrorRef?.current?.open?.();
        }
      };
    

    // --- Start: Moved and improved useEffect for accountID ---
    React.useEffect(() => {
        let isMounted = true;
      
        const getAccountId = async () => {
          try {
            const id = await AsyncStorage.getItem('accountID');
            if (id && isMounted) {
              setAccountID(id);
            }
          } catch (error) {
            console.error('Failed to get accountID from AsyncStorage:', error);
          }
        };
      
        getAccountId();
      
        return () => {
          isMounted = false;
        };
      }, []); // Runs once on component mount
    // --- End: Moved and improved useEffect for accountID ---

    const navigation = useNavigation<any>();
    const { event_id, event_poster_url, event_name, event_day, account_id: route_account_id } = route.params; // Renamed account_id from route.params to avoid collision

    const [hasPermission, setHasPermission] = React.useState(false);
    const [barcodeResults, setBarcodeResults] = React.useState<string | null>(null);
    const device = useCameraDevice('back');

    const cameraFormat = useCameraFormat(device, [
        { videoResolution: { width: 1280, height: 720 } },
        { fps: 60 }
      ])
    

    const getPointsData = (tr: any) => {
        var pointsData = tr.x1 + "," + tr.y1 + " ";
        pointsData = pointsData + tr.x2 + "," + tr.y2 + " ";
        pointsData = pointsData + tr.x3 + "," + tr.y3 + " ";
        pointsData = pointsData + tr.x4 + "," + tr.y4;
        return pointsData;
    }

    const getViewBox = () => {
        const frameSize = getFrameSize();
        const viewBox = "0 0 " + frameSize[0] + " " + frameSize[1];
        return viewBox;
    }

    const getFrameSize = (): number[] => {
        let width: number, height: number;
        let frameWidth = Dimensions.get('window').width;
        let frameHeight = Dimensions.get('window').height;
        if (Platform.OS === 'android') {
            if (frameWidth > frameHeight && Dimensions.get('window').width > Dimensions.get('window').height) {
                width = frameWidth;
                height = frameHeight;
            } else {
                width = frameHeight;
                height = frameWidth;
            }
        } else {
            width = frameWidth;
            height = frameHeight;
        }
        return [width, height];
    }

    // to be removed - Keeping as is for now as it's commented out/for testing
    const test = async () => {
        const result: any = {};
        const keys = await AsyncStorage.getAllKeys();
        for (const key of keys) {
            const val = await AsyncStorage.getItem(key);
            result[key] = val;
        }
        const params = result;
        console.log(JSON.stringify(params));
    }

    // --- Start: Data Fetching Functions (No change, but context is better now) ---
    const getSales = useCallback(() => {
        axios.get(`${url}?query=ATTENDENTS-SALES&account_id=${route_account_id}&event_id=${event_id}`)
            .then((res) => {
                setSales(res.data.sales);
                setTickets(res.data.tickets);
                setPhysical(res.data.physical);
                setDigital(res.data.digital);
                setSpinner(false);
                setAttendees(res.data.attendees);
                console.log(event_id);
            }).catch((error) => {
                console.error("Error fetching sales data:", error);
                setSpinner(false);
            })
    }, [url, route_account_id, event_id]);

    // --- Start: Separate useEffects for initial setup (as discussed) ---
    React.useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
             console.log('Camera permission:', status);
            if (status === 'denied') {
                modalCamPermissionRef?.current?.open();
            } else {
                setHasPermission(status === 'granted');
            }
        })();
    }, []); // Runs ONLY ONCE on mount for camera permissions

    React.useEffect(() => {
        getSales();
    }, [getSales]); // Runs ONLY ONCE on mount for initial data load


    // --- YOUR CORRECTED FRAME PROCESSOR ---
    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'; // THIS IS CRUCIAL for Reanimated worklets
        const config: DBRConfig = {
            license: 't0089pwAAAAhqAOIQo0TYPGYTBXJs713wM0Y8KSfq4WnMQklZceEDwKQxdxT/kwD1o4emp/GIEHNJGXSm1V7gtPnoGtGWdyd+RzdkdYzni3N3/GFZG4J4ARsdIaI=;t0089pwAAAGeNG3AziY6upqaTIDEeNyQX8v073rlYrDc9uWaMcMrnMVwxhFGhcJufnzL+/V/kahGG/IdkhwHdyyE3Ty1vJ1tNv9GJJzWWVyzzxh9e+UMiTyxgIcA=;t0091pwAAAKN/RCIUx/5iVhmrqA7aPXsT3iD+9XlcaNBaUoEjGp+jgbcB628HO9tQV7DS6PBdMlLX3ayRYWUP3h3AgV2f8gPs2fRrndAnYxyvLDPjD2/5QxAnLwshxQ==',
            // template: 'your-template-if-needed',
            isFront: false,
            rotateImage: true,
          
        };


        let settings: any = {
            ImageParameter: {
                Name: "Settings",
                BarcodeFormatIds: ["BF_QR_CODE"]
            },
            Version: "3.0"
        };

        settings.ImageParameter['RegionDefinitionNameArray'] = ['Settings'];
        settings['RegionDefinition'] = {
            "Left": 10,
            "Right": 90,
            "Top": 20,
            "Bottom": 65,
            "MeasuredByPercentage": 1,
            "Name": "Settings"
        };
        config.template = JSON.stringify(settings);

        REA.runOnJS(console.log)('Frame processor running and attempting to decode!');

        try {
           
            const rawResults = decode(frame, config);
            const results: TextResult[] = rawResults ? Object.values(rawResults) : [];
//             const results: TextResult[] = [1,2];
            if (results.length > 0) {
                const firstBarcode = results[0];
                if (firstBarcode && firstBarcode.barcodeText !== null) {
                    REA.runOnJS(setBarcodeResults)(firstBarcode.barcodeText);
                    REA.runOnJS(console.log)('Decoded barcode:', firstBarcode.barcodeText);
                }
            } else {
                // Optional: Clear barcode results if nothing is found to prevent stale data
                // REA.runOnJS(setBarcodeResults)(null);
                REA.runOnJS(console.log)('No barcodes found in this frame.');
            }

        } catch (e) {
            REA.runOnJS(console.error)('Error during barcode decode in worklet:', e);
        }
    }, []); // Removed setBarcodeResults from dependency as it's a stable setter function from useState


    // --- Start: saveLocalQRcodeData logic ---
    const saveLocalQRcodeData = useCallback(() => {
        if (barcodeResults === null) {
            return; // Do nothing if no barcode has been set yet
        }

        const barcode = barcodeResults;
        let _ticketNumber = '';
        let _cleanTickerNumber = '';
        let _eventID_from_barcode: string | null = null;
        let _cleanEventID_from_barcode: number | null = null;

        const parts = barcode.split('-');
        if (parts.length >= 3) {
            _ticketNumber = parts[1];
            _eventID_from_barcode = parts[2];
        } else {
            setScanDetails('Unidentified ticket. This QR Code was not generated by Karamale.');
            setValidate('false');
            try {
                if (netInfo.isConnected) SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/fail.mp3');
                else SoundPlayer.playSoundFile('fail', 'mp3');
            } catch (e) {
                console.error(`Cannot play fail sound:`, e);
            }
            return;
        }

        _cleanTickerNumber = _ticketNumber.replace(/"/g, '');
        _cleanEventID_from_barcode = parseInt(_eventID_from_barcode?.replace(/"/g, '') || '0', 10);


        const barcodeLength = _cleanTickerNumber.length;
        const Is_EventID_Correct = _cleanEventID_from_barcode;

        if (barcodeLength !== 8) {
            console.log("Barcode Length:", barcodeLength);
            console.log("Clean Ticket Number:", _cleanTickerNumber);
            setScanDetails('Unidentified ticket. Ticket not generated by Karamale.');
            setValidate('false');
            try {
                if (netInfo.isConnected) SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/fail.mp3');
                else SoundPlayer.playSoundFile('fail', 'mp3');
            } catch (e) {
                console.error(`Cannot play fail sound:`, e);
            }
            return;
        }

        if (Is_EventID_Correct !== parseInt(event_id, 10)) {
            console.log("Is_EventID_Correct: ", Is_EventID_Correct);
            console.log("event_id from route params: ", event_id);
            setScanDetails('This ticket is valid but it is for a different event. For more details on the ticket, inform the attendee to log onto to karamale.com');
            setValidate('false');
            try {
                if (netInfo.isConnected) SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/fail.mp3');
                else SoundPlayer.playSoundFile('fail', 'mp3');
            } catch (e) {
                console.error(`Cannot play fail sound:`, e);
            }
            return;
        }

        if (channel === 'local') {
            const qr_code_to_save = _cleanTickerNumber;

            AsyncStorage.getItem(qr_code_to_save).then((qrcode_status) => {
                if (qrcode_status === qr_code_to_save) {
                    setScanDetails('Ticket already scanned');
                    setValidate('false');
                    try {
                        if (netInfo.isConnected) SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/fail.mp3');
                        else SoundPlayer.playSoundFile('fail', 'mp3');
                    } catch (e) {
                        console.error(`Cannot play fail sound:`, e);
                    }
                } else {
                    AsyncStorage.setItem(qr_code_to_save, qr_code_to_save);
                    setScanDetails('Successful! Access granted');
                    setValidate('true');
                    try {
                        if (netInfo.isConnected) SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/success.mp3');
                        else SoundPlayer.playSoundFile('success', 'mp3');
                    } catch (e) {
                        console.error(`Cannot play success sound:`, e);
                    }
                }
            }).catch(error => {
                console.error("AsyncStorage error:", error);
                setScanDetails('Error checking local storage.');
                setValidate('false');
            });

        } else {
            const finalQrcode = _cleanTickerNumber;

            console.log('Sending QR code to server:', finalQrcode);
            console.log('Event ID:', event_id);

            axios.get(`${url}?query=SCAN&kscanner=1&purchase_code=${finalQrcode}&accounttype=business&businessId=${accountID}&userId=1&event_id=${event_id}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                })
                .then((response) => {
                    const data = response.data;
                    if ([-1, 1, 3, 4].includes(data.number)) {
                        setValidate('false');
                        setScanDetails(data.message1);
                        try {
                            if (netInfo.isConnected) SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/fail.mp3');
                            else SoundPlayer.playSoundFile('fail', 'mp3');
                        } catch (e) {
                            console.error(`Cannot play fail sound:`, e);
                        }
                    } else if (data.number === 2) {
                        setValidate('true');
                        setScanDetails(`${data.message1}\n${data.ticketholder || ''}${data.type}\n${data.admission}\n${data.group}`);
                        try {
                            if (netInfo.isConnected) SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/success.mp3');
                            else SoundPlayer.playSoundFile('success', 'mp3');
                        } catch (e) {
                            console.error(`Cannot play success sound:`, e);
                        }
                    } else {
                        setValidate('false');
                        setScanDetails(`Unexpected response: ${data.message1 || 'Unknown error'}`);
                        try {
                            if (netInfo.isConnected) SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/fail.mp3');
                            else SoundPlayer.playSoundFile('fail', 'mp3');
                        } catch (e) {
                            console.error(`Cannot play fail sound:`, e);
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error sending QR code to server:", error);
                    setScanDetails("Failed to verify ticket (network error).");
                    setValidate('false');
                    try {
                        if (netInfo.isConnected) SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/fail.mp3');
                        else SoundPlayer.playSoundFile('fail', 'mp3');
                    } catch (e) {
                        console.error(`Cannot play fail sound:`, e);
                    }
                });
        }
    }, [barcodeResults, channel, event_id, accountID, url, netInfo.isConnected]);

    // --- Start: useEffect to trigger saveLocalQRcodeData when barcodeResults changes ---
    React.useEffect(() => {
        if (barcodeResults) {
            saveLocalQRcodeData();
        }
    }, [barcodeResults, saveLocalQRcodeData]);
    // --- End: useEffect to trigger saveLocalQRcodeData when barcodeResults changes ---


    const requestCamPermission = () => {
        Linking.openSettings();
    }

    const closeCamPermissionWarning = () => {
        modalCamPermissionRef?.current?.close();
    }

    const pull = async () => {
        setInternetConnect('');
        if (!netInfo.isConnected) {
            setInternetConnect("This operation requires internet connection.");
            setTimeout(() => {
                setInternetConnect('');
            }, 3000);
        } else {
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
            axios.get(url + "?query=PULL&event_id=" + event_id + "&account_id=" + accountID + "&keys=" + JSON.stringify(params),
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                })
                .then(response => {
                    const data = response.data;
                    for (let i = 0; i < data.length; i++) {
                        let keys = data[i];
                        AsyncStorage.setItem(keys.code, keys.code);
                    }

                    setPullLabel("Merging...");
                    setTimeout(() => {
                        setCheck(true);
                        setSyncingStatusPull(false);
                        setSyncLabel(<Text style={styles.heading}>Sync</Text>);
                        setPullLabel(
                            <Text style={{ color: "#99CC99", marginLeft: 0, fontWeight: 400, letterSpacing: 1, marginTop: 10 }}>
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
                    setInternetConnect("Synchronization failed, please try again.");
                    setSyncLabel(<Text style={styles.heading}>Sync</Text>);
                    setPullLabel("Pull & Merge");
                    setSyncingStatusPull(false);
                    setCheck(false);
                    console.error("Pull error:", error);
                    setTimeout(() => {
                        setInternetConnect('');
                    }, 3000);
                });
        }
    }

    const push = async () => {
        setInternetConnect('');
        if (!netInfo.isConnected) {
            setInternetConnect("This operation requires internet connection.");
            setTimeout(() => {
                setInternetConnect('');
            }, 3000);
        } else {
            setSyncingStatusPush(true);
            setPushLabel('Pushing...');
            setSyncLabel(<Text style={styles.heading}>Syncing...</Text>);
            const result: any = {};
            const keys = await AsyncStorage.getAllKeys();
            for (const key of keys) {
                const val = await AsyncStorage.getItem(key);
                result[key] = val;
            }
            const params = result;
            console.log(url + "?query=PUSH&event_id=" + event_id + "&account_id=" + accountID + "&keys=" + JSON.stringify(params));
            axios.get(url + "?query=PUSH&event_id=" + event_id + "&account_id=" + accountID + "&keys=" + JSON.stringify(params),
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                })
                .then(response => {
                    setCheckPush(true);
                    setSyncingStatusPush(false);
                    setSyncLabel(<Text style={styles.heading}>Sync</Text>);
                    setPushLabel(
                        <Text style={{ color: "#99CC99", marginLeft: 0, fontWeight: 400, letterSpacing: 1, marginTop: 10 }}>
                            {response.data.message}
                        </Text>);
                    setTimeout(() => {
                        setPushLabel("Push");
                        setCheckPush(false);
                    }, 3000);
                })
                .catch((error) => {
                    setInternetConnect("Synchronization failed, please try again.");
                    setSyncLabel(<Text style={styles.heading}>Sync</Text>);
                    setPushLabel("Push");
                    setSyncingStatusPush(false);
                    setCheckPush(false);
                    console.error("Push error:", error);
                    setTimeout(() => {
                        setInternetConnect('');
                    }, 3000);
                });
        }
    }

    function handleTorch() {
        if (torch === 'off') {
            setTorch('on');
            setZapIcon('flash-off-outline');
            setZapIconColor('red');
        } else {
            setTorch('off');
            setZapIcon('flash-outline');
            setZapIconColor('#b2b200');
        }
    }

    return (
        <>
            <ScrollView style={{ backgroundColor: '#000', height: height}}>
                <View style={[styles.topContainer, {marginBottom: 70}]}>
                    <Text style={{ marginBottom: 10, alignSelf: "flex-start", backgroundColor: netInfo.isConnected ? '#c1e0c1' : '#ffcccc', color: netInfo.isConnected ? '#329932' : '#ff3232', padding: 10, paddingLeft: 7, paddingRight: 7, borderRadius: 5, width: "100%" }}>
                       {netInfo.isConnected ? '' : "This device is Offline. Some features and data may not be available."}
                        {netInfo.type === 'cellular' ? "This device is using Mobile Data." : netInfo.type === 'wifi' ? 'This device is using Wi-fi.'  : ''}
                    </Text>
                    <Text style={styles.heading}>Scanning for...</Text>
                    <View style={styles.innerContainerHeader}>
                        <View>
                            <TouchableOpacity style={styles.rowHeading}>
                                <Image style={styles.logo} source={{ uri: `${event_poster_url}` }} />
                                <Text style={styles.space}>{""}</Text>
                                <Text style={styles.buttonLabelsHeading}>{event_name}
                                    {/* <Text style={styles.smallFont}>{event_day}</Text> */}
                                </Text>
                            </TouchableOpacity >
                        </View>
                    </View>
                    <Text style={styles.heading}>Mode</Text>
                    <View style={styles.innerContainer}>
                        
                        <View  style={[!netInfo.isConnected ? styles.panels2 : styles.panels ]}>
                        <TouchableOpacity style={styles.rowLiveLocal} onPress={() => openModalScanSession('local')}>
                            <Text style={styles.iconsLocal}>
                                <Icon
                                    name='cellular-outline'
                                    color='#fff'
                                    size={20}
                                />
                            </Text>
                            {/* <Text style={styles.space}>{""}</Text> */}
                            <Text style={styles.buttonLabels}>Local</Text>
                        </TouchableOpacity>
                        </View>
                        {!netInfo.isConnected ? '' :
                        <View style={styles.panels2}>
                        <TouchableOpacity style={styles.rowLiveLocal} onPress={() => openModalScanSession('live')}>
                            <Text style={styles.iconsLive}>
                                <Icon
                                    name='radio-outline'
                                    color='#fff'
                                    size={20}
                                />
                            </Text>
                            {/* <Text style={styles.space}>{""}</Text> */}
                            <Text style={styles.buttonLabelsLive}>Live</Text>
                        </TouchableOpacity>
                        </View>
                        }
                    </View>
                    <Text style={[styles.note, {marginBottom: 10}]}>Local & Live scanning. <Text style={[styles.readMore]} onPress={openModalScan}>Info</Text></Text>

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
                        <Text style={styles.note}>This is a Selective sync. <Text style={[styles.readMore]} onPress={openModal}>Info</Text></Text>
                    </View>

                    <Text style={styles.heading}>Tickets</Text>

                    <View style={styles.innerContainer}>
                    <View style={styles.panels2}>
                            <TouchableOpacity style={styles.rowLiveLocal}>
                                <Text style={styles.inwardHeading}>Activity</Text>
                            </TouchableOpacity>
                        </View>



                        <View style={styles.panelsProgress}>
                            <View style={styles.ticketActivityProgressView}>
                                    <View style={[styles.panelsActivity, {paddingTop: 0}]}>
                                        <TouchableOpacity style={styles.rowLiveLocal}>
                                            <Text style={styles.ticketActivityLeft}><Icon name='scan-outline' color='#fff' size={20} /></Text>
                                            <Text style={styles.ticketActivityCenter}>Scanned</Text>
                                            <Text style={styles.ticketActivityRight}>{attendees}</Text>
                                        </TouchableOpacity>
                                    </View>

                                <TouchableOpacity style={styles.rowLiveLocal}>
                                    <View style={[styles.panels2, {paddingTop: 10, paddingBottom: 0}]}>
                                        <Text style={styles.ticketActivityLeft}><Icon name='aperture-outline' color='#fff' size={20} /></Text>
                                        <Text style={styles.ticketActivityCenter}>Completed</Text>
                                        <Text style={styles.ticketActivityRight}>{ attendees && sales ? (attendees / sales * 100).toFixed(0) : 0 }%</Text>
                                    </View>
                                </TouchableOpacity>

                            </View>

                        </View>

                        <View style={styles.panels2}>
                            <TouchableOpacity style={styles.rowLiveLocal}>
                                <Text style={styles.inwardHeading}>Sales</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.panelsActivity}>
                            <TouchableOpacity style={styles.rowLiveLocal}>
                            <Text style={styles.ticketActivityLeft}><Icon name='ticket-outline' color='#fff' size={20} /></Text>
                                <Text style={styles.ticketActivityCenter}>Physical</Text>
                                <Text style={styles.ticketActivityRight}>{physcal}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.panelsActivity}>
                            <TouchableOpacity style={styles.rowLiveLocal}>
                                <Text style={styles.ticketActivityLeft}><Icon name='ticket-outline' color='#fff' size={20} /></Text>
                                <Text style={styles.ticketActivityCenter}>Digital</Text>
                                <Text style={styles.ticketActivityRight}>{digital}</Text>
                            </TouchableOpacity>
                        </View>

                        
                        
                        <View style={[styles.panels2, {paddingTop: 10, paddingBottom: 10}]}>
                            <TouchableOpacity style={styles.rowLiveLocal}>
                            <Text style={styles.ticketActivityLeft}><Icon name='pricetags-outline' color='#fff' size={20} /></Text>
                                <Text style={styles.ticketActivityCenter}>Total sales</Text>
                                <Text style={styles.ticketActivityRight}>{sales}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </ScrollView>

            <Modalize
                ref={modalScanInSessionRef}
                alwaysOpen={scanModal}
                handlePosition="inside"
                modalHeight={height}
                modalStyle={styles.modalScanInSession}
                snapPoint={snapPoints}
                closeOnOverlayTap={false}
                childrenStyle={{ height: "100%" }}
                scrollViewProps={{
                    contentContainerStyle: { height: '100%' }, // 👈 crucial
                  }}
                
            >
                 <View style={styles.cameraContainer}>
                    {device && hasPermission && (
                        <><Camera
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={true}
                            format={cameraFormat}
                            pixelFormat="yuv"
                            resizeMode='contain'
                            frameProcessor={frameProcessor}
                            torch={torch}
                            // orientation={"portrait"}
                        />
                        </>)}

                        <View style={styles.scanOverlay}>
                            <View style={styles.scanArea} />
                        </View>
                        <View style={styles.scanDetailsContainer}>
                            <Text style={[styles.scanDetailsText, validate === 'true' ? styles.validateTrue : validate === 'false' ? styles.validateFalse : styles.validateNull]}>
                                {scanDetails}
                            </Text>
                            <View style={styles.cameraControls}>
                                <TouchableOpacity style={styles.controlButton} onPress={handleTorch}>
                                    <Icon name={zapIcon} color={zapIconColor} size={25} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.controlButton} onPress={() => modalScanInSessionRef?.current?.close()}>
                                    <Icon name='close-outline' color='white' size={25} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    
                {/* <BottomSheetModalProvider> */}
                   
                {/* </BottomSheetModalProvider> */}
            </Modalize>

            {/* <Modalize
                ref={modalErrorRef}
                modalHeight={Dimensions.get('window').height * 0.7}
                handlePosition="inside"
                modalStyle={styles.modalError}
                childrenStyle={{ height: "100%" }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <MaterialCommunityIcons name='wifi-off' color='red' size={50} />
                    <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 15, color: '#333' }}>
                        This operation requires an active internet connection. Please check your network settings.
                    </Text>
                    <Button mode="contained" onPress={closeError} style={{ marginTop: 20, backgroundColor: '#FF6347' }}>
                        Close
                    </Button>
                </View>
            </Modalize> */}

            <Modalize
                ref={modalCamPermissionRef}
                modalHeight={280}
                panGestureEnabled={false}
                closeOnOverlayTap={false}
                withHandle={false}
                disableScrollIfPossible={true}
                handlePosition="inside"
                modalStyle={styles.modalError}
                // childrenStyle={{ height: "100%" }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <MaterialCommunityIcons  name='camera-off' color='red' size={50} />
                    <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 15, color: '#333' }}>
                        Camera permission denied. Please enable camera access in your device settings to allow scanning.
                    </Text>
                    <Button mode="contained" onPress={requestCamPermission} style={{ marginTop: 20, backgroundColor: '#007AFF' }}>
                        Go to Settings
                    </Button>
                    {/* <Button mode="text" onPress={closeCamPermissionWarning} style={{ marginTop: 10 }}>
                        Close
                    </Button> */}
                </View>
            </Modalize>

            <Modalize
                ref={modalRef}
                modalHeight={height * 0.7}
                handlePosition="inside"
                modalStyle={styles.modalLearnMore}
            >
                <ScrollView>
                    <Text style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Selective sync{'\n'}</Text>
                    Selective Sync gives you precise control over your event’s ticket data. Using the
                        <Text style={{ fontWeight: 'bold' }}> Pull & Merge</Text> function, your device downloads all new and updated ticket records from the Karamale server and uploads any locally scanned tickets. This ensures both your device and the server are fully synchronized.
                    </Text>
                    <Text style={styles.modalContent}>
                        <Text style={{ fontWeight: 'bold' }}>Push:{'\n'}</Text>Push uploads your locally scanned ticket data to the Karamale server, making it instantly available to the entire scanning team. This ensures that all devices have access to the most up-to-date ticket status, reducing the risk of duplicate scans and improving overall coordination.
                    </Text>
                    <Text style={styles.modalContent}>
                    Regularly using both Pull & Merge and Push keeps your device in perfect sync with the Karamale server.{'\n'}{'\n'}
                    Pull & Merge ensures you're working with the latest ticket data, while Push uploads your local scans so they're recorded centrally and accessible to your entire team.
                    </Text>
                    <View style={{ borderBottomWidth: 1, borderColor: '#dcdcdc', marginBottom: 12 }}></View>
                    <Text style={styles.modalContent}>
                    <Text style={{ fontWeight: 'bold' }}>Together, they form the foundation of reliable event scanning.{'\n'}</Text>
                    Consistent syncing prevents missed scans, avoids duplicate entries, and ensures your event runs smoothly with accurate, up-to-date data across all devices.

                    </Text>
                    <View style={{ borderBottomWidth: 1, borderColor: '#dcdcdc', marginBottom: 12 }}></View>

                    <Text style={styles.modalContent}>
                    <Text style={{ fontWeight: 'bold' }}>Seeing this message?{'\n'}</Text>
                    That means your connection is stable—you're all set to sync your scans and keep your system current.

                    </Text>
                </ScrollView>
            </Modalize>

            <Modalize
                ref={modalScanRef}
                modalHeight={Dimensions.get('window').height * 0.7}
                handlePosition="inside"
                modalStyle={styles.modalLearnMore}
            >
                <ScrollView>
                    <Text style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Local & Live scanning{'\n'}</Text>
                    Selecting between Local and Live scanning modes depends on your event's internet connectivity and how your team operates.{"\n"}{"\n"}
                    {/* <View style={{ borderBottomWidth: 1, borderColor: '#dcdcdc', marginBottom: 12 }}></View> */}
                        <Text style={{ fontWeight: 'bold' }}>Local Scanning{"\n"}</Text>
                        Local Scanning enables ticket checks without a constant internet connection.
                        Your device works with ticket data previously downloaded using the Pull & Merge function. As you scan, all ticket activity is saved locally on that single device. Once you're back online, you can use Push to upload your scans to the server.{'\n'}{'\n'}
                        <Text style={{ fontWeight: 'bold' }}>Important{"\n"}</Text>
                        Local Scanning should be used on only one device per event. Since scan data is stored directly on the device and not synced in real time, using multiple devices in this mode may lead to duplicate entries or missed scans.{'\n'}{'\n'}
                        This mode is ideal for venues with poor or no connectivity, ensuring smooth operation without interruption—just be sure your team is coordinated.
                    </Text>
                    <View style={{ borderBottomWidth: 1, borderColor: '#dcdcdc', marginBottom: 12 }}></View>
                    <Text style={styles.modalContent}>
                        <Text style={{ fontWeight: 'bold' }}>Live Scanning{"\n"}</Text>
                        Live Scanning keeps your device constantly synced with the server during ticket checks. As tickets are scanned, their status is instantly verified and updated in real time—across all devices connected to the event. This ensures your entire team sees up-to-date scan activity and avoids any ticket being scanned twice.{'\n'}{'\n'}
                        <Text style={{ fontWeight: 'bold' }}>Best for:{'\n'}</Text>
                        Environments with reliable internet access where seamless team coordination is important.{'\n'}{'\n'}

                        <Text style={{ fontWeight: 'bold' }}>Multiple devices supported:{'\n'}</Text>
                        Because data syncs in real time, you can safely use multiple scanners for the same event without risking duplicate or missed entries.{'\n'}{'\n'}
                        Live Scanning is ideal when internet connectivity is stable and you want full, real-time visibility across your scanning team.
                    </Text>
                </ScrollView>
            </Modalize>
            <Footer navigation={navigation} route={route} />

            
        </>
    );
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
        fontSize: 14.5,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333'
    },
    modalContent: {
        fontSize: 14.5,
        lineHeight: 24,
        marginBottom: 15,
        color: '#000'
    },
    smallFont: {
        fontSize: 12,
        color: "#ffffff"
    }
});

export default ScanScreen;