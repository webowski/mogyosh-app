import { ScrollViewProps } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useUnistyles } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'

type ScrollBoxProps = ScrollViewProps & {
	scrollIndent?: boolean
}

export default function KeyboardAwareScrollBox({
	children,
	scrollIndent = false,
	...props
}: ScrollBoxProps) {
	const { rt } = useUnistyles()

	return (
		<KeyboardAwareScrollView
			style={{
				flex: 1
			}}
			contentContainerStyle={[
				{
					gap: 18,
					paddingTop: STYLE_VARS.sidePadding,
					paddingBottom:
						STYLE_VARS.sidePadding + STYLE_VARS.navPanelUnderlap + 12,
					paddingHorizontal: STYLE_VARS.sidePadding
				},
				scrollIndent && {
					paddingBottom: rt.insets.bottom + STYLE_VARS.sidePadding + 70
				}
			]}
			keyboardShouldPersistTaps='handled'
			bottomOffset={80}
			{...props}
		>
			{children}
		</KeyboardAwareScrollView>
	)
}
