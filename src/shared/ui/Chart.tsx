import {
	Circle,
	Group,
	matchFont,
	Line as SkiaLine,
	Text as SkiaText,
	useFont
} from '@shopify/react-native-skia'
import { Platform, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { CartesianChart, Line as VictoryLine } from 'victory-native'

import { BlockEntity } from '@/shared/domain/block'
import { formatDayChartLabel } from '@/shared/lib/time'

type PointData = {
	date: Date
	value: number
}

type ChartPoint = { label: string; value: number }

type ChartProps = {
	valuesData: PointData[]
	blockData: BlockEntity
}

const AXIS_FONT_SIZE = 11
const POINT_LABEL_FONT_SIZE = 11

// Native fonts are resolved synchronously via matchFont, web fonts require useFont
const nativeFont =
	Platform.OS !== 'web'
		? matchFont({
				fontFamily: Platform.select({
					ios: 'Helvetica Neue',
					android: 'sans-serif'
				})!,
				fontSize: AXIS_FONT_SIZE,
				fontWeight: 'normal'
			})
		: null

const webFontSource =
	Platform.OS === 'web'
		? 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf'
		: null

export function Chart({ valuesData, blockData }: ChartProps) {
	const { theme } = useUnistyles()
	const webFont = useFont(webFontSource, AXIS_FONT_SIZE)
	const font = Platform.OS === 'web' ? webFont : nativeFont

	const seriesData: ChartPoint[] = valuesData.map((point) => ({
		label: formatDayChartLabel(point.date),
		value: point.value
	}))

	const values = seriesData.map((point) => point.value)

	const minValue = Math.min(
		...values,
		...(blockData.settings.start !== undefined
			? [blockData.settings.start]
			: [])
	)
	const maxValue = Math.max(
		...values,
		...(blockData.settings.goal !== undefined ? [blockData.settings.goal] : [])
	)

	return (
		<View
			style={{
				height: 240,
				backgroundColor: theme.colors.surface,
				borderRadius: 8
			}}
		>
			<CartesianChart
				data={seriesData}
				xKey='label'
				yKeys={['value']}
				domain={{ y: [minValue, maxValue] }}
				domainPadding={{ left: 10, right: 10, top: 10 }}
				padding={{ top: 28, bottom: 8, left: 8, right: 8 }}
				axisOptions={{
					font,
					tickCount: { x: values.length, y: 5 },
					lineColor: theme.colors.borderSubtle,
					labelColor: theme.colors.mutedText,
					formatXLabel: (value) => `${value}`,
					formatYLabel: (value) => `${Math.round(value)}`
				}}
			>
				{({ points, chartBounds, yScale }) => {
					const startValue = yScale(blockData.settings.start)
					const goalValue = yScale(blockData.settings.goal)

					return (
						<>
							{startValue && (
								<SkiaLine
									p1={{ x: chartBounds.left, y: startValue }}
									p2={{ x: chartBounds.right, y: startValue }}
									color={theme.colors.danger}
									strokeWidth={1.5}
								/>
							)}

							{goalValue && (
								<SkiaLine
									p1={{ x: chartBounds.left, y: goalValue }}
									p2={{ x: chartBounds.right, y: goalValue }}
									color={theme.colors.success}
									strokeWidth={1.5}
								/>
							)}

							<VictoryLine
								points={points.value}
								color={theme.colors.primary}
								strokeWidth={2.5}
							/>

							{points.value.map((point, index) => {
								if (point.y == null) return null

								const valueLabel = `${point.yValue}`
								const labelWidth = font ? font.getTextWidth(valueLabel) : 0

								return (
									<Group key={`${point.xValue}-${index}`}>
										<Circle cx={point.x} cy={point.y} r={3} color='white' />
										<Circle
											cx={point.x}
											cy={point.y}
											r={3}
											color={theme.colors.primary}
											style='stroke'
											strokeWidth={2.5}
										/>
										{font && (
											<SkiaText
												x={point.x - labelWidth / 2}
												y={point.y - 10}
												text={valueLabel}
												font={font}
												color={theme.colors.major}
											/>
										)}
									</Group>
								)
							})}
						</>
					)
				}}
			</CartesianChart>
		</View>
	)
}
