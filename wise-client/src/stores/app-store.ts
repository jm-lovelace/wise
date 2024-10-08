import { defineStore } from 'pinia';
import { ReaderManager } from '../composables/useReaderManager';
import { EditorManager } from '../composables/useEditorManager';
import { NotePage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import useFirebase from '../composables/useFirebase';
import moment from 'moment';


const { user, setDocument } = useFirebase();

export enum TabType {
  Reader = "reader",
  ChapterSelection = "chapter-selection",
  Notes = "notes",
  Map = "map",
  Iframe = "iframe"
}

export type Tab = {
  id: string;
  type: TabType;
  label: string;
  pane: number;
  index: number;
}

export type AppState = {
  openTabs: Tab[],
  activeTabs: string[]
}

export const readerManagers: { [key: string]: ReaderManager } = {};
export const editorManagers: { [key: string]: EditorManager } = {};


export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    openTabs: [],
    activeTabs: [
      "", ""
    ]
  }),
  getters: {
  
  },
  actions: {
    newReaderTab(pane: number) {
      const id = uuidv4();
      const tab: Tab = {
        id: id,
        type: TabType.ChapterSelection,
        label: "Select Chapter",
        pane: pane,
        index: this.openTabs.filter(t => t.pane === pane).length
      };

      readerManagers[id] = (new ReaderManager(id));

      this.openTabs.push(tab);
      this.activeTabs[pane] = id
    },
    async newEditorTab(pane: number) {
      if (!user.value) {
        return;
      }

      //create new note
      const newNote: NotePage = {
        id: uuidv4(),
        title: "Untitled Note",
        owner: user.value.id,
        collaborators: [],
        tags: [],
        date: moment().format("YYYY-MM-DD"),
        lastModified: Date.now(),
        lastModifiedBy: user.value.id,
        rawContent: "",
        htmlContent: ""
      }

      await setDocument("notes", newNote);

      //create tab
      const id = uuidv4();
      const tab: Tab = {
        id: id,
        type: TabType.Notes,
        label: "",
        pane: pane,
        index: this.openTabs.filter(t => t.pane === pane).length
      };

      editorManagers[id] = (new EditorManager(id));

      editorManagers[id].setEditorDocument(newNote.id)

      this.openTabs.push(tab);
      this.activeTabs[pane] = id
    },
    closeTab(id: string) {
      const tab = this.openTabs.find(t => t.id === id);
      if (!tab) {
        return;
      }

      const readerManager = readerManagers[id];
      if (readerManager) {
        delete readerManagers[id];
      };

      this.openTabs.splice(this.openTabs.indexOf(tab), 1);
    },
    activateReaderTab(version: string, book: number, chapter: number, preferredPane: number) {
      const id = this.openTabs.find(t.type === TabType.Reader)?.id;
      if (!id) {
        return;
      }

      readerManagers[id].loadChapter(version, book, chapter);
    }
  }
});
