<template>
  <div>
    <h5>{{ currentChapterLabel }} ({{ currentVersion.toUpperCase() }})</h5>
    <template v-for="(item, i) in renderItems">
      <h6 v-if="item.type === 'heading'">{{ item.content }}</h6>
      <div class="subtitle2" v-else-if="item.type === 'subheading'">{{ item.content }}</div>
      <p v-else>{{ item.content }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBible, VerseType } from '../composables/useBible';
import { ref, onMounted, computed, watchEffect } from 'vue';

const { loadChapter, initialize, currentChapter, currentBook, currentChapterLabel, currentVersion, verses } = useBible();

interface PageViewProps {
  startBook: number;
  startChapter: number;
  startVersion: string;
}

type RenderedItem = {
  type: string;
  content: string;
};

const props = defineProps<PageViewProps>();

const renderItems = computed(() => {
  if (!verses.value) return [];

  return verses.value.reduce((acc, item) => {
    if (item.type === VerseType.Heading || item.type === VerseType.Subheading) 
    {
      acc.push({ type: item.type, content: item.rawText });
    } 
    else 
    {
      const paragraphs = item.rawText.trim().split("||");
      
      //continue paragraph from previous verse
      if (paragraphs[0] !== "") {
        acc[acc.length - 1].content += `[${item.verseNum}] ${paragraphs[0]}`;
      }

      //start new paragraphs
      for (let i = 1; i < paragraphs.length; i++) {
        acc.push({ type: VerseType.Verse, content: paragraphs[i] });
      }
    }

    return acc;
  }, [] as RenderedItem[]);
});

const emit = defineEmits<{
  change: [value: { book: number; chapter: number; version: string; label: string }]
}>();

onMounted(async() => {
  await initialize();
  await loadChapter(props.startVersion, props.startBook, props.startChapter);
  emit('change', {
    book: props.startBook,
    chapter: props.startChapter,
    version: props.startVersion,
    label: currentChapterLabel.value,
  });
});

watchEffect(async () => {
  await loadChapter(props.startVersion, props.startBook, props.startChapter);
  emit('change', {
    book: props.startBook,
    chapter: props.startChapter,
    version: props.startVersion,
    label: currentChapterLabel.value,
  });
});

</script>
