import {
	Circle,
	Group,
	matchFont,
	Text as SkiaText,
	useFont
} from '@shopify/react-native-skia'
import { Platform, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { CartesianChart, Line as VictoryLine } from 'victory-native'

type ChartPoint = { label: string; value: number }

type ChartProps = {
	data: ChartPoint[]
	minValue: number
	maxValue: number
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

export function Chart({ data, minValue, maxValue }: ChartProps) {
	const { theme } = useUnistyles()
	const webFont = useFont(webFontSource, AXIS_FONT_SIZE)
	const font = Platform.OS === 'web' ? webFont : nativeFont

	return (
		<View
			style={{
				height: 240,
				backgroundColor: theme.colors.surface,
				borderRadius: 8
			}}
		>
			<CartesianChart
				data={data}
				xKey='label'
				yKeys={['value']}
				domain={{ y: [minValue, maxValue] }}
				domainPadding={{ left: 16, right: 16, top: 24 }}
				padding={{ top: 28, bottom: 8, left: 8, right: 8 }}
				axisOptions={{
					font,
					tickCount: { x: data.length, y: 5 },
					lineColor: theme.colors.borderSubtle,
					labelColor: theme.colors.mutedText,
					formatXLabel: (value) => `${value}`,
					formatYLabel: (value) => `${Math.round(value)}`
				}}
			>
				{({ points }) => (
					<>
						<VictoryLine
							points={points.value}
							color={theme.colors.primary}
							strokeWidth={3}
						/>

						{points.value.map((point, index) => {
							if (point.y == null) return null

							const valueLabel = `${point.yValue}`
							const labelWidth = font ? font.getTextWidth(valueLabel) : 0

							return (
								<Group key={`${point.xValue}-${index}`}>
									<Circle
										cx={point.x}
										cy={point.y}
										r={3}
										color={theme.colors.primary}
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
				)}
			</CartesianChart>
		</View>
	)
}
