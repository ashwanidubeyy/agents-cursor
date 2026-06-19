module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@constants': './src/constants',
          '@store': './src/store',
          '@utility': './src/utility',
          '@api': './src/api',
          '@assets': './src/assets',
          '@layouts': './src/components/layouts',
          '@widgets': './src/components/widgets',
          '@hooks': './src/hooks',
          '@services': './src/services',
        },
      },
    ],
  ],
};
