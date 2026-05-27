import ContentLoader, { Rect } from 'react-content-loader/native'
import { useUnistyles } from 'react-native-unistyles'

export default function Skeleton() {
	const { theme } = useUnistyles()
	return (
		<ContentLoader
			speed={1}
			width={380}
			height={540}
			viewBox='0 0 380 540'
			foregroundColor={theme.colors.surfaceAlter}
			backgroundColor={theme.colors.mutedLightestText}
		>
			<Rect x='0' y='6' rx='4' ry='4' width='110' height='15' />
			<Rect x='0' y='30' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='114' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='198' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='282' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='366' rx='4' ry='4' width='380' height='80' />
			<Rect x='0' y='450' rx='4' ry='4' width='380' height='80' />
		</ContentLoader>
	)
}
