import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { commonStyles } from '@/shared/styles/common'

type ScrollBoxProps = React.ComponentProps<typeof ScrollView> & {
	scrollIndent?: boolean
}

export default function ScrollBox({
	children,
	scrollIndent = false,
	...props
}: ScrollBoxProps) {
	return (
		<ScrollView
			style={commonStyles.scrollBox}
			contentContainerStyle={{ flexGrow: 1 }}
			{...props}
		>
			<View
				style={[
					commonStyles.mainArea,
					scrollIndent && commonStyles.scrollIndent
				]}
			>
				{children}
			</View>
		</ScrollView>
	)
}
