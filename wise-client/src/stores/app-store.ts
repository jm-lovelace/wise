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
  contentId: string;
  label: string;
  pane: number;
  index: number;
}

export type AppState = {
  openTabs: Tab[],
  activeTabs: string[] // array of two tab ids, one for each pane
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
      const tabId = uuidv4();

      readerManagers[tabId] = new ReaderManager(tabId);

      const tab: Tab = {
        id: tabId,
        type: TabType.ChapterSelection,
        label: "Select Chapter",
        pane: pane,
        contentId: '',
        index: this.openTabs.filter(t => t.pane === pane).length
      }; 

      this.openTabs.push(tab);
      this.activeTabs[pane] = tabId;
    },
    async newEditorTab(pane: number, noteId: string | null) {
      if (!user.value) {
        return;
      }

      if (!noteId) {
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
        noteId = newNote.id;
      }

      //create tab
      const tabId = uuidv4();
      const tab: Tab = {
        id: tabId,
        type: TabType.Notes,
        label: "",
        pane: pane,
        contentId: noteId,
        index: this.openTabs.filter(t => t.pane === pane).length
      };

      editorManagers[tabId] = new EditorManager(tabId);

      editorManagers[tabId].setEditorDocument(noteId);

      this.openTabs.push(tab);
      this.activeTabs[pane] = tabId;
    },
    closeTab(id: string) {
      const tab = this.openTabs.find(t => t.id === id);
      if (!tab) {
        return;
      }

      if (id in readerManagers) {
        delete readerManagers[id];
      };

      if (id in editorManagers) {
        delete editorManagers[id];
      };

      this.openTabs.splice(this.openTabs.indexOf(tab), 1);
    },
    activateTabByContent(type: TabType, contentId: string, pane: number | null) {
      const id = this.openTabs.find(t => t.type === type && t.contentId === contentId && (!pane || t.pane === pane))?.id;
      if (!id) {
        return false;
      }

      this.activeTabs[pane ?? 0] = id;

      return true;
    },
    activateReaderTab(version: string, book: number, chapter: number, pane: number | null) {
      const contentId = `${version}-${book}-${chapter}`;
      const success = this.activateTabByContent(TabType.Reader, contentId, pane);
      if (!success) {
        this.newReaderTab(pane ?? 0);
        readerManagers[this.activeTabs[pane ?? 0]].loadChapter(version, book, chapter);
      }
    },
    activateEditorTab(noteId: string, pane: number | null) {
      const success = this.activateTabByContent(TabType.Notes, noteId, pane);
      if (!success) {
        this.newEditorTab(pane ?? 0, noteId);
      }
    }
  }
});
