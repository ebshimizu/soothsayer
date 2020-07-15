<template>
  <v-list
    outlined
    two-line
  >
    <v-list-item
      v-for="(overlay, key) in connectedOverlays"
      :key="key"
    >
      <v-list-item-content>
        <v-list-item-title>{{ overlay.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ key }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  name: 'SettingsActiveOverlays',
  computed: {
    connectedOverlays() {
      return this.$store.state.overlays;
    }
  }
}
</script>