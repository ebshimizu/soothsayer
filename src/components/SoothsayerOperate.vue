<template>
  <v-card>
    <v-card-title>
      <h2>{{ sectionName }}</h2>
    </v-card-title>
    <v-tabs
      v-model="operateTab"
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
      <v-tabs-items v-model="operateTab">
        <v-tab-item><operate-general /></v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import OperateGeneral from './operate/OperateGeneral';

export default {
  name: 'SoothsayerOperate',
  components: {
    OperateGeneral,
  },
  data() {
    return {
      operateTab: 1,
      sections: ['General'],
    };
  },
  computed: {
    sectionName() {
      return this.sections[this.operateTab];
    },
  },
};
</script>
