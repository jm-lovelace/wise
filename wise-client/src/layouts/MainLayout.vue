<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer v-model="sidebar" side="right" mini persistent bordered>
      <q-list padding>
        <q-item clickable v-ripple @click="activateSidePanelPage(SidePanelPage.Settings)">
          <q-item-section avatar>
            <q-avatar color="secondary" class="text-white">JL</q-avatar>
          </q-item-section>
          <q-tooltip>Account & Settings</q-tooltip>
        </q-item>
        <q-separator class="q-mb-md" />
        <q-item clickable v-ripple @click="activateSidePanelPage(SidePanelPage.AIChat)">
          <q-item-section avatar class="text-primary">
            <q-icon name="auto_awesome" />
          </q-item-section>
          <q-tooltip>AI Study Buddy</q-tooltip>
        </q-item>
        <q-item clickable v-ripple @click="activateSidePanelPage(SidePanelPage.Notes)">
          <q-item-section avatar>
            <q-icon name="edit_document" />
          </q-item-section>
          <q-tooltip>Your Notes</q-tooltip>
        </q-item>

      
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-splitter 
        reverse 
        :limits="[0, 100]" 
        :disable="!sidePanel" 
        v-model="actualSidePanelWidth"
        :separator-style="sidePanel ? 'width: 5px' : 'width: 0px'"
      >
        <template v-slot:before>
          <router-view />
        </template>

        <template v-slot:after>
          <AccountPanel v-if="sidePanelPage === SidePanelPage.Settings" />
        </template>
      </q-splitter>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import AccountPanel from '../components/AccountPanel.vue';

enum SidePanelPage {
  AIChat = 'ai_chat',
  Notes = 'notes',
  Settings = 'settings'
}

import { ref, watch, computed } from 'vue';

const sidebar = ref(true);
const sidePanel = ref(false);

const sidePanelPage = ref('');

const sidePanelWidth = ref(30);

const actualSidePanelWidth = computed({
  get: () => {
    return sidePanel.value ? sidePanelWidth.value : 0;
  },
  set: (value) => {
    sidePanelWidth.value = value;
  }
})

const toggleSidePanel = () => {
  sidePanel.value = !sidePanel.value;
};

const activateSidePanelPage = (page: SidePanelPage) => {
  toggleSidePanel();
  if (sidePanel.value) {
    sidePanelPage.value = page;
  }
}


</script>




