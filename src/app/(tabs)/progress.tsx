import TaskStatistics from '@/features/Statistics/TaskStatistics'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function ProgressScreen() {
	return (
		<ScrollBox>
			<TaskStatistics />
		</ScrollBox>
	)
}
