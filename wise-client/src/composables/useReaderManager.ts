import { computed, ref } from 'vue'
import { IDBPDatabase, openDB } from 'idb';
import { Verse, Book, Version, books, useBibleStore, VerseType } from '../stores/bible-store'
import { storeToRefs } from 'pinia';

export class ReaderManager {
    private store: any;
    public versions = ref<Version[]>([]);

    public id: string;
    public currentBook = ref(1);
    public currentChapter = ref(1);
    public currentVersion = ref('esv');
    public verses = ref<Verse[]>([]);
    public selectedVerses = ref<number[]>([]);

    public currentBookName = computed(() => {   
        return books.find(b => b.id === this.currentBook.value)?.name ?? "";
    });

    public chapterLabel = computed(() => {
        return `${this.currentBookName.value} ${this.currentChapter.value}`;
    });

    public currentBookChapters = computed(() => {
        return books.find(b => b.id === this.currentBook.value)?.chapters ?? 1;
    });

    constructor(id: string) {
        this.id = id;
        this.store = useBibleStore();
        const { versions } = storeToRefs(this.store);
        this.versions = versions;

        this.loadChapter('esv', 1, 1);
    }

    loadChapter = async (version: string, book: number, chapter: number) => {
        if (this.versions.value.findIndex(v => v.id === version) === -1) {
            return;
        }   

        this.clearSelection();

        this.verses.value = await this.store.getChapter(version, book, chapter);

        this.verses.value.sort((a, b) => {
            // First, sort by verseNum in ascending order
            if (a.verseNum !== b.verseNum) {
                return a.verseNum - b.verseNum;
            }
            // If verseNum is the same, sort by type in the specified order
            const typeOrder = [VerseType.Heading, VerseType.Subheading, VerseType.Verse];
            return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
        });

        this.currentBook.value = book;
        this.currentChapter.value = chapter;
        this.currentVersion.value = version;
    }

    selectVerse = (verseNum: number, append: boolean) => {
        if (append) {
            this.selectedVerses.value.push(verseNum);
        } else {
            this.selectedVerses.value = [verseNum];
        }
    }

    deselectVerse = (verseNum: number) => {
        this.selectedVerses.value = this.selectedVerses.value.filter(v => v !== verseNum);
    }

    clearSelection = () => {
        this.selectedVerses.value = [];
    }

    toggleVerseRangeSelection = (verseNum: number) => {
        if (this.selectedVerses.value.includes(verseNum)) {
            this.clearSelection();
        } else {
            if (this.selectedVerses.value.length === 0) {
                this.selectVerse(verseNum, true);
            } else {
                const minSelected = Math.min(...this.selectedVerses.value);
                const maxSelected = Math.max(...this.selectedVerses.value);
                const start = Math.min(minSelected, verseNum);
                const end = Math.max(maxSelected, verseNum);
                for (let i = start; i <= end; i++) {
                    if (!this.selectedVerses.value.includes(i)) {
                        this.selectVerse(i, true);
                    }
                }
            }
        }
    }

    public selectedVersesLabel = computed(() => {
        const currentBookName = books.find(b => b.id === this.currentBook.value)?.name;   
        const minVerse = Math.min(...this.selectedVerses.value);
        const maxVerse = Math.max(...this.selectedVerses.value);

        let label = `${currentBookName} ${this.currentChapter.value}:${minVerse}`;

        if (minVerse !== maxVerse) {
            label += `-${maxVerse}`;
        }

        return label;
    });

    public copySelectionToClipboard = () => {
        if (this.selectedVerses.value.length === 0) return;

        const verses = this.verses.value.filter(v => this.selectedVerses.value.includes(v.verseNum));
        const text = verses.map(v => v.rawText).join('\n');
        navigator.clipboard.writeText(text);
    }

    public shareSelection = () => {
      console.log('Sharing selection');
    }
}

