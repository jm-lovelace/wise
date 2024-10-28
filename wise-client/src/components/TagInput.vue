<template>
    <q-select
        ref="myChipInput"
        v-model="tags"
        multiple
        use-input
        new-value-mode="add"
        stack-label
        label="Tags"
        :options="filteredOptions"
        @input.native="onInput($event.target.value)"
        @new-value="createValue"
        @keyup.tab.native="onEnter"
        style="width: 100%"
    >
        <template v-if="showOk" v-slot:append>
            <q-icon
                color="primary"
                name="check_circle_outline"
                class="cursor-pointer"
                @click="onEnter"
            ></q-icon>        
        </template>
        <template v-slot:selected>
            <NoteTag v-for="tag in tags" :key="tag" :tag="tag" clearable @cleared="myChipInput.remove(tag)" />
        </template>
        <template v-slot:after>
            <q-btn flat color="primary" icon="check" @click="emit('done', 'done')" />
        </template>
    </q-select>
</template>

<script setup lang="ts">
import { ref, computed, defineModel } from 'vue'
import { useNotesStore } from '../stores/notes-store'
import { storeToRefs } from 'pinia'
import NoteTag from './NoteTag.vue'

const tags = defineModel<string[]>();

const emit = defineEmits<{
  done: [value: string]
}>();

const notesStore = useNotesStore();
const { allTags } = storeToRefs(notesStore);

const inputValue = ref("");
const showOk = ref(false);
const myChipInput = ref<any>(null);

const createValue = (val: string, done: any) => {
  showOk.value = false
  if(done) {
    done(val)
  } 
}

const onInput = (val: string) => {
  inputValue.value = val;
  showOk.value = true;
}

const onEnter = () => {
  showOk.value = false;
  myChipInput.value.add(inputValue.value);
  myChipInput.value.updateInputValue("");
}

const filteredOptions = computed(() => {
  if (!inputValue.value || inputValue.value === "") {
    return allTags.value;
  }
  return allTags.value.filter(option =>
    option.toLowerCase().includes(inputValue.value.toLowerCase())
  );
});

</script>
