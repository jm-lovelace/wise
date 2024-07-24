<template>
  <div>
    <h5>{{ chapterLabel }} ({{ currentVersion.toUpperCase() }})</h5>
    <template v-for="(item, i) in renderItems">
      <h6 v-if="item.type === 'heading'">{{ item.content }}</h6>
      <div class="subtitle2" v-else-if="item.type === 'subheading'">{{ item.content }}</div>
      <p v-else>{{ item.content }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { PageManager } from '../composables/usePageManager';
import { ref, onMounted, computed } from 'vue';
import { VerseType } from '../stores/bible-store';

const manager = new PageManager();

const { 
  verses, 
  chapterLabel, 
  currentVersion,
  currentBook,
  currentChapter,
  loadChapter, 
} = manager;

type RenderedItem = {
  type: string;
  content: string;
};

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
  initialized: [value: PageManager]
}>();

onMounted(async() => {
  emit('initialized', manager);
});

</script>
