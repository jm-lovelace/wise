<template>
    <editor-content :editor="manager.EDITOR" style="height: 100%; width: 100%" />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { EditorManager } from '../composables/useEditorManager'

interface NotesEditorProps {
  manager: EditorManager;
}

const props = defineProps<NotesEditorProps>();

const emit = defineEmits<{
  'labelChanged': [value: string],
  'idChanged': [value: string]
}>();
const {
  contentId,
  title
} = props.manager;

watch(contentId, (newContentId) => {
  emit('idChanged', newContentId);
});

watch(title, (newTitle) => {
  emit('labelChanged', newTitle);
});

</script>