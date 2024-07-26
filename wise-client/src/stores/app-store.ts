import { defineStore } from 'pinia';
import { ReaderManager } from '../composables/useReaderManager';
import { v4 as uuidv4 } from 'uuid';

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
    closeTab(id: string) {
      const tab = this.openTabs.find(t => t.id === id);
      if (!tab) {
        return;
      }

      const readerManager = readerManagers[id];
      if (readerManager) {
        delete readerManagers[id];
      }

      this.openTabs.splice(this.openTabs.indexOf(tab), 1);
    }
  }
});
