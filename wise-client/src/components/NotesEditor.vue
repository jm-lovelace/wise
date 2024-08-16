<template>
    <editor-content :editor="manager.EDITOR" style="height: 100%; width: 100%" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { v4 as uuidv4 } from 'uuid'
import { EditorManager } from '../composables/useEditorManager'

interface NotesEditorProps {
  manager: EditorManager;
}

const props = defineProps<NotesEditorProps>();

const emit = defineEmits<{
  'labelChanged': [value: string]
}>();

</script>