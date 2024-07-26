<template>
    <q-stepper
        v-model="step"
        animated
        style="overflow-y: scroll"
    >
        <q-step :name="1" title="Select Book">
            <div class="row">
                <div class="col-6 col-md-4 q-pa-xs" v-for="(book, b) in books" :key="b">
                    <q-btn 
                        unelevated 
                        square 
                        v-ripple  
                        color="grey"
                        @click="selBook=book; step=2"
                        style="width: 100%; height: 100%"
                    >{{ book.name }}</q-btn>
                </div>
            </div>
        </q-step>
        <q-step :name="2" title="Select Chapter">
            <div class="row">
                <q-btn flat icon="arrow_back" @click="selBook=null; step=1" />
            </div>
            <div class="row">
                <div class="col-6 col-md-4 q-pa-xs" v-for="chapter in chaptersArray" :key="chapter">
                    <q-btn 
                        unelevated 
                        square 
                        v-ripple 
                        color="grey" 
                        @click="selChapter=chapter; finish()"
                        style="width: 100%; height: 100%"
                    >{{ chapter }}</q-btn>
                </div>
            </div>
        </q-step>
    </q-stepper>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { books, Book, useBibleStore } from '../stores/bible-store';
const step = ref(1);

const bibleStore = useBibleStore();

const selVersion = ref(bibleStore.userDefaultVersion);
const selBook = ref<Book | null>(null);
const selChapter = ref<number | null>(null);

const emit = defineEmits<{
    'selected': [version: string, book: number, chapter: number]
}>();

const chaptersArray = computed(() => {
    if (selBook.value) {
        return Array.from({ length: selBook.value.chapters }, (_, i) => i + 1);
    }
    return [];
});

const finish = () => {
    if (selBook.value && selChapter.value && selVersion.value) {
        emit('selected', selVersion.value, selBook.value.id, selChapter.value);
    }
};
</script>