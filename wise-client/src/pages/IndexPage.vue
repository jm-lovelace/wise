<template>
  <q-page>
    <q-splitter
      v-model="splitter"
      separator-class="bg-secondary"
      separator-style="width: 5px"
      :style="{ height: `${pageHeight}px` }"
    >
      <template v-slot:before>
        <ChapterView @initialized="setPageManager" style="height: 100vh" />
      </template>

      <template v-slot:separator>
        <q-avatar color="primary" text-color="white" size="30px" icon="drag_indicator" />
      </template>

      <template v-slot:after>
        <NotesEditor />
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ChapterView from '../components/ChapterView.vue';
import NotesEditor from '../components/NotesEditor.vue';
import { ReaderManager } from '../composables/useReaderManager';
import { useBibleStore } from '../stores/bible-store';

let manager: ReaderManager | null = null;

const bibleStore = useBibleStore();

const splitter = ref<number>(45);

const pageHeight = ref(0);

const setPageManager = async(value: ReaderManager) => {
  manager = value;

  await bibleStore.loadVersions();

  //await bibleStore.downloadVersion('esv');
  await manager.loadChapter('esv', 1, 1);
};

const onResize = () => {
  pageHeight.value = window.innerHeight;
};

onMounted(() => {
  window.addEventListener('resize', onResize);
  onResize();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});


</script>
