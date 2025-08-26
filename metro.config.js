const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.platforms = ['ios', 'android', 'web'];

config.resolver.assetExts.push('bin');

module.exports = config; 