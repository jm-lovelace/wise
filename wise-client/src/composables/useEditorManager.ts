import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import useFirebase from '../composables/useFirebase'
import { NotePage } from '../types'
import { ref, computed } from 'vue'

const { documentSubscribe, setDocument, user } = useFirebase();

export class EditorManager {
    public tabId: string;
    public EDITOR: Editor;

    private note: NotePage | null = null;
    
    private unsubscribe: (() => void) | null = null;

    private saveTimeout: NodeJS.Timeout | null = null;

    public contentId = ref('');
    public title = ref('');
    public date = ref('');
    public tags = ref<string[]>([]);

    public noteCreated = computed(() => {
        return this.note?.date
    })

    constructor(tabId: string) {
        this.tabId = tabId;

        this.EDITOR = new Editor({
            extensions: [
                StarterKit
            ],
            content: "",
            editable: false,
            editorProps: {
                attributes: {
                    style: "height: 100%"
                }
            },
            onUpdate: async({ editor }) => {
                if (!this.note || !user.value) {
                    return;
                }

                if (this.saveTimeout) {
                    clearTimeout(this.saveTimeout);
                }

                this.saveTimeout = setTimeout(async () => {
                    await setDocument("notes", {
                        ...this.note,
                        title: this.title.value,
                        date: this.date.value,
                        tags: this.tags.value,
                        lastModified: Date.now(),
                        lastModifiedBy: user.value?.id ?? "",
                        htmlContent: editor.getHTML(),
                        rawContent: editor.getText()
                    });
                }, 5000);
            }
        });
    }

    setEditorDocument = async (docId: string) => {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        this.EDITOR.setEditable(true);

        this.EDITOR.commands.clearContent();

        this.contentId.value = docId;

        this.unsubscribe = await documentSubscribe("notes", docId, (doc: NotePage) => {
            this.note = doc;
            this.title.value = doc.title;
            this.date.value = doc.date;
            this.tags.value = doc.tags;
            this.EDITOR.commands.setContent(doc.htmlContent, false);
        });
    }
}