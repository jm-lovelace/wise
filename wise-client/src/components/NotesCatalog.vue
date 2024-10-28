<template>
    <div>
        <q-toolbar>
            <q-toolbar-title>
            Notebook
            </q-toolbar-title>
        </q-toolbar>
        <div class="row q-mx-sm q-my-sm">
            <q-input dense filled v-model="searchFilter" placeholder="Search" style="width: 100%" />
        </div>
        <div class="row">
            <q-list bordered separator style="width: 100%" class="q-mx-sm">
                <q-item clickable v-ripple v-for="(note, n) in filteredNotes" @click="appStore.activateEditorTab(note.id, 1)">
                    <q-item-section side>
                        <q-icon name="note" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>
                            <q-item-label>{{ note.title }}</q-item-label>
                            <q-item-label caption>{{ formatLastModified(note.lastModified) }}</q-item-label>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNotesStore } from '../stores/notes-store';
import { useAppStore } from '../stores/app-store';
import { storeToRefs } from 'pinia'
import moment from 'moment';

const tagFilters = ref([]);
const searchFilter = ref('');
const groupByTag = ref(false);

const appStore = useAppStore();

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

</script>