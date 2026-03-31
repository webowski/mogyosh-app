import { Text, View } from 'react-native'

type CircleProgressProps = {
	title: string
}

export default function CircleProgress({ title }: CircleProgressProps) {
	return (
		<View>
			<Text>{title}</Text>
		</View>
	)
}
