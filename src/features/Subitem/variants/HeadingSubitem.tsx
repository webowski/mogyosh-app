import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import { TEXT_VARS } from '@/shared/styles/text'
import Checkbox from '@/shared/ui/Checkbox'
import { SubitemProps } from '../index'

type HeadingVariant = 'h1' | 'h2' | 'h3' | 'h4'

type HeadingProps = SubitemProps & {
	variant: HeadingVariant
}

const HEADING_SIZES: Record<HeadingVariant, number> = {
	h1: TEXT_VARS.h1,
	h2: TEXT_VARS.h2,
	h3: TEXT_VARS.h3,
	h4: TEXT_VARS.h4
}

export default function HeadingSubitem({
	data,
	variant,
	onCheckToggle
}: HeadingProps) {
	const [checked, setChecked] = useState(data.state === 'done')

	const animationProgress = useSharedValue(checked ? 1 : 0)

	useEffect(
		() => {
			animationProgress.value = withTiming(checked ? 1 : 0, { duration: 250 })
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[checked]
	)

	const handlePressCheckbox = useCallback(
		() => {
			setChecked(!checked)
			onCheckToggle?.(!checked)
		},
		// eslint-disable-next-line
		[checked]
	)

	const textStyle = useAnimatedStyle(() => ({
		opacity: withTiming(checked ? STYLE_VARS.checkedOpacity : 1, {
			duration: STYLE_VARS.duration.md
		})
	}))

	return (
		<View style={styles.container}>
			<Animated.Text
				style={[styles.heading(HEADING_SIZES[variant]), textStyle]}
			>
				{data.info}
			</Animated.Text>
			{data.settings?.checkable && (
				<Checkbox checked={checked} onPress={handlePressCheckbox} />
			)}
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 6
	},

	heading: (headingFontSize: number) => ({
		flex: 1,
		fontSize: headingFontSize,
		fontWeight: 700,
		color: theme.colors.major
	})
}))
