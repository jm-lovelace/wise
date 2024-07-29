<template>
    <editor-content :editor="editor" style="height:50%" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const height = ref(0);
let resizeObserver: ResizeObserver | null = null;

onMounted(async() => {
  await nextTick();

  resizeObserver = new ResizeObserver(onResize);
  if (rootElem.value) {
    resizeObserver.observe(rootElem.value);
  }

  emit('labelChanged', chapterLabel.value);
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

const onResize = () => {
  height.value = rootElem.value.clientHeight || 0
};

const editor = useEditor({
  extensions: [
    StarterKit,
  ],
  content: `
    <h2>
      Welcome to the Wise Notes Editor
    </h2>
    <p>
      This is a simple editor that uses the Tiptap library.
    </p>
  `,
})
</script>