<template>
  <div class="chapter-view-container q-px-md" :id="rootId" style="height: 100%">
    <q-scroll-area :style="{ height: `${height}px` }">
      <h5 class="text-bold q-mt-sm q-mb-none">{{ chapterLabel }} ({{ currentVersion.toUpperCase() }})</h5>
      <template v-for="(item, i) in renderItems" :key="i">
        <h6 v-if="item.type === 'heading'" class="q-mt-lg q-mb-md">{{ item.content }}</h6>
        <div class="subtitle2" v-else-if="item.type === 'subheading'">{{ item.content }}</div>
        <p v-else class="q-mt-lg">
          <span v-for="(pPart, p) in item.content" @click="toggleVerseRangeSelection((pPart as VersePart).verse)" :class="(pPart as VersePart).selected ? 'selected-verse' : ''">
            <span v-if="(pPart as VersePart).startOfVerse" class="verse-number">{{ (pPart as VersePart).verse }}</span>
            {{ (pPart as VersePart).text }}
          </span>
        </p>
      </template>
      <div style="height: 5em"></div>
    </q-scroll-area>
    <q-chip v-if="selectedVerses.length > 0" color="accent" text-color="white" :label="selectedVersesLabel" icon="book" class="text-bold selected-verse-tag">
      <q-menu>
        <q-list >
          <q-item clickable v-ripple @click="copySelectionToClipboard">
            <q-item-section avatar>
              <q-icon name="content_copy" />
            </q-item-section>
            <q-item-section>Copy Text</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="shareSelection">
            <q-item-section avatar>
              <q-icon name="share" />
            </q-item-section>
            <q-item-section>Share</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-chip>
    <q-btn class="nav-btn left" color="primary" round icon="arrow_back" :disable="currentChapter <= 1" @click="loadChapter(currentVersion, currentBook, currentChapter - 1)" />
    <q-btn class="nav-btn right" color="primary" round icon="arrow_forward" :disable="currentChapter >= currentBookChapters" @click="loadChapter(currentVersion, currentBook, currentChapter + 1)" />
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
  currentBookChapters,
  selectedVerses,
  selectedVersesLabel,
  loadChapter,
  toggleVerseRangeSelection,
  copySelectionToClipboard,
  shareSelection
} = manager;

const selectedLabel = computed(() => {
  if (selectedVerses.value.length === 1) {
    return `Selected: ${selectedVerses.value[0]}`;
  } else {
    return `Selected: ${selectedVerses.value[0]}-${selectedVerses.value[selectedVerses.value.length - 1]}`;
  }
});

type RenderedItem = {
  type: string;
  content: string | VersePart[];
};

type VersePart = {
  verse: number;
  text: string;
  selected: boolean;
  startOfVerse: boolean;
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
        (acc[acc.length - 1].content as VersePart[])
          .push({ verse: item.verseNum, startOfVerse: true, text: paragraphs[0], selected: selectedVerses.value.includes(item.verseNum) });  
      }

      //start new paragraphs
      for (let i = 1; i < paragraphs.length; i++) {
        const startOfVerse = i === 1 && paragraphs[0] === "";
        acc.push({ type: VerseType.Verse, content: [{ verse:  item.verseNum, startOfVerse: startOfVerse, text: paragraphs[i], selected: selectedVerses.value.includes(item.verseNum) }] });
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

.selected-verse {
  background-color: #f0f0f0;
}

.chapter-view-container {
  position: relative;
}

.nav-btn {
  position: absolute;
  bottom: 16px;
}

.selected-verse-tag {
  position: absolute;
  top: 16px;
  right: 30px;
  cursor: pointer;
}

.nav-btn.left {
  left: 30px;
}

.nav-btn.right {
  right: 30px;
}
</style>
