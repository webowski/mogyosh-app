import { DashPathEffect, Line } from '@shopify/react-native-skia'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { CartesianChart, Line as VictoryLine } from 'victory-native'

const weeklyData = [
	{ week: 'Нед 1', count: 8 },
	{ week: 'Нед 2', count: 9 },
	{ week: 'Нед 3', count: 10 },
	{ week: 'Нед 4', count: 12 },
	{ week: 'Нед 5', count: 12 },
	{ week: 'Нед 6', count: 14 },
	{ week: 'Нед 7', count: 14 },
	{ week: 'Нед 8', count: 15 }
]

const MAX_VALUE = 20
const MIN_VALUE = 8

export function Chart() {
	const { theme } = useUnistyles()

	return (
		<View
			style={{
				height: 220,
				backgroundColor: theme.colors.surface,
				borderRadius: 8
			}}
		>
			<CartesianChart
				data={weeklyData}
				xKey='week'
				yKeys={['count']}
				domain={{ y: [MIN_VALUE, MAX_VALUE] }}
				padding={{ top: 24, bottom: 24, left: 16, right: 16 }}
			>
				{({ points, chartBounds, yScale }) => {
					const maxY = yScale(MAX_VALUE)
					const minY = yScale(MIN_VALUE)

					return (
						<>
							<Line
								p1={{ x: chartBounds.left, y: maxY }}
								p2={{ x: chartBounds.right, y: maxY }}
								color={theme.colors.success}
								strokeWidth={3}
							>
								<DashPathEffect intervals={[6, 6]} />
							</Line>

							<Line
								p1={{ x: chartBounds.left, y: minY }}
								p2={{ x: chartBounds.right, y: minY }}
								color={theme.colors.mutedSubtleFill}
								strokeWidth={2}
							>
								<DashPathEffect intervals={[6, 6]} />
							</Line>

							<VictoryLine
								points={points.count}
								color='#4F8CFF'
								strokeWidth={2}
							/>
						</>
					)
				}}
			</CartesianChart>
		</View>
	)
}
