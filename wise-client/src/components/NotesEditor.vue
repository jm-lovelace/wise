<template>
    <editor-content :editor="editor" />
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

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