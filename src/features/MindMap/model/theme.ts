import { STATIC_COLORS } from '@/shared/styles/themes'
import { UnistylesRuntime } from 'react-native-unistyles'
import type { NodeType } from './types'

const colors = UnistylesRuntime.getTheme(UnistylesRuntime.themeName).colors

export function getNodeColors(type: NodeType) {
	// const colors = UnistylesRuntime.getTheme(UnistylesRuntime.themeName).colors

	return {
		root: {
			bg: colors.mutedSubtlestFill,
			text: STATIC_COLORS.white,
			border: colors.primary
		},
		category: {
			bg: colors.primary,
			text: STATIC_COLORS.white,
			border: colors.primary
		},
		subcategory: {
			bg: colors.mutedSubtleFill,
			text: STATIC_COLORS.white,
			border: colors.mutedSubtleFill
		},
		task: {
			bg: colors.surface,
			text: colors.major,
			border: colors.mutedSubtlerFill
		}
	}[type]
}

export const LINE_MINOR_COLOR = colors.mutedSubtlerFill
export const EDGE_COLOR = colors.primary
export const CANVAS_BG = colors.surfaceDeep
