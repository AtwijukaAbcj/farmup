const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver to handle react-native-maps on web
config.resolver.alias = {
  ...config.resolver.alias,
  // Mock react-native-maps for web platform
  'react-native-maps': require.resolve('./web-mocks/react-native-maps.js'),
};

// Handle web-specific resolving
config.resolver.platforms = ['web', 'ios', 'android', 'native', 'electron'];

module.exports = config;