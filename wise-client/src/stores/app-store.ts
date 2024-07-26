import { defineStore } from 'pinia';
import { ReaderManager } from '../composables/useReaderManager';
import { v4 as uuidv4 } from 'uuid';

export enum TabType {
  Reader = "reader",
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

const readerManagers: ReaderManager[] = [];

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
        type: TabType.Reader,
        label: "",
        pane: pane,
        index: this.openTabs.filter(t => t.pane === pane).length
      };

      readerManagers.push(new ReaderManager(id));;

      this.openTabs.push(tab);
      this.activeTabs[pane] = id
    },
    closeTab(id: string) {
      const tab = this.openTabs.find(t => t.id === id);
      if (!tab) {
        return;
      }

      const readerManager = readerManagers.find(rm => rm.id === id);
      if (readerManager) {
        readerManagers.splice(readerManagers.indexOf(readerManager), 1);
      }

      this.openTabs.splice(this.openTabs.indexOf(tab), 1);
    }
  }
});
