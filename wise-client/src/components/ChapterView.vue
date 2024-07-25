<template>
  <div class="chapter-view-container q-px-md" :id="rootId" style="height: 100%">
    <q-scroll-area :style="{ height: `${height}px` }">
      <h5 class="text-bold q-mt-sm q-mb-lg">{{ chapterLabel }} ({{ currentVersion.toUpperCase() }})</h5>
      <template v-for="(item, i) in renderItems" :key="i">
        <h6 v-if="item.type === 'heading'" class="q-mt-sm q-mb-md">{{ item.content }}</h6>
        <div class="subtitle2" v-else-if="item.type === 'subheading'">{{ item.content }}</div>
        <p v-else>
          <span v-for="(pPart, p) in item.content">
            <span v-if="(pPart as any).verse > -1" class="verse-number">{{ (pPart as any).verse }}</span>
            {{ (pPart as any).text }}
          </span>
        </p>
      </template>
      <div style="height: 5em"></div>
    </q-scroll-area>
    <q-btn class="nav-btn left" color="primary" round icon="arrow_back" @click="loadChapter(currentVersion, currentBook, currentChapter - 1)" />
    <q-btn class="nav-btn right" color="primary" round icon="arrow_forward" @click="loadChapter(currentVersion, currentBook, currentChapter + 1)" />
  </div>
</template>

<script setup lang="ts">
import { PageManager } from '../composables/usePageManager';
import { onMounted, computed, ref, nextTick, onBeforeUnmount } from 'vue';
import { VerseType } from '../stores/bible-store';

const manager = new PageManager();

const height = ref(0);
let resizeObserver: ResizeObserver | null = null;

const rootId = ref(`view-${Math.random().toString(36).slice(2, 10)}`);
const rootElem = computed(() => document.getElementById(rootId.value) as HTMLCanvasElement);

const emit = defineEmits<{
  initialized: [value: PageManager]
}>();

onMounted(async() => {
  emit('initialized', manager);
  await nextTick();

  resizeObserver = new ResizeObserver(onResize);
  if (rootElem.value) {
    resizeObserver.observe(rootElem.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

const onResize = () => {
  height.value = rootElem.value.clientHeight || 0
};

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
  content: string | {verse: number, text: string}[];
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
        (acc[acc.length - 1].content as {verse: number, text: string}[])
          .push({ verse: item.verseNum, text: paragraphs[0]});
      }

      //start new paragraphs
      for (let i = 1; i < paragraphs.length; i++) {
        const verseNum = i === 1 && paragraphs[0] === "" ? item.verseNum : -1;
        acc.push({ type: VerseType.Verse, content: [{ verse:  verseNum, text: paragraphs[i]}] });
      }
    }

    return acc;
  }, [] as RenderedItem[]);
});

</script>

<style lang="scss">
.verse-number {
  font-weight: bold;
  vertical-align: super;
  font-size: smaller;
  margin-left: 0.5em;
}

.chapter-view-container {
  position: relative;
}

.nav-btn {
  position: absolute;
  bottom: 16px;
}

.nav-btn.left {
  left: 16px;
}

.nav-btn.right {
  right: 16px;
}
</style>
