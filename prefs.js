import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class LayoutFixerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings('org.gnome.shell.extensions.layout-fixer');
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({ title: 'Keyboard Shortcut' });

        const row = new Adw.ActionRow({
            title: 'Action Shortcut',
            subtitle: settings.get_strv('shortcut-key')[0] || 'Alt+A'
        });

        const shortcutLabel = new Gtk.ShortcutLabel({
            accelerator: settings.get_strv('shortcut-key')[0] || '<Alt>a',
            valign: Gtk.Align.CENTER
        });

        const editBtn = new Gtk.Button({
            label: 'Record',
            valign: Gtk.Align.CENTER,
            css_classes: ['suggested-action']
        });

        const keyController = new Gtk.EventControllerKey();
        window.add_controller(keyController);

        editBtn.connect('clicked', () => {
            editBtn.label = 'Press keys...';
            let conn = keyController.connect('key-pressed', (controller, keyval, keycode, state) => {
                let mask = state & Gtk.accelerator_get_default_mod_mask();
                let accel = Gtk.accelerator_name(keyval, mask);
                if (accel) {
                    settings.set_strv('shortcut-key', [accel]);
                    shortcutLabel.accelerator = accel;
                    row.subtitle = accel;
                    editBtn.label = 'Record';
                    keyController.disconnect(conn);
                }
                return true;
            });
        });

        row.add_suffix(shortcutLabel);
        row.add_suffix(editBtn);
        group.add(row);
        page.add(group);
        window.add(page);
    }
}
