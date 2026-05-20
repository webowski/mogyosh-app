import { STYLE_VARS } from '@/shared/styles/common'
import { PropsWithChildren } from 'react'
import { View, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type ActionsPanelProps = PropsWithChildren & {
	style?: ViewStyle | ViewStyle[]
}

export const ActionsPanel = ({
	children,
	style,
	...rest
}: ActionsPanelProps) => {
	return (
		<View pointerEvents='box-none' style={[styles.screenActions, style]}>
			{children}
		</View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	screenActions: {
		boxSizing: 'content-box',
		paddingHorizontal: STYLE_VARS.sidePadding,
		// paddingVertical: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',

		position: 'absolute',
		left: 0,
		right: 0,
		// bottom: rt.insets.bottom === 0 ? 20 : rt.insets.bottom,
		bottom: STYLE_VARS.sidePadding
	}
}))
