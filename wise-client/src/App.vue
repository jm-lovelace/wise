<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { watch } from 'vue';
import { useNotesStore } from './stores/notes-store';
import { useAppStore } from './stores/app-store';
import useFirebase from './composables/useFirebase';

const { userId } = useFirebase();
const $q = useQuasar();

const notesStore = useNotesStore();
const appStore = useAppStore();

watch(userId, async () => {
  await notesStore.notesSubscribe();
  await appStore.userSettingsSubscribe();
}, { immediate: true });

//$q.dark.set(true);
</script>
