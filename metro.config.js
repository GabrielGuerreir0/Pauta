const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@tanstack/react-query' || moduleName === '@tanstack/query-core') {
    return {
      type: 'sourceFile',
      filePath: path.join(__dirname, 'node_modules', moduleName, 'src', 'index.ts'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
