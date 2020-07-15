<template>
  <v-card>
    <v-card-title>
      <h2>{{ sectionName }}</h2>
    </v-card-title>
    <v-tabs
      v-model="settingsTab"
      color="light-blue accent-1"
    >
      <v-tab
        v-for="section in sections"
        :key="section"
      >
        {{ section }}
      </v-tab>
    </v-tabs>
    <v-card-text>
      <v-tabs-items v-model="settingsTab">
        <v-tab-item>Settings</v-tab-item>
        <v-tab-item>Theme Overrides</v-tab-item>
        <v-tab-item>Keybinds</v-tab-item>
        <v-tab-item><settings-active-overlays /></v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import SettingsActiveOverlays from './settings/SettingsActiveOverlays';

export default {
  name: 'SoothsayerSettings',
  components: {
    SettingsActiveOverlays,
  },
  data() {
    return {
      settingsTab: 1,
      sections: ['Settings', 'Theme Overrides', 'Keybinds', 'Active Overlays'],
    };
  },
  computed: {
    sectionName() {
      return this.sections[this.settingsTab];
    },
  },
};
</script>
