import { View } from 'react-native'

import Calendar from '@/features/Calendar/Calendar'
import { commonStyles, styleVars } from '@/shared/styles/common'

export default function CalendarScreen() {
	return (
		<View
			style={[
				commonStyles.mainArea,
				{
					paddingHorizontal: styleVars.sidePaddingSm,
					justifyContent: 'center'
				}
			]}
		>
			<Calendar />
		</View>
	)
}
