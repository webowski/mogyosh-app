import { router } from 'expo-router'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { TaskCreateForm } from '@/features/TaskCreate/TaskCreateForm'

export default function CreateTaskScreen() {
	const setSwipeRoute = useNavStore((state) => state.setSwipeRoute)

	const previousRoute = useNavStore((state) => state.previousRoute)

	return (
		<TaskCreateForm
			onClose={() => {
				router.push((previousRoute || 'index') as never)
				setSwipeRoute(previousRoute || 'index')
			}}
		/>
	)
}
