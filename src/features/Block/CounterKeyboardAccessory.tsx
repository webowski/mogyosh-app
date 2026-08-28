import { Pressable, Text, View } from 'react-native'
import { KeyboardToolbar } from 'react-native-keyboard-controller'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import { useCounterAccessoryStore } from './model/counterAccessory.store'

export default function CounterKeyboardAccessory() {
	const { theme } = useUnistyles()
	const isActive = useCounterAccessoryStore((state) => state.isActive)
	const stepHandlerRef = useCounterAccessoryStore(
		(state) => state.stepHandlerRef
	)

	const handleStep = (step: number) => {
		stepHandlerRef.current?.(step)
	}

	return (
		<KeyboardToolbar enabled={isActive}>
			<KeyboardToolbar.Background>
				<View
					style={{
						backgroundColor: theme.colors.surfaceClosest,
						position: 'absolute',
						top: 0,
						left: 0,
						bottom: 0,
						right: 0,
						boxShadow: theme.colors.shadeToolbar
					}}
				/>
			</KeyboardToolbar.Background>
			<KeyboardToolbar.Content style={{ height: 120 }}>
				<View style={styles.CounterValueAccessory}>
					<Pressable
						style={styles.CounterValueAccessory__button}
						onPress={() => handleStep(-1)}
					>
						<Text style={styles.CounterValueAccessory__buttonText}>-1</Text>
					</Pressable>
					<Pressable
						style={styles.CounterValueAccessory__button}
						onPress={() => handleStep(1)}
					>
						<Text style={styles.CounterValueAccessory__buttonText}>+1</Text>
					</Pressable>

					{/* <Button
						variant='bare'
						onPress={() => handleStep(1)}
						preventFocusSteal
					>
						<MaterialDesignIcons
							name='plus-thick'
							color={theme.colors.major}
							size={24}
						/>
					</Button> */}
				</View>
			</KeyboardToolbar.Content>
		</KeyboardToolbar>
	)
}

const styles = StyleSheet.create((theme) => ({
	CounterValueAccessory: {
		flexDirection: 'row',
		gap: 8,
		paddingHorizontal: STYLE_VARS.sidePadding_2xs,
		paddingTop: 4,
		paddingBottom: 4,
		height: 60,
		backgroundColor: theme.colors.surfaceClosest
		// backgroundColor: 'black'
	},
	CounterValueAccessory__button: {
		flex: 1,
		height: 43,
		paddingVertical: 6,
		paddingHorizontal: 8,
		borderRadius: STYLE_VARS.radius_md,
		alignItems: 'center',
		backgroundColor: theme.colors.surfaceDeep
	},
	CounterValueAccessory__buttonText: {
		fontSize: 20,
		fontWeight: '600',
		color: theme.colors.major
	}
}))
