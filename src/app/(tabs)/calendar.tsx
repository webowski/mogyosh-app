import { View } from 'react-native'

import Calendar from '@/features/Calendar/Calendar'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'

export default function CalendarScreen() {
	return (
		<View
			style={[
				commonStyles.mainArea,
				{
					paddingHorizontal: STYLE_VARS.sidePaddingSm,
					justifyContent: 'center'
				}
			]}
		>
			<Calendar />
		</View>
	)
}
