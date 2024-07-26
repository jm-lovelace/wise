import { defineStore } from 'pinia';
import { IDBPDatabase, openDB } from 'idb';
import useFirebase from '../composables/useFirebase'
import Papa from "papaparse";

export type Version = {
  id: string,
  dateUpdated: number
}

export type BibleState = {
  versions: Version[],
  userDefaultVersion: string
}

export type Verse = {
  id: string;
  type: VerseType;
  version: string;
  bookNum: number;
  chapterNum: number;
  verseNum: number;
  rawText: string;
}

export enum VerseType {
  Verse = "verse",
  Heading = "heading",
  Subheading = "subheading"
}

export type Book = {
  id: number;
  name: string;
  chapters: number;
}

export const versionNames: { [key: string]: string } = {
  "esv": "English Standard Version",
  "kjv": "King James Version",
  "niv": "New International Version",
  "nlt": "New Living Translation",
  "msg": "The Message",
  "nasb": "New American Standard Bible"
}

export const books: Book[] = [
  { id: 1, name: 'Genesis', chapters: 50 },
  { id: 2, name: 'Exodus', chapters: 40 },
  { id: 3, name: 'Leviticus', chapters: 27 },
  { id: 4, name: 'Numbers', chapters: 36 },
  { id: 5, name: 'Deuteronomy', chapters: 34 },
  { id: 6, name: 'Joshua', chapters: 24 },
  { id: 7, name: 'Judges', chapters: 21 },
  { id: 8, name: 'Ruth', chapters: 4 },
  { id: 9, name: '1 Samuel', chapters: 31 },
  { id: 10, name: '2 Samuel', chapters: 24 },
  { id: 11, name: '1 Kings', chapters: 22 },
  { id: 12, name: '2 Kings', chapters: 25 },
  { id: 13, name: '1 Chronicles', chapters: 29 },
  { id: 14, name: '2 Chronicles', chapters: 36 },
  { id: 15, name: 'Ezra', chapters: 10 },
  { id: 16, name: 'Nehemiah', chapters: 13 },
  { id: 17, name: 'Esther', chapters: 10 },
  { id: 18, name: 'Job', chapters: 42 },
  { id: 19, name: 'Psalms', chapters: 150 },
  { id: 20, name: 'Proverbs', chapters: 31 },
  { id: 21, name: 'Ecclesiastes', chapters: 12 },
  { id: 22, name: 'Song of Solomon', chapters: 8 },
  { id: 23, name: 'Isaiah', chapters: 66 },
  { id: 24, name: 'Jeremiah', chapters: 52 },
  { id: 25, name: 'Lamentations', chapters: 5 },
  { id: 26, name: 'Ezekiel', chapters: 48 },
  { id: 27, name: 'Daniel', chapters: 12 },
  { id: 28, name: 'Hosea', chapters: 14 },
  { id: 29, name: 'Joel', chapters: 3 },
  { id: 30, name: 'Amos', chapters: 9 },
  { id: 31, name: 'Obadiah', chapters: 1 },
  { id: 32, name: 'Jonah', chapters: 4 },
  { id: 33, name: 'Micah', chapters: 7 },
  { id: 34, name: 'Nahum', chapters: 3 },
  { id: 35, name: 'Habakkuk', chapters: 3 },
  { id: 36, name: 'Zephaniah', chapters: 3 },
  { id: 37, name: 'Haggai', chapters: 2 },
  { id: 38, name: 'Zechariah', chapters: 14 },
  { id: 39, name: 'Malachi', chapters: 4 },
  { id: 40, name: 'Matthew', chapters: 28 },
  { id: 41, name: 'Mark', chapters: 16 },
  { id: 42, name: 'Luke', chapters: 24 },
  { id: 43, name: 'John', chapters: 21 },
  { id: 44, name: 'Acts', chapters: 28 },
  { id: 45, name: 'Romans', chapters: 16 },
  { id: 46, name: '1 Corinthians', chapters: 16 },
  { id: 47, name: '2 Corinthians', chapters: 13 },
  { id: 48, name: 'Galatians', chapters: 6 },
  { id: 49, name: 'Ephesians', chapters: 6 },
  { id: 50, name: 'Philippians', chapters: 4 },
  { id: 51, name: 'Colossians', chapters: 4 },
  { id: 52, name: '1 Thessalonians', chapters: 5 },
  { id: 53, name: '2 Thessalonians', chapters: 3 },
  { id: 54, name: '1 Timothy', chapters: 6 },
  { id: 55, name: '2 Timothy', chapters: 4 },
  { id: 56, name: 'Titus', chapters: 3 },
  { id: 57, name: 'Philemon', chapters: 1 },
  { id: 58, name: 'Hebrews', chapters: 13 },
  { id: 59, name: 'James', chapters: 5 },
  { id: 60, name: '1 Peter', chapters: 5 },
  { id: 61, name: '2 Peter', chapters: 3 },
  { id: 62, name: '1 John', chapters: 5 },
  { id: 63, name: '2 John', chapters: 1 },
  { id: 64, name: '3 John', chapters: 1 },
  { id: 65, name: 'Jude', chapters: 1 },
  { id: 66, name: 'Revelation', chapters: 22 }
];

