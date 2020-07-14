import Vue from 'vue';
import Vuex from 'vuex';

import { createSharedMutations } from 'vuex-electron';

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [
    createSharedMutations({
      syncStateOnRendererCreation: true,
    }),
  ],
  state: {
    // the broadcast object maintains state for data that gets sent over the sever to overlays
    broadcast: {
      blueTeam: {
        name: '',
        score: 0,
        logo: '',
        players: [],
      },
      redTeam: {
        name: '',
        score: 0,
        logo: '',
        players: [],
      },
      match: {
        mapPool: [],
        bestOf: 3,
        textOverride: '',
        blueMapBan: [],
        redMapBan: [],
        syncd: false,
        games: [],
      },
      miscData: {
        popupDisplayMode: '',
        popupAnimLength: 30,
      },
    },
  },
  mutations: {},
  actions: {},
  modules: {},
});
