import { boot } from 'quasar/wrappers'
import { initializeDb, useBibleStore } from "../stores/bible-store";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  await initializeDb();

  const store = useBibleStore();
  await store.loadVersions();
})
