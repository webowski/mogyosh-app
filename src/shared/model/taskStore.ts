import { createMMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

import { TaskId } from '@/shared/domain/ids'
import { createZustandStorage } from '@/shared/lib/mmkv'

const storage = createMMKV({ id: 'task-storage' })
const zustandStorage = createZustandStorage(storage)

export interface TaskStore {
	selectedTask: TaskId | null
	setSelectedTask: (taskId: TaskId | null) => void
}

export const useTaskStore = create<TaskStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				selectedTask: null,
				setSelectedTask: (taskId) => set({ selectedTask: taskId })
			}),
			{
				name: 'task-storage',
				storage: createJSONStorage(() => zustandStorage)
			}
		)
	)
)
