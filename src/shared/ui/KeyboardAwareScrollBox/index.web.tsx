import { ScrollView } from 'react-native-gesture-handler'
import { useUnistyles } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import { ScrollViewProps } from 'react-native'

type ScrollBoxProps = ScrollViewProps & {
	scrollIndent?: boolean
}

export default function ScrollBox({
	children,
	scrollIndent = false,
	...props
}: ScrollBoxProps) {
	const { rt } = useUnistyles()

	return (
		<ScrollView
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
			{...props}
		>
			{children}
		</ScrollView>
	)
}
