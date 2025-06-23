/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
console.log('Entry point... index.js');
AppRegistry.registerComponent(appName, () => App);
