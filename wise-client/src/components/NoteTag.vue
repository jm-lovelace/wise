<template>
    <q-chip 
        :removable="clearable" 
        @remove="emit('cleared', tag)" 
        @click="emit('clicked', tag)"
        :color="tagColor"
        class="text-white text-bold text-caption"
        style="cursor: pointer"
    >{{ tag }}</q-chip>
</template>

<script setup lang="ts">
import { useAppStore } from '../stores/app-store';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

interface NoteTagProps {
    tag: string;
    clearable: boolean;
}

const props = defineProps<NoteTagProps>();

const emit = defineEmits<{
    'clicked': [tag: string],
    'cleared': [tag: string]
}>();

const appStore = useAppStore();
const { userSettings } = storeToRefs(appStore);

const tagColor = computed(() => {
    return props.tag in userSettings.value.tagColors ? userSettings.value.tagColors[props.tag] : 'grey';
});
</script>