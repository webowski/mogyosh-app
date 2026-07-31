import { Line } from '@shopify/react-native-skia'
import { View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { CartesianChart, Line as VictoryLine } from 'victory-native'

type ChartPoint = { label: string; value: number }

type ChartProps = {
	data: ChartPoint[]
	minValue: number
	maxValue: number
}

export function Chart({ data, minValue, maxValue }: ChartProps) {
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
				data={data}
				xKey='label'
				yKeys={['value']}
				domain={{ y: [minValue, maxValue] }}
				padding={{ top: 24, bottom: 24, left: 16, right: 16 }}
			>
				{({ points, chartBounds, yScale }) => {
					const maxY = yScale(maxValue)
					const minY = yScale(minValue)

					return (
						<>
							<Line
								p1={{ x: chartBounds.left, y: maxY }}
								p2={{ x: chartBounds.right, y: maxY }}
								color={theme.colors.success}
								strokeWidth={1}
							/>
							<Line
								p1={{ x: chartBounds.left, y: minY }}
								p2={{ x: chartBounds.right, y: minY }}
								color={theme.colors.mutedSubtleFill}
								strokeWidth={2}
							/>
							<VictoryLine
								points={points.value}
								color={theme.colors.primary}
								strokeWidth={3}
							/>
						</>
					)
				}}
			</CartesianChart>
		</View>
	)
}
