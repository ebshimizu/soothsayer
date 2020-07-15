import Vue from 'vue';
import Vuex from 'vuex';

import { createSharedMutations } from 'vuex-electron';
import { MUTATION } from '../data/ACTIONS';

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
      casters: {
        one: {
          name: '',
          social: '',
          size: 'medium',
        },
        two: {
          name: '',
          social: '',
          size: 'medium',
        },
        tournament: '',
        count: 1,
        sidebar: {
          title: '',
          text: '',
        },
        frame: 1,
        eventLogo: '',
      },
    },
    overlays: {},
    playerPool: '',
  },
  mutations: {
    [MUTATION.SET_BROADCAST_FIELD](state, { key, value }) {
      Vue.set(state.broadcast, key, value);
    },
    [MUTATION.SET_PLAYER_POOL](state, pool) {
      state.playerPool = pool;
    },
    [MUTATION.REGISTER_OVERLAY](state, { id, overlayData }) {
      Vue.set(state.overlays, id, overlayData);
    },
    [MUTATION.UNREGISTER_OVERLAY](state, id) {
      Vue.delete(state.overlays, id);
    }
  },
  actions: {},
  modules: {},
});
