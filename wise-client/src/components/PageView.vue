<template>
  <div>My component</div>
</template>

<script setup lang="ts">
import { useBible } from '../composables/useBible';
import { ref, onMounted, computed, watch } from 'vue';

const { loadChapter, currentChapter, currentBook, currentChapterLabel } = await useBible();

interface PageViewProps {
  startBook: number;
  startChapter: number;
  startVersion: string;
}

const props = defineProps<PageViewProps>();


const emit = defineEmits<{
  change: [value: { book: number; chapter: number; version: string; label: string }]
}>();

</script>
