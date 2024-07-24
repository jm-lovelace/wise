import { computed, ref } from 'vue'
import { IDBPDatabase, openDB } from 'idb';
import { Verse, Book, Version, books, useBibleStore } from '../stores/bible-store'
import { storeToRefs } from 'pinia';

export class PageManager {
    private store: any;
    private versions = ref<Version[]>([]);

    public currentBook = ref(1);
    public currentChapter = ref(1);
    public currentVersion = ref('esv');
    public verses = ref<Verse[]>([]);

    public currentBookName = computed(() => {   
        return books.find(b => b.id === this.currentBook.value)?.name ?? "";
    });

    public chapterLabel = computed(() => {
        return `${this.currentBookName.value} ${this.currentChapter.value}`;
    });

    constructor() {
        this.store = useBibleStore();
        const { versions } = storeToRefs(this.store);
        this.versions = versions;
    }

    loadChapter = async (version: string, book: number, chapter: number) => {
        if (this.versions.value.findIndex(v => v.id === version) === -1) {
            return;
        }   

        this.verses.value = await this.store.getChapter(version, book, chapter);
    }
}
