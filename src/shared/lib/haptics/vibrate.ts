/**
 * Triggers device vibration pattern if supported and enabled in settings.
 * @param pattern Vibration pattern in ms (e.g. [100] or [50, 100, 50])
 * @param enabled Whether haptics are enabled in user preferences
 */
export const triggerVibrate = (pattern: number[], enabled: boolean): void => {
  if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration API error:', e);
    }
  }
};

/**
 * Trigger a short vibration for standard touch/click events (a clean tactile tick).
 */
export const vibrateClick = (enabled: boolean): void => {
  triggerVibrate([15], enabled);
};

/**
 * Trigger a medium tick for tab switches or dialog interactions.
 */
export const vibrateTick = (enabled: boolean): void => {
  triggerVibrate([30], enabled);
};

/**
 * Trigger a double-tap soft bounce vibration for correct quiz answers.
 */
export const vibrateSuccess = (enabled: boolean): void => {
  triggerVibrate([45, 35, 45], enabled);
};

/**
 * Trigger a distinct warning sequence (heavy double pulse) for errors or heart loss.
 */
export const vibrateError = (enabled: boolean): void => {
  triggerVibrate([120, 80, 220], enabled);
};

/**
 * Trigger a complex triumph vibration for finishing lessons or milestones.
 */
export const vibrateComplete = (enabled: boolean): void => {
  triggerVibrate([50, 50, 50, 50, 100], enabled);
};

