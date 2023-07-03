import { useEffect, useCallback, useRef } from 'react';
import { isEqual } from 'lodash';

import type { EffectCallback, DependencyList } from 'react';

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

/**
 * Accepts a function that contains imperative, possibly effectful code.
 *
 * @param effect Imperative function that can return a cleanup function
 * @param deps If present, effect will only activate if the values in the list change.
 */
export function useDeepEffect(effect: EffectCallback, deps?: DependencyList) {
  const ref = useRef<DependencyList | undefined>();

  if (ref.current === void 0 || !isEqual(ref.current, deps)) ref.current = deps;

  useEffect(effect, ref.current);
}

/**
 * `useEventCallback` will return a memoized version of the callback that only changes if one of the `inputs`
 * has changed.
 */
export function useEventCallback<T extends Function>(fn: T): T {
  const ref = useRef<T>(fn);

  useEffect(() => {
    ref.current = fn;
  });

  return useCallback(
    (...args: unknown[]) => ref.current.apply(void 0, args),
    []
  ) as unknown as T;
}
