import { MaterialIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useUnistyles } from 'react-native-unistyles'

import { ChecklistItem } from '@/features/TaskList/ChecklistItem'
import type { SubitemType, SubitemWithChildren } from './model/subitem.types'

interface SubitemNodeProps {
	data: SubitemWithChildren
	depth: number
	onToggle: (taskId: string, completed: boolean) => void
	variant: SubitemType
}

// Returns bullet symbol based on nesting depth
function getBullet(depth: number): string {
	const bullets = ['•', '◦', '▪']
	return bullets[depth % bullets.length]
}

export default function SubitemNode({
	data,
	variant = 'text',
	depth = 0,
	onToggle
}: SubitemNodeProps) {
	const { theme } = useUnistyles()
	const [isExpanded, setIsExpanded] = useState(true)
	const hasChildren = data.children.length > 0

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
		<View style={{ paddingLeft: depth * 16 }}>
			{variant === 'collapsible' ? (
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{hasChildren && (
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
					)}
					{!hasChildren && <View style={{ width: 16 }} />}
					<View style={{ flex: 1 }}>
						<ChecklistItem
							checked={data.state === 'done'}
							text={data.info}
							onToggle={(value) => onToggle(data.id, value)}
						/>
					</View>
				</View>
			) : (
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{variant === 'bulleted' && (
						<Text style={{ marginRight: 6, fontSize: 16 }}>
							{getBullet(depth)}
						</Text>
					)}
					<View style={{ flex: 1 }}>
						<ChecklistItem
							checked={data.state === 'done'}
							text={data.info}
							onToggle={(value) => onToggle(data.id, value)}
						/>
					</View>
				</View>
			)}

			{hasChildren && (variant !== 'collapsible' || isExpanded) && (
				<>
					{data.children.map((child) => (
						<SubitemNode
							key={child.id}
							data={child}
							depth={depth + 1}
							onToggle={onToggle}
							variant={variant}
						/>
					))}
				</>
			)}
		</View>
	)
}
