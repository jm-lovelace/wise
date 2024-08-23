import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import useFirebase from '../composables/useFirebase'
import { NotePage } from '../types'

const { documentSubscribe, setDocument, user } = useFirebase();

export class EditorManager {
    public id: string;
    public EDITOR: Editor;

    private note: NotePage | null = null;
    
    private unsubscribe: (() => void) | null = null;

    constructor(id: string) {
        this.id = id;

        this.EDITOR = new Editor({
            extensions: [
                StarterKit
            ],
            content: "",
            editable: false,
            onUpdate: async({ editor }) => {
                if (!this.note || !user.value) {
                    return;
                }

                await setDocument("notes", {
                    ...this.note,
                    lastModified: Date.now(),
                    lastModifiedBy: user.value.id,
                    htmlContent: editor.getHTML(),
                    rawContent: editor.getText()
                });
            }
        });
    }

    setEditorDocument = async (docId: string) => {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        this.EDITOR.setEditable(true);

        this.EDITOR.commands.clearContent();

        this.unsubscribe = await documentSubscribe("notes", docId, (doc: NotePage) => {
            this.note = doc;
            this.EDITOR.commands.setContent(doc.htmlContent, false);
        });
    }
}