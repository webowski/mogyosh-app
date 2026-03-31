import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export const SettingsItem = ({
	label,
	control
}: {
	label: string
	control: React.ReactNode
}) => {
	return (
		<View style={styles.settingsItem}>
			<View style={styles.settingsLabel}>
				<Text style={styles.label}>{label}</Text>
			</View>
			<View style={styles.settingsControl}>{control}</View>
		</View>
	)
}

const styles = StyleSheet.create((themes) => ({
	settingsItem: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	settingsLabel: {
		flex: 1
	},
	label: {
		fontSize: 16,
		color: themes.colors.major,
		fontWeight: '600'
	},
	settingsControl: {}
}))
