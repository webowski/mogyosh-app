import { Link, router } from 'expo-router'
import { Text } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { TaskInput } from '@/features/TaskList/TaskInput'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'
import { MaterialIcons } from '@expo/vector-icons'

export default function CreateTaskScreen() {
	const { theme } = useUnistyles()

	return (
		<>
			<ScrollBox>
				<TaskInput />

				<Link href='/' dismissTo>
					<Text>Go to home screen</Text>
				</Link>
			</ScrollBox>

			<ActionsPanel>
				<Button size='round' onPress={() => router.back()}>
					<MaterialIcons
						name='arrow-back'
						size={28}
						color={theme.colors.buttonText}
					/>
				</Button>
			</ActionsPanel>
		</>
	)
}
