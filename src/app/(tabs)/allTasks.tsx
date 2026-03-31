import TaskList from '@/features/TaskList/TaskList'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function AllTasksScreen() {
	return (
		<ScrollBox>
			<TaskList />
		</ScrollBox>
	)
}
