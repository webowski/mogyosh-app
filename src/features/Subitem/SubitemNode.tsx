import { useState } from 'react'
import { View } from 'react-native'

import type { SubitemId } from '@/shared/domain/ids'
import type { SubitemType } from '@/shared/domain/subitem'
import { useUpdateSubitemState } from '../TaskList'
import type { SubitemData } from './model/subitem.types'
import BulletedSubitem from './variants/BulletedSubitem'
import CollapsibleSubitem from './variants/CollapsibleSubitem'
import CounterSubitem from './variants/CounterSubitem'
import HeadingSubitem from './variants/HeadingSubitem'
import OrderedSubitem from './variants/OrderedSubitem'
import StopwatchSubitem from './variants/StopwatchSubitem'
import TextSubitem from './variants/TextSubitem'
import TimerSubitem from './variants/TimerSubitem'

interface SubitemNodeProps {
	data: SubitemData
	depth: number
	// onCheckToggle: (subitemId: SubitemId, checked: boolean) => void
	variant: SubitemType
}

export default function SubitemNode({
	data,
	variant = 'p',
	depth = 0
}: SubitemNodeProps) {
	const [isChildShown, setIsChildShown] = useState(true)
	// const hasChildren = data.children.length > 0

	let HAS_CHECKBOX = true

	const updateSubitemState = useUpdateSubitemState()

	const handleToggleSubitem = (subitemId: SubitemId, completed: boolean) => {
		updateSubitemState.mutate({
			subitemId,
			state: completed ? 'done' : 'active'
		})
	}

	let content

	switch (variant) {
		case 'details':
			content = (
				<CollapsibleSubitem
					data={data}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
					onExpandToggle={(expanded) => setIsChildShown(expanded)}
				/>
			)
			break

		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
			content = (
				<HeadingSubitem
					variant={variant}
					data={data}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		case 'ul':
			content = (
				<BulletedSubitem
					data={data}
					depth={depth}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		case 'ol':
			content = (
				<OrderedSubitem
					data={data}
					depth={depth}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		case 'timer':
			content = (
				<TimerSubitem
					data={data}
					// depth={depth}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		case 'stopwatch':
			content = (
				<StopwatchSubitem
					data={data}
					// depth={depth}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		case 'counter':
			content = (
				<CounterSubitem
					data={data}
					// depth={depth}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		// case 'p':
		default:
			content = (
				<TextSubitem
					data={data}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
	}

	return (
		<View style={{ paddingLeft: depth * 16 }}>
			{content}

			{isChildShown &&
				data.children.map((child) => (
					<SubitemNode
						key={child.id}
						data={child}
						depth={depth + 1}
						variant={variant}
					/>
				))}
		</View>
	)
}
