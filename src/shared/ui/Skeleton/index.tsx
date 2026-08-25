import ContentLoader, { Rect } from 'react-content-loader/native'
import { useUnistyles } from 'react-native-unistyles'

export default function Skeleton() {
	const { theme } = useUnistyles()
	return (
		<ContentLoader
			speed={1}
			width={380}
			height={840}
			viewBox='0 0 380 840'
			foregroundColor={theme.colors.surfaceDeep}
			backgroundColor={theme.colors.mutedSubtlestText}
		>
			<Rect x='0' y='6' rx='4' ry='4' width='110' height='15' />
			<Rect x='0' y='30' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='114' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='198' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='282' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='366' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='450' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='534' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='618' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='702' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='786' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='870' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='954' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='1038' rx='4' ry='4' width='380' height='80' />
		</ContentLoader>
	)
}
