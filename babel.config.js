module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'react-native-reanimated/plugin',
      {
        globals: ['decode'], // ✅ not '__decode'
      },
    ],
  ],
};