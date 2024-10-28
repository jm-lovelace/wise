import { defineStore } from 'pinia';
import MiniSearch from 'minisearch'
import useFirebase from '../composables/useFirebase';
import { NotePage } from '../types';

const { collectionSubscribe, user } = useFirebase();

let notes_unsub: any = null;

let search = new MiniSearch({
  fields: ['title', 'rawContent'],
  storeFields: ['id', 'title', 'tags', 'lastModified', 'lastModifiedBy']
});

export type NotesState = {
  notes: NotePage[]
}

export const useNotesStore = defineStore('notes', {
  state: (): NotesState => ({
    notes: []
  }),
  getters: {
    allTags: (state) => {
      let tags: string[] = [];
      state.notes.forEach(note => {
        note.tags.forEach(tag => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
      });

      tags.sort();

      return tags;
    }
  },
  actions: {
    notesSubscribe() {
      if (notes_unsub !== null) {
        notes_unsub();
      }

      if (!user.value) {
        return
      }

      notes_unsub = collectionSubscribe("notes",
        [{ field: "owner", operator: "==", value: user.value.id }],
        null,
        { field: "lastModified", direction: "desc" },
        (notes: any[]) => {
          this.notes = notes;

          search.removeAll();
          search.addAll(notes);
        }
      );
    },
    searchNotes(query: string) {
      return search.search(query);
    }
  }
});
