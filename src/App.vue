<template>
  <v-app>
    <v-app-bar
      app
      dense
      color="primary"
    >
      <v-tabs
        v-model="activeTab"
        color="white"
      >
        <v-tab>Operate</v-tab>
        <v-tab>Settings</v-tab>
      </v-tabs>
      <v-spacer />
      <v-btn
        color="green"
        @click="update"
      >
        UPDATE
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-tabs-items v-model="activeTab">
        <v-tab-item><soothsayer-operate /></v-tab-item>
        <v-tab-item>Settings</v-tab-item>
      </v-tabs-items>
    </v-main>
  </v-app>
</template>

<script>
import SoothsayerOperate from './components/SoothsayerOperate';
import { ipcRenderer } from 'electron';

export default {
  name: 'App',
  components: {
    SoothsayerOperate,
  },
  data: () => ({
    activeTab: 0,
  }),
  methods: {
    update() {
      ipcRenderer.send('broadcastUpdate');
    },
  },
};
</script>
