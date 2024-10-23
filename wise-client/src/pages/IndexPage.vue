<template>
  <q-page>
    <q-splitter
      v-model="splitter"
      separator-class="bg-secondary"
      separator-style="width: 5px"
      :style="{ height: `${pageHeight}px` }"
    >
      <template v-slot:before>
        <TabPane :paneNumber="0" style="height: 100vh" />
      </template>

      <template v-slot:separator>
        <q-avatar color="primary" text-color="white" size="30px" icon="drag_indicator" />
      </template>

      <template v-slot:after>
        <TabPane :paneNumber="1" style="height: 100vh" />
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import TabPane from '../components/TabPane.vue';
import { useAppStore } from '../stores/app-store';

const appStore = useAppStore();

const splitter = ref<number>(45);

const pageHeight = ref(0);

const onResize = () => {
  pageHeight.value = window.innerHeight;
};

onMounted(() => {
  window.addEventListener('resize', onResize);
  onResize();

  appStore.newReaderTab(0);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});


</script>
