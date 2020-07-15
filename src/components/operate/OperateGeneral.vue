<template>
  <v-row>
    <v-col cols="2">
      <v-select
        label="# of Casters"
        v-model="casters.count"
        :items="casterCount"
        @input="update"
      />
    </v-col>
    <v-col cols="2">
      <v-select
        label="Frame Variant"
        v-model="casters.frame"
        :items="frameVariant"
        @input="update"
      />
    </v-col>
    <v-col cols="8">
      <v-text-field
        label="Event Logo"
        v-model="casters.eventLogo"
        @input="update"
      />
    </v-col>
    <v-col cols="7">
      <v-text-field
        label="Caster 1: Name"
        v-model="casters.one.name"
        @input="update"
      />
      <v-col />
    </v-col>
    <v-col cols="3">
      <v-text-field
        label="Caster 1: Social"
        v-model="casters.one.social"
        @input="update"
      />
    </v-col>
    <v-col cols="2">
      <v-select
        label="Text Size"
        :items="textSize"
        v-model="casters.one.size"
        @input="update"
      />
    </v-col>
    <v-col
      cols="7"
      v-show="casters.count > 1"
    >
      <v-text-field
        label="Caster 2: Name"
        v-model="casters.two.name"
        @input="update"
      />
      <v-col />
    </v-col>
    <v-col
      cols="3"
      v-show="casters.count > 1"
    >
      <v-text-field
        label="Caster 2: Social"
        v-model="casters.two.social"
        @input="update"
      />
    </v-col>
    <v-col
      cols="2"
      v-show="casters.count > 1"
    >
      <v-select
        label="Text Size"
        :items="textSize"
        v-model="casters.two.size"
        @input="update"
      />
    </v-col>
    <v-col cols="4">
      <v-text-field
        label="Sidebar Title"
        v-model="casters.sidebar.title"
        @input="update"
      />
    </v-col>
    <v-col cols="8">
      <v-textarea
        label="Sidebar Text"
        v-model="casters.sidebar.text"
        @input="update"
        outlined
      />
    </v-col>
    <v-col cols="12">
      <v-textarea
        label="Player Pool"
        hint="Optional, one player per line"
        v-model="playerPool"
        outlined
      />
    </v-col>
  </v-row>
</template>

<script>
import _ from 'lodash';
import { MUTATION } from '../../data/ACTIONS';
import Settings from '../../data/SETTINGS';

export default {
  name: 'OperateGeneral',
  data() {
    return {
      casterCount: [
        { text: '1', value: 1 },
        { text: '2', value: 2 },
      ],
      frameVariant: [
        { text: '1', value: 1 },
        { text: '2', value: 2 },
        { text: '3', value: 3 },
        { text: '4', value: 4 },
      ],
      textSize: [
        { text: 'Small', value: 'small' },
        { text: 'Medium', value: 'medium' },
        { text: 'Large', value: 'large' },
      ],
    };
  },
  created() {
    this.update = _.debounce(this.debouncedUpdate, Settings.DEBOUNCE_TIME);
    this.updatePool = _.debounce(this.debouncedPool, Settings.DEBOUNCE_TIME);
  },
  computed: {
    casters() {
      return this.$store.state.broadcast.casters;
    },
    playerPool: {
      get() {
        return this.$store.state.playerPool;
      },
      set(val) {
        this.updatePool(val);
      },
    },
  },
  methods: {
    debouncedUpdate() {
      this.$store.commit(MUTATION.SET_BROADCAST_FIELD, {
        key: 'casters',
        value: this.casters,
      });
    },
    debouncedPool() {
      this.$store.commit(MUTATION.SET_PLAYER_POOL, this.playerPool);
    },
  },
};
</script>
