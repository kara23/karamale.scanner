import 'react-native-gesture-handler';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { IconButton, Text, TouchableRipple, Button } from 'react-native-paper';
import { useNavigation, useRoute} from '@react-navigation/native';
import { ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import { View, StyleSheet, Alert, Dimensions, ActivityIndicator, Platform, Linking } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import { Modalize } from 'react-native-modalize';
import Footer from './Footer';
import { useFrameProcessor, useCameraDevice, Camera } from 'react-native-vision-camera';
import { decode, DBRConfig, TextResult } from 'vision-camera-dynamsoft-barcode-reader';
import * as REA from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Polygon, Rect, Svg } from 'react-native-svg';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {useNetInfo} from "@react-native-community/netinfo";
import SoundPlayer from 'react-native-sound-player';

function ScanScreen({route}:any){
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
    const[check, setCheck] = useState(false);
    const [internetConnect, setInternetConnect] = useState('');
    const [scanModal, setScanModal] = useState(400);
    const [scanDetails, setScanDetails] = useState('Place QR code on camera');
    const [validate, setValidate] = useState('null');
    const [channel, setChannel] = useState<string>('');
    const [accountID, setAccountID] = useState<any>(0);
    const [syncingStatusPush, setSyncingStatusPush] = useState(false);
    const [pushLabel, setPushLabel] = useState<any>('Push');
    const [syncLabel, setSyncLabel] = useState<any>("Sync");
    const [count, setCount] = useState(0);
    const [qrcode, setQrcode] = useState<any>(null);
    const [torch, setTorch] = useState<any>('off');
    const [zapIcon, setZapIcon] = useState('zap');
    const [zapIconColor, setZapIconColor] = useState('#b2b200');

    const [syncingStatusPull, setSyncingStatusPull] = useState(false);
    const [pullLabel, setPullLabel] = useState<any>('Pull & Merge');

    const modalScanInSessionRef = useRef<Modalize>(null);
    const modalErrorRef = useRef<Modalize>(null);
    const modalCamPermissionRef = useRef<Modalize>(null);

    const closeError = () => {
        modalErrorRef?.current?.close();
    }

    const openModalScanSession = (channelSelected:string) => {
        if(!netInfo.isConnected && channelSelected == 'live'){
            modalErrorRef?.current?.open();
            return;
        }

        (async () => {
            const status = await Camera.requestCameraPermission();
            if(status === 'denied'){
              modalCamPermissionRef?.current?.open();
              return;
            } else{
              setHasPermission(status === 'authorized');

              modalScanInSessionRef?.current?.open();
              setChannel(channelSelected);
              setScanDetails('Place QR code on camera');
              setValidate('null');
              setTorch('off');
              setZapIcon('zap');
              setZapIconColor('#b2b200');

            }

          })();

    };

    AsyncStorage.getItem('accountID').then((id:any) => {
        setAccountID(id);
      });


    const navigation = useNavigation<any>();
    const {event_id, event_poster_url, event_name, event_day, account_id} = route.params;


    const [hasPermission, setHasPermission] = React.useState(false);
    const [barcodeResults, setBarcodeResults] = React.useState<any>(null);
    const device = useCameraDevice('back');
//     const device = devices.back;

    const getPointsData = (tr:any) => {
        var pointsData = tr.x1 + "," + tr.y1 + " ";
        pointsData = pointsData+tr.x2 + "," + tr.y2 +" ";
        pointsData = pointsData+tr.x3 + "," + tr.y3 +" ";
        pointsData = pointsData+tr.x4 + "," + tr.y4;
        return pointsData;
      }

      const getViewBox = () => {
        const frameSize = getFrameSize();
        const viewBox = "0 0 "+frameSize[0]+" "+frameSize[1];
        return viewBox;
      }

    const getFrameSize = ():number[] => {
        let width:number, height:number;
        let frameWidth = Dimensions.get('window').width;
        let frameHeight = Dimensions.get('window').height;
        if (Platform.OS === 'android') {
          if (frameWidth>frameHeight && Dimensions.get('window').width>Dimensions.get('window').height){
            width = frameWidth;
            height = frameHeight;
          }else {
            // console.log("Has rotation");
            width = frameHeight;
            height = frameWidth;
          }
        } else {
          width = frameWidth;
          height = frameHeight;
        }
        return [width, height];
      }

    const frameProcessor = useFrameProcessor( (frame) => {
        'worklet'
        const config:DBRConfig = {};
        config.template="{\"ImageParameter\":{\"BarcodeFormatIds\":[\"BF_QR_CODE\"],\"Description\":\"\",\"Name\":\"Settings\"},\"Version\":\"3.0\"}"; //scan qrcode only
        config.license = "t0088pwAAAA2VLfVOi+BKiioof3IvI1NbZbJ/HAAXVkvkf/L7M7HcwiabvD4vCiVR2Etk74iGpfZazCNytlp3SXUJwp2htaavOtGn6Mcu2/zxRy10NfULX48ieA==;t0089pwAAAExB6QLyDd7k3gQuT2XwQf0hjxX+xKdgKElhYQx2yaq0pcaTjq3l7ZMHCrk2gh6U8niqlT6vKXNOOYsknQTFn6tpJ7o0qefY5Vg//lKrupl6B2QTIng=";

          console.log('Frame processor running!');
        let settings;


        if(config.template){
            settings = JSON.parse(config.template);
        } else{
            const template =
                `{
                    "ImageParameter": {
                        "Name": "Settings"
                    },
                    "Version": "3.0
                }`;
            settings = JSON.parse(template);
        }
        settings['ImageParameter']['RegionDefinitionNameArray'] = ['Settings'];
        settings['RegionDefinition'] = {
            "Left": 10,
            "Right": 90,
            "Top": 20,
            "Bottom": 65,
            "MeasuredByPercentage": 1,
            "Name": "Settings"
        }
        config.template = JSON.stringify(settings);

        // const results:TextResult[] = decode(frame,config)
        if (frame && config) {
        const results = decode(frame,config)
        if(results[0].barcodeText !== null){

                REA.runOnJS(setBarcodeResults)(JSON.stringify(results[0].barcodeText));
                // console.log(JSON.stringify(results[0].barcodeText));
                }
            }

      }, []);

     function saveLocalQRcodeData() {
        if(barcodeResults === null){
            // do nothing
            return;
        }

        const barcode = barcodeResults;
        let _ticketNumber = '';
        let _cleanTickerNumber =  '';
        let _eventID =  null;
        let _cleanEventID = null;
            if(barcode != null){
                // ------------------------------------------------
                // qrcode format: customer_id-ticket_number-event_id
                // -------------------------------------------------
                _ticketNumber = barcode.split('-')[1]; // retrieve ticker_number from qrcode
                _eventID = barcode.split('-')[2]; // retrieve event_id from the qrcode
                if(_ticketNumber === undefined){

                    setScanDetails('Unidentified ticket. This QR Code was not generated by Karamale.');
                    setValidate('false');

                    try {
                        // play the file tone.mp3
                        SoundPlayer.playSoundFile('fail', 'mp3')
                    } catch (e) {
                        console.log(`cannot play the sound file`, e)
                    }

                    return;

                }

                else{
                    _cleanTickerNumber = _ticketNumber.replace('"', '');  // remove double quotations if there's any
                    // _cleanEventID = _eventID.replace('"', ''); // remove double quotations if there's any
                    _cleanEventID = 251; // remove double quotations if there's any
                }

            }

        const barcodeLength = _cleanTickerNumber.length;
        const Is_EventID_Correct = _cleanEventID;
        // checks if the length of the ticket_number found in the qrcode is 8, if not; the code below will execute.
        if(barcodeLength !== 8){
            console.log(barcodeLength);
            console.log(_cleanTickerNumber);
            setScanDetails('Unidentified ticket. Ticket not generated by Karamale.');
            setValidate('false');

            try {
                // play the file tone.mp3
                SoundPlayer.playSoundFile('fail', 'mp3')
            } catch (e) {
                console.log(`cannot play the sound file`, e)
            }

            return;
        }

        // checks whether or not the event_id found in the qrcode matches the event_id of the event you are currently scanning for, if the match is not found, the code below will execute.
        if (Is_EventID_Correct != event_id){
            console.log("Is_EventID_Correct: "+Is_EventID_Correct);
            console.log("event_id: "+event_id);
            console.log("event_id: "+_cleanTickerNumber);


            setScanDetails('This ticket is valid but it is for a different event. For more details on the ticket, inform the attendee to log onto to karamale.com');
            setValidate('false');

            try {
                // play the file tone.mp3
                SoundPlayer.playSoundFile('fail', 'mp3')
            } catch (e) {
                console.log(`cannot play the sound file`, e)
            }

            return;
        }

        // save ticket status on the mobile if the channel is local
        if(channel == 'local'){
            let qr_code = '';
            if(barcode != null){
                qr_code = _cleanTickerNumber;
            }

            AsyncStorage.getItem(qr_code).then((qrcode) => {
                if(qrcode == qr_code){
                    setScanDetails('Ticket already scanned');
                    setValidate('false');

                    try {
                        // play the file tone.mp3
                        SoundPlayer.playSoundFile('fail', 'mp3')
                    } catch (e) {
                        console.log(`cannot play the sound file`, e)
                    }

                } else{
                    const qrcode = _cleanTickerNumber;
                    AsyncStorage.setItem(qrcode, qrcode);
                    setScanDetails('Successful! Access granted');
                    setValidate('true');

                    try {
                        // play the file tone.mp3
                        SoundPlayer.playSoundFile('success', 'mp3')
                    } catch (e) {
                        console.log(`cannot play the sound file`, e)
                    }

                }
              });

        } else{
            // else send ticket status to the server if the channel is live
            const sendQrcode = barcode.replace('"', '');
            const finalQrcode = sendQrcode.replace('"', '');
            console.log('sendQrcode: ' + sendQrcode);
            console.log('finalQrcode: ' + finalQrcode);
            console.log('event_id: ' + event_id);
            axios.get(`${url}?query=SCAN&kscanner=1&purchase_code=${finalQrcode}&accounttype=business&businessId=${accountID}&userId=1&event_id=${event_id}`,
            {headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        .then((response) => {
            // console.log(response.data);
            // console.log(`${url}?query=SCAN&kscanner=1&purchase_code=${finalQrcode}&accounttype=business&businessId=${accountID}&userId=1&event_id=${event_id}`);
                if(response.data.number == -1 || response.data.number == 1 || response.data.number == 3  || response.data.number == 4){

                    setValidate('false');
                    if(response.data.number == 1){

                         setScanDetails(`${response.data.message1}`);

                    } else{

                        setScanDetails(response.data.message1);

                    }

                    try {
                        // play from url
                        SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/fail.mp3');
                    } catch (e) {
                        console.log(`cannot play the sound file`, e);
                    }

                }

                else if(response.data.number == 2){

                    setValidate('true');
                    setScanDetails(`${response.data.message1}\n${response.data.ticketholder == null ? '' : response.data.ticketholder}${response.data.type}\n${response.data.admission}\n${response.data.group}`);

                    try {
                        // or play from url
                        SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/success.mp3');
                    } catch (e) {
                        console.log(`cannot play the sound file`, e);
                    }

                }

                else{
                    setValidate('false');
                    setScanDetails(`${response.data.message1}`);

                    try {
                        // play from url
                        SoundPlayer.playUrl('https://karamale.com/apps/kscanner/sounds/fail.mp3');
                    } catch (e) {
                        console.log(`cannot play the sound file`, e);
                    }
                }
            })
        }

    }


    // to be removed

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


    const getSales = () => {
        axios.get(`${url}?query=ATTENDENTS-SALES&account_id=${account_id}&event_id=${event_id}`)
        .then((res) => {
            setSales(res.data.sales);
            setTickets(res.data.tickets);
            setPhysical(res.data.physical);
            setDigital(res.data.digital);
            setSpinner(false);
            setAttendees(res.data.attendees);
            console.log(event_id);
        }).catch((error) => {
            console.log(error);
        })
      }


      React.useEffect(() => {
        (async () => {
          const status = await Camera.requestCameraPermission();
          if(status === 'denied'){
            modalCamPermissionRef?.current?.open();
          } else{
            setHasPermission(status === 'authorized');
          }

        })();
        // test();
        saveLocalQRcodeData();
        getSales();
      }, [barcodeResults]);

      const requestCamPermission = () => {
        Linking.openSettings();
      }

      const closeCamPermissionWarning = () => {
        modalCamPermissionRef?.current?.close();
      }

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
        console.log(JSON.stringify(params));
        axios.get(url+"?query=PULL&event_id="+event_id+"&account_id="+account_id+"&keys="+JSON.stringify(params),
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

                setSyncLabel(<Text style={styles.heading}>Sync</Text>);
                setPullLabel(
                    <Text style={{ color:"green", marginLeft: 0, fontWeight:"bold", letterSpacing: 1, marginTop:10 }}>
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
        console.log(url+"?query=PUSH&event_id="+event_id+"&account_id="+account_id+"&keys="+JSON.stringify(params));
        axios.get(url+"?query=PUSH&event_id="+event_id+"&account_id="+account_id+"&keys="+JSON.stringify(params),
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
                <Text style={{ color:"green", marginLeft: 0, fontWeight:"bold", letterSpacing: 1, marginTop:10 }}>
                    {response.data.message}
                </Text>);
            setTimeout(() => {

                setPushLabel("Push");
                setCheckPush(false);
            }, 3000);
            // console.log(response.data);
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

      function handleTorch(){
        if(torch == 'off'){
            setTorch('on');
            setZapIcon('zap-off');
            setZapIconColor('red');
        } else{
            setTorch('off');
            setZapIcon('zap');
            setZapIconColor('#b2b200');
        }

      }

    return (
        // <ScrollView contentContainerStyle={styles.container}>
        <>
        <ScrollView style={{ marginBottom: 40 }}>
             <View style={styles.topContainer}>
            <Text style={styles.heading}>Scanning for...</Text>
            <View style={styles.innerContainerHeader}>
                <View style={styles.row}>
                <TouchableOpacity  style={styles.rowHeading}>
                <Image style={styles.logo} source={{ uri: `${event_poster_url}` }} />
                <Text style={styles.space}>{""}</Text>
                <Text style={styles.buttonLabelsHeading}>{event_name}{"\n"}
                <Text style={styles.smallFont}>{event_day}</Text></Text>
                {/* <Text style={styles.note}>Requires no internet connection. <Text style={styles.readMore}>Read more...</Text></Text> */}
                </TouchableOpacity >
                </View>


            </View>
            <Text style={styles.heading}>
                Medium
                </Text>
            <View style={styles.innerContainer}>
                <TouchableOpacity style={styles.row} onPress={() => openModalScanSession('local')}>
                    <Text style={styles.iconsLocal}>
                        <Icon
                        name='mobile'
                        type='entypo'
                        color='#fff'
                        size={20}
                         />
                    </Text>
                    <Text style={styles.space}>{""}</Text>
                    <Text style={styles.buttonLabels}>Local</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.rowLive} onPress={() => openModalScanSession('live')}>
                    <Text style={styles.iconsLive}>
                        <Icon
                        name='server-outline'
                        type='ionicon'
                        color='#fff'
                        size={20}
                         />
                    </Text>
                    <Text style={styles.space}>{""}</Text>
                    <Text style={styles.buttonLabelsLive}>Live</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.note}>Local or Live scanning. <Text style={[styles.readMore]} onPress={openModalScan}>Learn more...</Text></Text>

            <Text style={{ alignSelf: "flex-start", backgroundColor: netInfo.isConnected ? '#c1e0c1' : '#ffedcc', color:netInfo.isConnected ? 'green' : '#996300', padding: 2, paddingLeft: 5, paddingRight: 5, borderRadius: 5}}>{netInfo.isConnected ? '' : "This device is offline"} {netInfo.type == 'cellular' ? "This device is using mobile data." : netInfo.type == 'wifi' ? 'This device is using wifi' : ''}</Text>
            <Text style={styles.heading}>{syncLabel}</Text>
            {internetConnect.trim() !== '' ? <Text style={{ color: "#996300" }}>{internetConnect}</Text>: ''}
            <View style={styles.innerContainer}>
                <TouchableOpacity style={styles.row} onPress={pull}>
                    <Text style={check ? styles.iconPullPushSuccessful : syncingStatusPull ? styles.iconPullPushLoading: styles.iconsPull}>
                    {syncingStatusPull && <ActivityIndicator color={"grey"} />}
                    {!syncingStatusPull && !check && <Icon
                        name='git-pull-request-outline'
                        type='ionicon'
                        color='#fff'
                        size={20} />}

                        {check && <Icon
                            name='checkmark-outline'
                            type='ionicon'
                            color='green'
                            size={20}/>
                        }
                    </Text>
                    <Text style={styles.space}>{""}</Text>
                    {!syncingStatusPull &&<Text style={styles.buttonLabels}>{pullLabel}</Text>}
                    {syncingStatusPull && <Text  style={styles.buttonLabels}>{pullLabel}</Text> }

                </TouchableOpacity>

                <TouchableOpacity style={styles.rowLive} onPress={push}>
                <Text style={checkPush ? styles.iconPullPushSuccessful : syncingStatusPush ? styles.iconPullPushLoading: styles.iconsPush}>
                {syncingStatusPush && <ActivityIndicator color={"grey"} />}
                    {!syncingStatusPush && !checkPush && <Icon
                        name='repo-push'
                        type='octicon'
                        color='#fff'
                        size={20} />
                        }

                        {checkPush && <Icon
                            name='checkmark-outline'
                            type='ionicon'
                            color='green'
                            size={20}/>
                        }
                    </Text>
                    <Text style={styles.space}>{""}</Text>
                    {!syncingStatusPush &&<Text style={styles.buttonLabelsLive}>{pushLabel}</Text>}
                    {syncingStatusPush && <Text  style={styles.buttonLabelsLive}>{pushLabel}</Text> }
                </TouchableOpacity>
                </View>
                <Text style={styles.note}>This is a Selective Sync. <Text style={[styles.readMore]} onPress={openModal}>Learn more...</Text></Text>

                <Text style={styles.heading}>
                Tickets
                </Text>
                <View style={styles.activityRow}>
                    <View style={styles.activity}>
                            <Text style={styles.activityLabels}>Activity</Text>

                 {spinner ? <ActivityIndicator /> : <View style={{ width: "100%", padding: 5}}>

                      <Text style={{ color:"#000", fontSize: 20, fontWeight:"bold" }}><Text style={{ fontSize: 14 }}>Scanned</Text> {attendees}/{sales}{"\n"}</Text>
                      <Text style={{ fontSize:13 }}>Progress %</Text>
                 <View style={styles.progress}>
                    <Text style={{ height: 15,  backgroundColor:(attendees / sales * 100) < 25 ? 'red' : (attendees / sales * 100) < 50 ? 'orange' : (attendees / sales * 100) < 75 ? '#4ca64c' : '#99cc99', width: `${attendees / sales * 100}%`,borderRadius:5 }}>{""}</Text>
                    <Text style={{ position:"absolute", fontSize: 12,width: "100%", textAlign:"center", paddingTop: 1 }}>{attendees / sales * 100}/100</Text>
                 </View>

                      <Text style={{ fontSize:13,marginTop:4 }}>{(attendees/sales*100) !== 100 ? <Text style={{ color:"red" }}>Incomplete</Text> : <Text style={{ color:"green" }}>Complete</Text>}{"\n"}</Text>
                      {/* <Text style={{ fontSize:13 }}>Accounts for <Text style={{ fontWeight:"bold", fontSize: 18, color:"#39c" }}>{attendees / sales * 100}%</Text></Text> */}


                  </View>
                 }

                    </View>
                        <Text style={{ width: "2%", textAlign:"center", padding: 10, fontWeight:"bold" }}>{""}</Text>
                    <View style={styles.activity}>
                            <Text style={styles.activityLabels}>Sales</Text>
                            {spinner ? <ActivityIndicator /> :
                            <View style={{ width: "100%", padding: 5}}>
                            <Text style={{ color:"#000", fontSize: 20, fontWeight:"bold" }}><Text style={{ fontSize: 14 }}>Sold</Text> {sales}/{tickets}{"\n"}</Text>
                            <Text style={{ fontSize: 13 }}>Physical <Text style={{ fontWeight:"bold", fontSize: 15 }}>{physcal}</Text></Text>
                            <Text style={{ fontSize: 12 }}>Digital <Text style={{ fontWeight:"bold", fontSize: 15 }}>{digital}</Text></Text>
                            <Text style={{ fontSize: 13 }}>Accounts for <Text style={{ fontWeight:"bold", fontSize: 15, color:"#39c" }}>{(sales/tickets*100).toFixed(2)}%</Text></Text>
                            </View>
                            }
                    </View>
            </View>

        </View>

        </ScrollView>
        <Modalize ref={modalScanInSessionRef} modalHeight={500} avoidKeyboardLikeIOS={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
            {device != null &&
                hasPermission && (
                    <View style={styles.cameraView}>

                        {validate == 'null' ? <Text style={[styles.scanResultsLabel, styles.scanResults]}>{scanDetails}</Text> : validate == 'true' ?
                        <Text style={[styles.scanResultsSuccess, styles.scanResults]}>{scanDetails}</Text> :
                        <Text style={[styles.scanResultsFailed, styles.scanResults]}>{scanDetails}</Text>
                        }


                        <Camera
                            style={{
                                height: 500,
                                bottom: 0,
                                width: Dimensions.get("screen").width,
                              }}
                            device={device}
                            isActive={true}
                            frameProcessor={frameProcessor}
                            frameProcessorFps={5}
                            // enableZoomGesture={true}
                            torch={torch}
                        />

                    <Rect
                      x={0.1*getFrameSize()[0]}
                      y={0.2*getFrameSize()[1]}
                      width={0.8*getFrameSize()[0]}
                      height={0.45*getFrameSize()[1]}
                      strokeWidth="2"
                      stroke="red"

                    />


                {/* <Svg style={StyleSheet.absoluteFill} viewBox={getViewBox()}>
                    {barcodeResults != null ?
                        <Polygon
                        points={getPointsData(barcodeResults)}
                        fill="lime"
                        stroke="green"
                        opacity="0.5"
                        strokeWidth="1"
                        />
                        :<></>
                    }

                    </Svg> */}
            <Text style={{ position: "absolute", right:20, bottom: 20,borderWidth: 0, zIndex:10000}} onPress={handleTorch}>
                    <Icon
                        raised
                        name={zapIcon}
                        type='feather'
                        color={zapIconColor}
                        size={18}
                         />
                    </Text>
                    </View>
                )}

        </Modalize>

        <Modalize ref={modalRef} modalHeight={400} avoidKeyboardLikeIOS={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
          <View style={{padding: 30,paddingBottom: 20}}>
          <Text>
                <Text style={{ fontWeight:"bold", fontSize: 18 }}>Selective Sync</Text>{"\n"}
                        <Text style={styles.paragraph}>A Selective Sync allows you to sync data from and to the server, the data that is to be syncronized is for the selected
                        event.{"\n"}{"\n"}
                        There are two ways in which you can sync data, Pull and Push functions allows you to update data on your mobile device and server.{"\n"}{"\n"}
                        <Text style={ {fontWeight:"bold"}}>Pull</Text>{"\n"}
                        This function allows you to download ticket status from the server into your mobile device, the data is uploaded by other scanning team members using Push function, only use this function when there's more than one persons scanning tickets,
                        this enables you to download data from other scanning devices.{"\n"}{"\n"}

                        <Text style={ {fontWeight:"bold"}}>Push</Text>{"\n"}
                        This function allows you to upload ticket scanned data from your mobile device to the server, allowing other scanning team members to download this data using the Pull function onto their mobile devices, whether
                        or not you are scanning alone, always Push data to update the server.{"\n"}{"\n"}

                        <Text style={ {fontWeight:"bold"}}>Conclusion</Text>{"\n"}
                        Using these functions enhances security around the tickets, it helps prevent counterfeit tickets from gaining access to the event, the frequent use
                        of these functions allows all mobile devices to be in sync with each other, therefore protecting your event from counterfeit tickets.{"\n"}{"\n"}

                        Click <Text style={styles.readMore} onPress={() => navigation.navigate('Sync')}>here</Text> for Global Sync
                </Text>
            </Text>
          </View>
        </Modalize>


        <Modalize ref={modalScanRef} modalHeight={400} avoidKeyboardLikeIOS={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
          <View style={{padding: 30,paddingBottom: 20}}>
          <Text>
          <Text style={{ fontWeight:"bold", fontSize: 18 }}>Mediums</Text>{"\n"}{"\n"}
          <Text style={{ fontWeight:"bold", fontSize: 13 }}>Local vs Live</Text>{"\n"}
                        <Text style={styles.paragraph}>
                            Both Local and Live functions are powerful tool you can use to validate the tickets to your event, you might
                            ask: "Which one to use?". <Text style={{ color:"grey" }}>Continue reading below...</Text>{"\n"}{"\n"}
                            <Text style={ {fontWeight:"bold"}}>When to use Local Medium</Text>{"\n"}
                            Use Local Medium if and when the internet connection where you'll be scanning is poor or just can't connect at all, however,
                            the disadvantage with this type of scanning is that the security around the tickets might be compromised as data is only on a single device and not synced
                            with other devices, to avoid this security breach; scan tickets using one device. {"\n"}
                            <Text style={ {fontWeight:"bold", fontSize: 12}}>NB:</Text> <Text style={{ color: "grey", fontSize: 12 }}>Syncing data will require stable internet connection.</Text>
                            {"\n"}{"\n"}
                        <Text style={ {fontWeight:"bold"}}>When to use Live Medium</Text>{"\n"}
                         Use Live Medium only when the internet connection is stable, that way data is automatically synced with all scanning devices; provided other
                         scanning devices are also using Live Medium rather than Local, otherwise they'll need to Pull and Push data to sync.
                </Text>
            </Text>
          </View>
        </Modalize>


        <Modalize ref={modalErrorRef} modalHeight={150} avoidKeyboardLikeIOS={true} disableScrollIfPossible={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
                <View style={{ padding: 30 }}>
                 <Text style={{ color: "#000",fontSize: 18, fontWeight:"bold", width: "100%" }}>Live medium not allowed</Text>
                 <Text style={{ color: "#000" }}>
                    This medium requires internet connection, your device appears to be offline, please connect to the internet if you wish to proceed, alternatively you
                    can use the Local medium.
                </Text>
                  {/* <Button mode='contained' style={{ marginTop: 20, backgroundColor:"red", borderRadius: 7  }} onPress={closeError}><Text style={{ color:"#fff", fontWeight:"bold", fontSize: 16 }}>OK</Text></Button> */}
                </View>
        </Modalize>

        <Modalize onClosed={requestCamPermission} ref={modalCamPermissionRef} modalHeight={230} avoidKeyboardLikeIOS={true} disableScrollIfPossible={true} scrollViewProps={{showsVerticalScrollIndicator: false}}>
                <View style={{ padding: 30 }}>
                 <Text style={{ color: "#000",fontSize: 18, fontWeight:"bold", width: "100%" }}>Camera permission denied</Text>
                 <Text style={{ color: "#000" }}>
                    This alert indicates that you previously/just denied access to camera use, without this permission Kscanner is unable to trigger the scanning functionality.{"\n"}{"\n"}
                    To manually grant permission, tap the button below.
                </Text>
                  <Button mode='contained' style={{ marginTop: 20, backgroundColor:"red", borderRadius: 100  }} onPress={closeCamPermissionWarning}><Text style={{ color:"#fff", fontWeight:"bold", fontSize: 16 }}>Grant permission</Text></Button>
                </View>
        </Modalize>


        <Footer />
        </>
    )
}

const styles = StyleSheet.create({
    progress: {
        width: "100%",
        height: 20,
        borderWidth: .5,
        borderColor: "grey",
        borderRadius: 5,
        padding: 2,
        position: "relative"
    } ,
    activity: {
        padding: 10,
        backgroundColor:"#fff",
        width: "46%",
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 1,
        flexDirection: "row",
        flexWrap:"wrap",
    },

    activityLabels: {
        fontSize: 16,
        color: "#333",
        letterSpacing: 1,
        width: "100%",
        textAlign:"left",
        // borderBottomColor: "silver",
        // borderBottomWidth: .3,
        padding: 5,
        fontWeight: "bold"

    },

    activityRow: {
        marginBottom: 10,
        flexDirection: "row",
        flexWrap:"wrap",
        width: "100%",
        // borderWidth: 1
    },
    scanResultsLabel:{
        color: "#333"
    },

    scanResultsFailed: {
        color: "red",
    },

    scanResultsSuccess: {
        color: "#66b266",
    },
    scanResults: {
        fontSize: 14,
        width: "100%",
        position:"absolute",
        top: 0,
        zIndex:1000,
        backgroundColor:'rgba(255,255,255, 1)',
        textAlign:"left",
        padding: 10,
        borderRadius: 0
    },
    cameraView: {
        position:"relative",
        bottom: 0,
        width: "100%",
        height: 600,
        padding: 0,
        left: 0,
        },
    barcodeText: {
        fontSize: 20,
        color: 'red',
        fontWeight: 'bold',
      },
    topContainer: {
        padding: 15
    },
    paragraph: {
        lineHeight: 19,
        marginBottom: 15,
        fontSize: 13
    },
    smallFont: {
        fontSize: 12,
        color: "grey"
    },
    logo: {
        width: 40,
        height: 40,
        resizeMode: "contain",
        borderRadius: 5,
      },
    space: {
        width: "3%"
    },
    iconsPush: {
        width: "11%",
        backgroundColor: "#de66ac",
        textAlign:"center",
        padding:8,
        borderRadius: 5,
        marginBottom: 5,
    },
    iconPullPushSuccessful: {
        width: "11%",
        backgroundColor: "#c1e0c1",
        textAlign:"center",
        padding:9,
        borderRadius: 5,
        marginBottom: 5,
    },

    iconPullPushLoading: {
        width: "11%",
        backgroundColor: "#dcdcdc",
        textAlign:"center",
        padding:9,
        borderRadius: 5,
        marginBottom: 5,
    },

    iconsPull: {
        width: "11%",
        backgroundColor: "#a64ca6",
        textAlign:"center",
        padding:8,
        borderRadius: 5,
        marginBottom: 5,
    },
    iconsLocal: {
        width: "11%",
        backgroundColor: "#ff7632",
        textAlign:"center",
        padding:8,
        borderRadius: 5,
        marginBottom: 5,
    },
    iconsLive: {
        width: "11%",
        backgroundColor: "#4ca64c",
        textAlign:"center",
        padding:8,
        borderRadius: 5,
        marginBottom: 5,
    },

    buttonLabelsHeading: {
        fontSize: 14,
        color: "#333",
        letterSpacing: 1,
        width: "85%",
        // borderBottomColor: "silver",
        // borderBottomWidth: .2,
        paddingTop: 10,
        paddingBottom: 0,
        fontWeight: "bold"
    },

    buttonLabels: {
        fontSize: 14,
        color: "#333",
        letterSpacing: 1,
        width: "86%",
        borderBottomColor: "silver",
        borderBottomWidth: .3,
        paddingTop: 10,
        fontWeight: "bold"

    },

    buttonLabelsLive: {
        fontSize: 14,
        color: "#333",
        letterSpacing: 1,
        width: "86%",
        paddingTop: 10,
        fontWeight: "bold",

    },

    innerContainerHeader: {
        padding: 10,
        paddingRight: 0,
        backgroundColor:"#fff",
        width: "100%",
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 1,
    },

    innerContainer: {
        padding: 10,
        paddingRight: 0,
        backgroundColor:"#fff",
        width: "100%",
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 1,
    },
    readMore: {
        color: "#287aa3"
    },
    note: {
        color: "grey",
        width: "100%",
        textAlign: "left",
        marginTop: -12,
        marginBottom: 15,
    },

    container: {
        flex: 1,
       justifyContent: 'space-between',
        backgroundColor:"#ececec",
    },
    options: {
        // backgroundColor: 'red'
    },
    row: {
        marginBottom: 5,
        flexDirection: "row",
        flexWrap:"wrap",
    },

    rowLive: {
        marginBottom: -5,
        flexDirection: "row",
        flexWrap:"wrap",
    },
    rowHeading:{
        marginBottom: -10,
        flexDirection: "row",
        flexWrap:"wrap",
        marginTop: 0
    },

    heading: {
        fontWeight: "bold",
        width: "100%",
        color: "#000",
        fontSize: 14,
        marginBottom: 5,
        letterSpacing: 1,
        // borderWidth: 1
    },
    letterSpacing: {
        letterSpacing: 1
    }
})

export default ScanScreen;