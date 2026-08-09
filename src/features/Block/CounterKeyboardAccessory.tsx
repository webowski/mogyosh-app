import { Pressable, Text, View } from 'react-native'
import { KeyboardExtender } from 'react-native-keyboard-controller'

import { useCounterAccessoryStore } from './model/counterAccessory.store'
import { blockStyles } from './style'

export default function CounterKeyboardAccessory() {
	const isActive = useCounterAccessoryStore((state) => state.isActive)
	const stepHandlerRef = useCounterAccessoryStore(
		(state) => state.stepHandlerRef
	)

	const handleStep = (step: number) => {
		stepHandlerRef.current?.(step)
	}

	return (
		<KeyboardExtender enabled={isActive}>
			<View style={blockStyles.CounterValueAccessory}>
				<Pressable
					style={blockStyles.CounterValueAccessory__button}
					onPress={() => handleStep(-1)}
				>
					<Text style={blockStyles.CounterValueAccessory__buttonText}>-1</Text>
				</Pressable>
				<Pressable
					style={blockStyles.CounterValueAccessory__button}
					onPress={() => handleStep(1)}
				>
					<Text style={blockStyles.CounterValueAccessory__buttonText}>+1</Text>
				</Pressable>
			</View>
		</KeyboardExtender>
	)
}
