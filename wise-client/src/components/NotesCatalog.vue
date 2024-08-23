<template>
    <div class="row">
        <q-list bordered separator>
            <q-item clickable v-ripple v-for="(note, n) in filteredNotes" @click="activateNotePage">
                <q-item-section>
                    <q-item-label>
                        <q-icon name="note" />
                        <q-item-label>{{ note.title }}</q-item-label>
                        <q-item-label caption>{{ formatLastModified(note.lastModified) }}</q-item-label>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNotesStore } from '../stores/notes-store';
import { storeToRefs } from 'pinia'
import moment from 'moment';

const tagFilters = ref([]);
const searchFilter = ref('');
const groupByTag = ref(false);

const notesStore = useNotesStore();
const { notes } = storeToRefs(notesStore);

const formatLastModified = (timestamp: number) => {
    return moment(timestamp).fromNow();
};

const filteredNotes = computed(() => {
    return notes.value.filter((note) => {
        if (tagFilters.value.length > 0) {
            return tagFilters.value.every((tag) => note.tags.includes(tag));
        }
        return true;
    }).filter((note) => {
        if (searchFilter.value) {
            const searchResults = notesStore.searchNotes(searchFilter.value);
            return searchResults.findIndex((searchNote) => searchNote.id === note.id) > -1;
        }
        return true;
    });
});

const activateNotePage = (note) => {
    
};

</script>