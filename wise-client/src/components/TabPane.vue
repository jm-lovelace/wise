<template>
    <div>
        <q-tabs
            v-model="activeTab"
            inline-label
            outside-arrows
            mobile-arrows
            dense
            class="bg-primary text-white shadow-2"
        >
            <q-tab
                v-for="tab in tabs"
                v-model="activeTab"
                :key="tab.id"
                :name="tab.id"
                :label="tab.label"
                icon="book"
                @remove="removeTab(tab.id)"
            />
        </q-tabs>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '../stores/app-store';
import { storeToRefs } from 'pinia';
import { computed, defineProps, onMounted } from 'vue';

interface TabPaneProps {
  paneNumber: number;
}

const props = defineProps<TabPaneProps>();

const appStore = useAppStore();
const { activeTabs, openTabs } = storeToRefs(appStore);

const tabs = computed(() => {
    const _tabs = { ...openTabs.value.filter(tab => tab.pane === props.paneNumber) };
    _tabs.sort((a, b) => a.index - b.index);
    return _tabs;
});

const activeTab = computed({
    get: () => activeTabs.value[props.paneNumber],
    set: (value: string) => {
        activeTabs.value[props.paneNumber] = value;
    }
});

onMounted(() => {

});

</script>