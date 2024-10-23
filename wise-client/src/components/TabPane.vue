<template>
    <div style="height: 100%">
        <q-tabs
            v-model="activeTab"
            inline-label
            outside-arrows
            no-caps
            mobile-arrows
            align="left"
            dense
            style="border-bottom: 1px solid #d3d3d3;"
        >
            <q-tab
                v-for="tab in tabs"
                v-model="activeTab"
                :key="tab.id"
                :name="tab.id"
                @remove="appStore.closeTab(tab.id)"
                class="q-pr-none"
            >
            <q-icon size="xs" :name="iconMapping[tab.type]" class="q-mr-xs" />
            {{ tab.label }}
            <q-btn size="xs" class="q-pt-xs q-ml-sm q-px-xs" flat icon="more_vert">
                <q-menu>
                    <q-list dense>
                        <q-item clickable v-close-popup @click="appStore.closeTab(tab.id)">
                            <q-item-section>Close</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
            </q-tab>
            <q-btn flat icon="add">
                <q-menu>
                    <q-list dense>
                        <q-item clickable v-close-popup @click="appStore.newReaderTab(paneNumber)">
                            <q-item-section>Chapter</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="appStore.newEditorTab(paneNumber, null)">
                            <q-item-section>Note Page</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
        </q-tabs>
        <q-tab-panels v-model="activeTab" style="height: 95%">
            <q-tab-panel
                v-for="tab in tabs"
                :key="tab.id"
                :name="tab.id"
                style="height: 100%"
            >
                <ChapterView 
                    v-if="tab.type===TabType.Reader" 
                    :manager="readerManagers[tab.id]" 
                    @chapterChanged="($evt) => chapterChanged(tab.id, $evt)" 
                    style="height: 100%" 
                />
                <ChapterSelection v-if="tab.type===TabType.ChapterSelection" @selected="chapterSelected" style="height: 100%" />
                <NotesEditor 
                    v-if="tab.type===TabType.Notes" 
                    :manager="editorManagers[tab.id]" 
                    @labelChanged="($evt) => tab.label = $evt" 
                    @idChanged="($evt) => tab.contentId = $evt" 
                    style="height: 100%" 
                />
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script setup lang="ts">
import { useAppStore, readerManagers, editorManagers, TabType } from '../stores/app-store';
import { storeToRefs } from 'pinia';
import { computed, defineProps, onMounted } from 'vue';
import ChapterView from './ChapterView.vue';
import ChapterSelection from './ChapterSelection.vue';
import NotesEditor from './NotesEditor.vue';

interface TabPaneProps {
  paneNumber: number;
}

const props = defineProps<TabPaneProps>();

const appStore = useAppStore();
const { activeTabs, openTabs } = storeToRefs(appStore);

const tabs = computed(() => {
    const _tabs = [ ...openTabs.value.filter(tab => tab.pane === props.paneNumber) ];
    _tabs.sort((a, b) => a.index - b.index);

    return _tabs;
});

const activeTab = computed({
    get: () => activeTabs.value[props.paneNumber],
    set: (value: string) => {
        activeTabs.value[props.paneNumber] = value;
    }
});

const iconMapping: { [key: string]: string } = {
    [TabType.Reader]: 'book',
    [TabType.ChapterSelection]: 'book',
    [TabType.Notes]: 'note',
    [TabType.Iframe]: 'language'
};

const chapterSelected = async(version: string, book: number, chapter: number) => {
    const tab = tabs.value.find(tab => tab.id == activeTab.value);
    if (tab) {
        tab.type = TabType.Reader;
        await readerManagers[tab.id].loadChapter(version, book, chapter);
    }
};

const chapterChanged = (tabId: string, event: { contentId: string, label: string }) => {
    const tab = tabs.value.find(tab => tab.id == tabId);
    if (tab) {
        tab.contentId = event.contentId;
        tab.label = event.label;
    }
}

onMounted(() => {

});

</script>