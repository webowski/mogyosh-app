import { ScrollView } from 'react-native-gesture-handler'

import { STYLE_VARS } from '@/shared/styles/common'
import { useUnistyles } from 'react-native-unistyles'

type ScrollBoxProps = React.ComponentProps<typeof ScrollView> & {
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
					flexGrow: 1,
					flexShrink: 0,
					paddingHorizontal: STYLE_VARS.sidePadding,
					paddingTop: STYLE_VARS.sidePadding,
					paddingBottom: STYLE_VARS.sidePadding + STYLE_VARS.navPanelUnderlap,
					gap: 6
				},
				scrollIndent && {
					paddingBottom: rt.insets.bottom + STYLE_VARS.sidePadding + 70
				}
			]}
			{...props}
		>
			{children}
		</ScrollView>
	)
}
