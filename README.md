<div align="center">
  <img src="icon.svg" width="128" alt="Layout Fixer Logo">
  <h1>Layout Fixer</h1>
  <p><b>A native GNOME extension designed for Wayland that instantly corrects text typed in the wrong keyboard layout (EN ↔ UA).</b></p>
</div>


## ✨ Features

* **Native Wayland Support:** Uses `Clutter.VirtualDevice` to emit keystrokes. No `uinput` or root privileges required.
* **Clipboard Protection:** Automatically saves and restores your previous clipboard content after reclacing the text.
* **GUI Configuration:** Easily bind a custom shortcut (default is `Alt+A`) via the built-in preferences using an interactive key recorder.
* **Zero Dependencies:** Built using pure GJS and GNOME APIs.

## 📦 Compatibility

* GNOME Shell: **50**
* Session: **Wayland** (X11 is supported but optimized for Wayland architecture).

## 🛠️ Installation

### Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/git-hntr/layout-fixer.git
   ```
2. Create the extension directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/layout-fixer@hntr
   ```
3. Copy the files:
   ```bash
   cp -r layout-fixer/* ~/.local/share/gnome-shell/extensions/layout-fixer@hntr/
   ```
4. Compile the GSettings schemas:
   ```bash
   glib-compile-schemas ~/.local/share/gnome-shell/extensions/layout-fixer@hntr/schemas/
   ```
5. **Log out and log back in.** (Crucial step for GNOME on Wayland to detect new local extensions).
6. Enable the extension using the **Extension Manager** app or via terminal:
   ```bash
   gnome-extensions enable layout-fixer@hntr
   ```

## ⚙️ How It Works (Under the Hood)

Due to Wayland's strict security model, applications cannot inject text into other windows directly. This extension runs with compositor privileges and performs the following micro-operations in less than half a second:

1. Reads and backs up the current `St.Clipboard` state.
2. Emits a synthetic `Ctrl+C` event via `Clutter.VirtualDevice` to capture the selected text.
3. Analyzes the string and performs EN ↔ UA transliteration.
4. Writes the corrected text to the clipboard and emits `Ctrl+V`.
5. Restores the original clipboard content after a brief delay.

## 🔧 Configuration

1. Open **Extension Manager**.
2. Click the gear icon (⚙️) next to **Layout Fixer**.
3. Click "Record" and press your desired key combination. Changes apply instantly.

---
Developed by [hntr](https://github.com/git-hntr)
