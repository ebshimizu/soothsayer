module.exports = {
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'com.soothsayer.app',
        productName: 'Soothsayer',
        publish: [
          {
            provider: 'github',
            private: false,
          },
        ],
        extraFiles: ['public/obs_src'],
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
        },
        win: {
          target: 'nsis',
        },
        mac: {
          target: 'dmg',
        },
      },
    },
  },
};
