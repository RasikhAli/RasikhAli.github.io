import { useEffect } from "react";

type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

export function useKeyboard(
  shortcuts: { combo: KeyCombo; callback: (e: KeyboardEvent) => void }[]
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const { combo, callback } = shortcut;
        const keyMatch = event.key.toLowerCase() === combo.key.toLowerCase();
        
        const ctrlMatch = combo.ctrlKey === undefined || event.ctrlKey === combo.ctrlKey;
        const metaMatch = combo.metaKey === undefined || event.metaKey === combo.metaKey;
        const altMatch = combo.altKey === undefined || event.altKey === combo.altKey;
        const shiftMatch = combo.shiftKey === undefined || event.shiftKey === combo.shiftKey;

        if (keyMatch && (ctrlMatch || metaMatch) && altMatch && shiftMatch) {
          event.preventDefault();
          callback(event);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
