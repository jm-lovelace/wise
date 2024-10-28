<template>
  <div style="height: 100%; width: 100%">
    <div class="row q-mb-sm">
      <q-input v-model="title" placeholder="Title" style="width: 100%; font-size: 14pt" />
      <div class="text-caption text-italic q-mt-sm">{{ dateString }}</div>
    </div>
    <div class="row q-mb-sm" v-if="editingTags">
      <TagInput v-model="tags" style="width: 100%" @done="editingTags=false" />
    </div>
    <div class="row q-mb-sm" v-else>
      <NoteTag v-for="tag in tags" :key="tag" :tag="tag" :clearable="false" />
      <span class="text-subtitle2 text-italic" v-if="tags.length === 0">No tags yet</span>
      <q-btn round size="sm" icon="edit" flat color="primary" @click="editingTags=true" />
    </div>
    <div class="row">
      <editor-content :editor="manager.EDITOR" style="height: 80vh; width: 100%" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { EditorManager } from '../composables/useEditorManager'
import moment from 'moment'
import NoteTag from './NoteTag.vue'
import TagInput from './TagInput.vue'

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
  title,
  date,
  tags
} = props.manager;

const editingTags = ref(false);

watch(contentId, (newContentId) => {
  emit('idChanged', newContentId);
});

watch(title, (newTitle) => {
  emit('labelChanged', newTitle);
});

const dateString = computed(() => {
  return date.value.length > 0 ? moment(date.value, "YYYY-MM-DD").format("dddd, MMMM DD, YYYY") : 'No date specified';
});

</script>