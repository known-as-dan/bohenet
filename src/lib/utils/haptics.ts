/**
 * Haptic feedback utility for mobile devices.
 * Uses the Vibration API (Android Chrome, etc.).
 * Gracefully no-ops on unsupported platforms (iOS Safari).
 */

export type HapticStyle =
	| 'light'
	| 'medium'
	| 'heavy'
	| 'success'
	| 'warning'
	| 'error'
	| 'selection';

const patterns: Record<HapticStyle, number | number[]> = {
	light: 8,
	medium: 15,
	heavy: 25,
	success: [10, 60, 10],
	warning: [15, 40, 15],
	error: [25, 50, 25, 50, 25],
	selection: 4
};

export function haptic(style: HapticStyle = 'light') {
	try {
		navigator?.vibrate?.(patterns[style]);
	} catch {
		// Haptics are an optional enhancement
	}
}
