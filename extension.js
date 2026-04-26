import St from 'gi://St';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>?@#$^&";
const UA = "йцукенгшщзхїфівапролджєячсмитьбю.ЙЦУКЕНГШЩЗХЇФІВАПРОЛДЖЄЯЧСМИТЬБЮ,\"№;:?";

export default class LayoutFixer extends Extension {
    enable() {
        this._settings = this.getSettings('org.gnome.shell.extensions.layout-fixer');
        let backend = Clutter.get_default_backend();
        this._keyboard = backend.get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
        this._timeoutIds = new Set();

        Main.wm.addKeybinding(
            'shortcut-key',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => this._fixLayout()
        );
    }

    disable() {
        Main.wm.removeKeybinding('shortcut-key');

        if (this._timeoutIds) {
            for (let id of this._timeoutIds) {
                GLib.source_remove(id);
            }
            this._timeoutIds.clear();
        }

        this._settings = null;
        this._keyboard = null;
        this._timeoutIds = null;
    }

    _addTimeout(interval, func) {
        let id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
            this._timeoutIds.delete(id);
            return func();
        });
        this._timeoutIds.add(id);
        return id;
    }

    _fixLayout() {
        let clipboard = St.Clipboard.get_default();
        
        clipboard.get_text(St.ClipboardType.CLIPBOARD, (clip, oldClipboardText) => {
            this._addTimeout(250, () => {
                this._emitKey(Clutter.KEY_Control_L, true);
                this._emitKey(Clutter.KEY_c, true);
                this._emitKey(Clutter.KEY_c, false);
                this._emitKey(Clutter.KEY_Control_L, false);

                this._addTimeout(100, () => {
                    clipboard.get_text(St.ClipboardType.CLIPBOARD, (clip, text1) => {
                        let isEditorEmptyCopy = text1 && (text1.endsWith('\n') || text1.endsWith('\r\n'));
                        
                        if (text1 && text1 !== oldClipboardText && !isEditorEmptyCopy) {
                            this._transliterateAndPaste(text1, oldClipboardText, clipboard);
                        } else {
                            clipboard.set_text(St.ClipboardType.CLIPBOARD, oldClipboardText || "");

                            this._addTimeout(50, () => {
                                this._emitKey(Clutter.KEY_Control_L, true);
                                this._emitKey(Clutter.KEY_Shift_L, true);
                                this._emitKey(Clutter.KEY_Left, true);
                                this._emitKey(Clutter.KEY_Left, false);
                                this._emitKey(Clutter.KEY_Shift_L, false);
                                this._emitKey(Clutter.KEY_Control_L, false);

                                this._addTimeout(100, () => {
                                    this._emitKey(Clutter.KEY_Control_L, true);
                                    this._emitKey(Clutter.KEY_c, true);
                                    this._emitKey(Clutter.KEY_c, false);
                                    this._emitKey(Clutter.KEY_Control_L, false);

                                    this._addTimeout(100, () => {
                                        clipboard.get_text(St.ClipboardType.CLIPBOARD, (clip, text2) => {
                                            if (text2 && text2 !== oldClipboardText) {
                                                this._transliterateAndPaste(text2, oldClipboardText, clipboard);
                                            }
                                        });
                                        return GLib.SOURCE_REMOVE;
                                    });
                                    return GLib.SOURCE_REMOVE;
                                });
                                return GLib.SOURCE_REMOVE;
                            });
                        }
                    });
                    return GLib.SOURCE_REMOVE;
                });
                return GLib.SOURCE_REMOVE;
            });
        });
    }

    _transliterateAndPaste(selectedText, oldClipboardText, clipboard) {
        let isEng = false;
        for (let i = 0; i < selectedText.length; i++) {
            if (EN.includes(selectedText[i])) { isEng = true; break; }
            if (UA.includes(selectedText[i])) { isEng = false; break; }
        }

        let from = isEng ? EN : UA;
        let to = isEng ? UA : EN;
        let converted = selectedText.split('').map(c => {
            let idx = from.indexOf(c);
            return idx !== -1 ? to[idx] : c;
        }).join('');

        clipboard.set_text(St.ClipboardType.CLIPBOARD, converted);
        
        this._addTimeout(100, () => {
            this._emitKey(Clutter.KEY_Control_L, true);
            this._emitKey(Clutter.KEY_v, true);
            this._emitKey(Clutter.KEY_v, false);
            this._emitKey(Clutter.KEY_Control_L, false);

            this._addTimeout(400, () => {
                if (oldClipboardText) {
                    clipboard.set_text(St.ClipboardType.CLIPBOARD, oldClipboardText);
                }
                return GLib.SOURCE_REMOVE;
            });
            return GLib.SOURCE_REMOVE;
        });
    }

    _emitKey(keyval, state) {
        let time = Clutter.get_current_event_time();
        if (time === 0) time = Math.floor(GLib.get_monotonic_time() / 1000);
        let keyState = state ? Clutter.KeyState.PRESSED : Clutter.KeyState.RELEASED;
        this._keyboard.notify_keyval(time, keyval, keyState);
    }
}
