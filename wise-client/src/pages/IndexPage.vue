<template>
  <q-page class="row items-center justify-evenly">
    <ChapterView @initialized="setPageManager" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChapterView from '../components/ChapterView.vue';
import { PageManager } from '../composables/usePageManager';
import { useBibleStore } from '../stores/bible-store';

let manager: PageManager | null = null;

const bibleStore = useBibleStore();

const setPageManager = async(value: PageManager) => {
  manager = value;

  await bibleStore.downloadVersion('esv');
  await manager.loadChapter('esv', 1, 1);
};

</script>
