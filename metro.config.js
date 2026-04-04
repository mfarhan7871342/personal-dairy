const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];

config.resolver.blockList = [
  /\.local\/skills\/.*/,
  /\.local\/state\/.*/,
];

config.resolver.unstable_conditionNames = ['react-native', 'require', 'default'];

module.exports = config;
