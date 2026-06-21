import { STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'
import { MaterialIcons } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type EditorPanelProps = {
	onBold?: () => void
	onItalic?: () => void
	onDelete?: () => void
}

export default function EditorPanel({
	onBold,
	onItalic,
	onDelete
}: EditorPanelProps) {
	return (
		<View
			style={{
				height: 48,
				flexDirection: 'row',
				alignItems: 'center',
				paddingHorizontal: STYLE_VARS.sidePadding,
				backgroundColor: '#fff',
				borderTopWidth: StyleSheet.hairlineWidth,
				borderColor: '#ddd',
				gap: 6
			}}
		>
			<Button variant='pill' onPress={onBold}>
				𝐁
			</Button>
			<Button variant='pill' onPress={onItalic}>
				𝐼
			</Button>
			<Button variant='pill' onPress={onDelete}>
				<MaterialIcons name='delete' size={24} />
			</Button>
		</View>
	)
}
