import { useEffect } from 'react';

// Restore focus on teardown
export const useRestoreFocus = (
  // The ref for the element to receive initial focus
  focusRef: React.RefObject<HTMLElement>,
  // Allow for an optional root element that must exist
  root: boolean | HTMLElement | null = true
): void => {
  useEffect(() => {
    if (!root) {
      return undefined;
    }

    const lastFocused = document.activeElement as HTMLElement;

    if (focusRef.current) {
      focusRef.current.focus();
    }

    return () => {
      // This ensures that the focus is returned to
      // previous element
      setTimeout(() => {
        if (lastFocused && lastFocused.focus) {
          lastFocused.focus();
        }
      });
    };
  }, [focusRef, root]);
};
