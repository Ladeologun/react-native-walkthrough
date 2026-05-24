const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {Promise<import('metro-config').MetroConfig>}
 */
module.exports = (async () => {
  const { withMetroConfig } = await import('react-native-monorepo-config');

  return withMetroConfig(getDefaultConfig(__dirname), {
    root,
    dirname: __dirname,
  });
})();
