import { MaterialIcons } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useUnistyles } from 'react-native-unistyles'

import { ChecklistItem } from '@/features/TaskList/ChecklistItem'
import { SubitemProps } from '../index'

type CollapsibleSubitemProps = SubitemProps & {
	onExpandToggle: (value) => void
}

export default function CollapsibleSubitem({
	data,
	depth,
	onCheckToggle,
	onExpandToggle
}: CollapsibleSubitemProps) {
	const { theme } = useUnistyles()
	const rotationProgress = useSharedValue(1) // 1 = expanded (90deg), 0 = collapsed

	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotationProgress.value * 90}deg` }]
	}))

	const toggleExpand = () => {
		const nextExpanded = !isExpanded
		rotationProgress.value = withTiming(nextExpanded ? 1 : 0, { duration: 100 })
		setIsExpanded(nextExpanded)
	}

	return (
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
			{/* {hasChildren && ( */}
			<Pressable
				onPress={toggleExpand}
				style={{ marginRight: 4, marginTop: 2 }}
			>
				<Animated.View style={animatedIconStyle}>
					<MaterialIcons
						name='play-arrow'
						size={20}
						color={theme.colors.major}
					/>
				</Animated.View>
			</Pressable>
			{/* )} */}
			{/* {!hasChildren && <View style={{ width: 16 }} />} */}
			<View style={{ flex: 1 }}>
				<ChecklistItem
					checked={data.state === 'done'}
					text={data.info}
					onToggle={(value) => onCheckToggle(data.id, value)}
				/>
			</View>
		</View>
	)
}
