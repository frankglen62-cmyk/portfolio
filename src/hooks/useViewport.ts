import { useSyncExternalStore } from 'react';
import {
  getViewportState,
  subscribeViewport,
  type ViewportState,
} from '../lib/viewportStage';

/**
 * Single source of truth for "am I on the mobile canvas?" and "how much is the
 * page scaled?". Replaces every `window.matchMedia('(max-width: 809px)')` and
 * raw `window.innerWidth` read in the app, so nothing can disagree about which
 * composition is on screen.
 */
export const useViewport = (): ViewportState =>
  useSyncExternalStore(subscribeViewport, getViewportState, getViewportState);

export const useIsMobileCanvas = (): boolean => useViewport().mode === 'mobile';
