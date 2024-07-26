<template>
  <div class="chapter-view-container q-px-sm" :id="id" style="height: 100%">
    <q-scroll-area :style="{ height: `${height}px` }">
      <h5 class="text-bold q-mt-sm q-mb-none">{{ chapterLabel }}</h5>
      <q-btn no-caps flat class="text-grey q-px-none" icon-right="expand_more" :label="currentVersionLabel">
        <q-menu>
          <q-list dense>
            <q-item v-for="(version, v) in versionList" clickable v-ripple @click="loadChapter(version.id, currentBook, currentChapter)">
              <q-item-section>{{ version.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
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
        <q-list dense>
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
import { ReaderManager } from '../composables/useReaderManager';
import { onMounted, computed, ref, nextTick, onBeforeUnmount, watch } from 'vue';
import { VerseType, versionNames } from '../stores/bible-store';

const height = ref(0);
let resizeObserver: ResizeObserver | null = null;

interface ChapterViewProps {
  manager: ReaderManager;
}

const props = defineProps<ChapterViewProps>();

const emit = defineEmits<{
  'labelChanged': [value: string]
}>();

const { 
  id,
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
  shareSelection,
  versions
} = props.manager;

const rootElem = computed(() => document.getElementById(id) as HTMLCanvasElement);

onMounted(async() => {
  await nextTick();

  resizeObserver = new ResizeObserver(onResize);
  if (rootElem.value) {
    resizeObserver.observe(rootElem.value);
  }

  emit('labelChanged', chapterLabel.value);
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

const onResize = () => {
  height.value = rootElem.value.clientHeight || 0
};

watch(chapterLabel, () => {
  emit('labelChanged', `${chapterLabel.value} (${currentVersion.value.toUpperCase()})`);
});

const currentVersionLabel = computed(() => {
  const version = versions.value.find(v => v.id === currentVersion.value);
  return version ? `${versionNames[version.id]} (${version.id.toUpperCase()})` : '';
});

const versionList = computed(() => {
  return versions.value.map(v => { return { ...v, label: `${versionNames[v.id]} (${v.id.toUpperCase()})` }});
});

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