//IndexedDB

let db: IDBPDatabase | null = null;

export const initializeDb = async () => {
  db = await openDB("BibleDB", 1, {
    upgrade(db, oldVersion, newVersion, transaction, event) {
      const versesStore = db.createObjectStore("verses", { keyPath: "id" });
      versesStore.createIndex("version_book_chapter", ["version", "bookNum", "chapterNum"]);
      versesStore.createIndex('version', 'version');
      const versionsStore = db.createObjectStore("versions", { keyPath: "id" });
    }
  });
}

const { getFileDownloadUrl } = useFirebase();

export const useBibleStore = defineStore('bible', {
  state: (): BibleState => ({
    versions: [],
    userDefaultVersion: 'esv'
  }),
  getters: {

  },
  actions: {
    async loadVersions() {
      if (!db) {
        return;
      }

      const tx = db.transaction('versions', 'readonly');
      const store = tx.objectStore('versions');
      const versions = await store.getAll();

      this.versions = versions as Version[];
    },
    async deleteVersion(version: string) {
      if (!db) {
        return;
      }

      //clear out existing version from IndexedDB if it exists
      const tx = db.transaction('verses', 'readwrite');
      const index = tx.store.index('version');
      await index.getAllKeys('esv').then(keys => {
          keys.forEach(key => {
              tx.store.delete(key);
          });
      });

      await tx.done;

      //delete from versions table
      const versionTx = db.transaction('versions', 'readwrite');
      const versionsStore = versionTx.objectStore('versions');
      await versionsStore.delete(version);
      this.versions = this.versions.filter(v => v.id !== version);
    },
    async downloadVersion(version: string) {
      if (!db) {
        return;
      }

      const _this = this;

      await this.deleteVersion(version);

      //download version csv from Firebase
      const csvUrl = await getFileDownloadUrl(`versions/${version}.csv`);
  
      const verses = [] as Verse[];

      //parse csv
      Papa.parse(csvUrl, {
        download: true,
        worker: true, // Use a worker thread for faster parsing
        step: async function(results) {
          const row = results.data as string[];
          const verse = {
            id: row[0],
            rawText: row[1]
          }
          
          const verseRecord: Verse = {
            id: `${version}-${verse.id}`,
            type: verse.id.startsWith('h') ? VerseType.Heading : verse.id.startsWith('s') ? VerseType.Subheading : VerseType.Verse,
            version: version,
            bookNum: parseInt(verse.id.substring(1,3)),
            chapterNum: parseInt(verse.id.substring(3,6)),
            verseNum: parseInt(verse.id.substring(6,9)),
            rawText: verse.rawText
          }

          verses.push(verseRecord);
        },
        complete: async function() {
          if (!db) return;

          //update verses table
          const tx = db.transaction('verses', 'readwrite');
          const store = tx.objectStore('verses');  
          verses.forEach(verse => {
            store.put(verse);
          });   
          await tx.done;

          //update versions table
          const versionTx = db.transaction('versions', 'readwrite');
          const versionsStore = versionTx.objectStore('versions');
          const versionRecord: Version = { id: version, dateUpdated: Date.now() };
          await versionsStore.put(versionRecord);
          _this.versions.push(versionRecord);
        },
        error: async function(error) {
          console.error('Error parsing CSV:', error);
          await _this.deleteVersion(version);
        }
      });
    },
    async getChapter(version: string, bookNum: number, chapterNum: number) {
      if (!db) {
        return [];
      }

      if (!(this.versions.find(v => v.id === version))) {
        return [];
      }
      
      const transaction = db.transaction('verses', 'readonly');
      const store = transaction.objectStore('verses');
      const index = store.index('version_book_chapter');
      const key = [version, bookNum, chapterNum];
      const versesData = await index.getAll(key);
    
      return versesData as Verse[];
    }
  },
});
