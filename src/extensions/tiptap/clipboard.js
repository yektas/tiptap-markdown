import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DOMParser } from '@tiptap/pm/model';
import { elementFromString } from "../../util/dom";

export const MarkdownClipboard = Extension.create({
    name: 'markdownClipboard',
    addOptions() {
        return {
            transformPastedText: false,
            transformCopiedText: false,
        }
    },
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('markdownClipboard'),
                props: {
                    clipboardTextParser: (text, context, plainText) => {
                        if(plainText || !this.options.transformPastedText || !this.editor.storage.markdown) {
                            return null; // pasting with shift key prevents formatting
                        }
                        const parsed = this.editor.storage.markdown.parser.parse(text, { inline: true });
                        return DOMParser.fromSchema(this.editor.schema)
                            .parseSlice(elementFromString(parsed), {
                                preserveWhitespace: true,
                                context,
                            });
                    },
                    /**
                     * @param {import('prosemirror-model').Slice} slice
                     */
                    clipboardTextSerializer: (slice) => {
                        if(!this.options.transformCopiedText || !this.editor.storage.markdown) {
                            return null;
                        }
                        return this.editor.storage.markdown.serializer.serialize(slice.content);
                    },
                },
            })
        ]
    }
})
