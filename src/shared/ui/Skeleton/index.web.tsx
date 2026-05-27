import ContentLoader from 'react-content-loader'
import { useUnistyles } from 'react-native-unistyles'

export default function Skeleton() {
	const { theme } = useUnistyles()
	return (
		<ContentLoader
			speed={1}
			// width={380}
			// height={540}
			viewBox='0 0 380 540'
			foregroundColor={theme.colors.surfaceAlter}
			backgroundColor={theme.colors.mutedLightestText}
		>
			<rect x='0' y='6' rx='4' ry='4' width='110' height='15' />
			<rect x='0' y='30' rx='4' ry='4' width='380' height='80' />
			<rect x='0' y='114' rx='4' ry='4' width='380' height='80' />
			<rect x='0' y='198' rx='4' ry='4' width='380' height='80' />
			<rect x='0' y='282' rx='4' ry='4' width='380' height='80' />
			<rect x='0' y='366' rx='4' ry='4' width='380' height='80' />
			<rect x='0' y='450' rx='4' ry='4' width='380' height='80' />
		</ContentLoader>
	)
}
