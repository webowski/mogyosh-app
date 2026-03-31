import ScrollBox from '@/shared/ui/ScrollBox'
import { Link } from 'expo-router'
import { Text } from 'react-native'

export default function CreateTaskScreen() {
	return (
		<ScrollBox>
			<Text>create task</Text>
			<Link href='/' dismissTo>
				<Text>Go to home screen</Text>
			</Link>
		</ScrollBox>
	)
}
