import { create } from 'zustand'

import type { TaskLifecycle } from '@/shared/domain/task'

interface TaskListViewStore {
	lifecycleFilter: TaskLifecycle
	setLifecycleFilter: (lifecycle: TaskLifecycle) => void
}

export const useTaskListViewStore = create<TaskListViewStore>((set) => ({
	lifecycleFilter: 'active',
	setLifecycleFilter: (lifecycle) => set({ lifecycleFilter: lifecycle })
}))
