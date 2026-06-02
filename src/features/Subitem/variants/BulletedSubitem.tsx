import { Text, View } from 'react-native'

import { ChecklistItem } from '@/features/TaskList/ChecklistItem'
import { SubitemProps } from '../index'

type BulletedSubitemProps = SubitemProps & {
	depth: number
}

export default function BulletedSubitem({
	data,
	depth,
	onCheckToggle
}: BulletedSubitemProps) {
	function getBullet(depth: number): string {
		const bullets = ['•', '◦', '▪', '•', '◦', '▪']
		return bullets[depth % bullets.length]
	}

	return (
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
			<Text style={{ marginRight: 6, fontSize: 16 }}>{getBullet(depth)}</Text>
			<ChecklistItem
				checked={data.state === 'done'}
				text={data.info}
				onToggle={(value) => onCheckToggle?.(value)}
			/>
		</View>
	)
}
