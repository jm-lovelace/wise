<template>
  <q-page class="row items-center justify-evenly">
    <ChapterView :startBook="1" :startChapter="1" startVersion="esv" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChapterView from '../components/ChapterView.vue';

</script>
