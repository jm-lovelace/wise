import { boot } from 'quasar/wrappers'
import useFirebase from '../composables/useFirebase'
import { useNotesStore } from '../stores/notes-store';
import { watch } from 'vue';

const { initialize, user } = useFirebase();

const firebaseConfig = {
  apiKey: "AIzaSyBtAAsl4ztjqgft3A205T_mPj6zR9mJHBY",
  authDomain: "wisebibleapp.firebaseapp.com",
  projectId: "wisebibleapp",
  storageBucket: "wisebibleapp.appspot.com",
  messagingSenderId: "313875673249",
  appId: "1:313875673249:web:df88cdbf825a3c0dd100e0",
  measurementId: "G-00V17JTJ7S"
};


initialize(firebaseConfig);

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  const store = useNotesStore();

  watch(user, (newUser) => {
    if (newUser) {
      store.notesSubscribe();
    }
  });
})
