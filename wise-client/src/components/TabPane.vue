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
                        <q-item clickable v-close-popup>
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
                <ChapterView v-if="tab.type===TabType.Reader" :manager="readerManagers[tab.id]" @labelChanged="($evt) => tab.label = $evt" style="height: 100%" />
                <ChapterSelection v-if="tab.type===TabType.ChapterSelection" @selected="chapterSelected" style="height: 100%" />
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script setup lang="ts">
import { useAppStore, readerManagers, TabType } from '../stores/app-store';
import { storeToRefs } from 'pinia';
import { computed, defineProps, onMounted } from 'vue';
import ChapterView from './ChapterView.vue';
import ChapterSelection from './ChapterSelection.vue';

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
``
const activeTab = computed({
    get: () => activeTabs.value[props.paneNumber],
    set: (value: string) => {
        activeTabs.value[props.paneNumber] = value;
    }
});

const chapterSelected = async(version: string, book: number, chapter: number) => {
    const tab = tabs.value.find(tab => tab.id == activeTab.value);
    if (tab) {
        tab.type = TabType.Reader;
        await readerManagers[tab.id].loadChapter(version, book, chapter);
    }
};

onMounted(() => {

});

</script>