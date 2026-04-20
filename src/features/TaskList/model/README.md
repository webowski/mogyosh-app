# Task Hooks Documentation

Семейство хуков для работы с задачами в приложении.

## Обзор

Хуки разделены по назначению для каждого экрана приложения:

| Хук                     | Экран      | Описание                                            |
| ----------------------- | ---------- | --------------------------------------------------- |
| `useTasks`              | Все задачи | Получение всех задач с фильтрацией и категоризацией |
| `useTasksFlat`          | Все задачи | Получение всех задач без категоризации              |
| `useTasksByDate`        | Сегодня    | Получение задач на конкретную дату                  |
| `useTaskById`           | Задача     | Получение одной задачи по ID                        |
| `useTaskSubtasks`       | Задача     | Получение подзадач задачи                           |
| `useTasksCountByPeriod` | Календарь  | Получение количества задач по дням за период        |
| `useTasksCountByDay`    | Календарь  | Получение количества задач за один день             |

## Использование

### Экран "Все задачи"

```typescript
import { useTasks } from '@/features/TaskList/model/useTasks'

export default function AllTasksScreen() {
	const { data, isLoading, error } = useTasks({
		searchQuery: 'поиск',
		categoryId: 'category-123',
		status: 'active',
		priority: 1
	})

	// data имеет тип TaskSection[] (категоризированные задачи)
}
```

### Экран "Сегодня" (или любой день)

```typescript
import { useTasksByDate } from '@/features/TaskList/model/useTasks'

export default function TodayScreen() {
	const date = '2025-03-15' // формат YYYY-MM-DD
	const { data, isLoading, error } = useTasksByDate(date)

	// data имеет тип TaskEntity[] (плоский список задач)
}
```

### Экран "Календарь"

```typescript
import { useTasksCountByPeriod } from '@/features/TaskList/model/useTasks'

export default function CalendarScreen() {
	const startDate = '2025-03-01'
	const endDate = '2025-03-31'

	const { data, isLoading, error } = useTasksCountByPeriod(startDate, endDate)

	// data имеет тип { startDate, endDate, days: CalendarDayData[] }
	// data.days.forEach(day => day.count) // количество задач в день
}
```

### Экран "Задача"

```typescript
import {
	useTaskById,
	useTaskSubtasks
} from '@/features/TaskList/model/useTasks'

export default function TaskScreen() {
	const taskId = 'task-123'

	const { data: task } = useTaskById(taskId)
	const { data: subtasks } = useTaskSubtasks(taskId)

	// task имеет тип TaskEntity | null
	// subtasks имеет тип TaskEntity[]
}
```

## Типы

### TaskFilters

Фильтры для хука `useTasks`:

```typescript
type TaskFilters = {
	searchQuery?: string // Поиск по тексту задачи
	categoryId?: string // Фильтр по категории
	status?: 'active' | 'completed' | 'archived'
	priority?: number // Фильтр по приоритету
}
```

### TaskSection

Секция задач для категоризированного отображения:

```typescript
type TaskSection = {
	title: string // Название секции ("During the day" или "By time")
	data: TaskEntity[] // Задачи в секции
}
```

**Критерии категоризации:**

- **"During the day"** — задачи без `start_time` (или без расписаний)
- **"By time"** — задачи с указанным `start_time`

### CalendarDayData

Данные для дня в календаре:

```typescript
type CalendarDayData = {
	date: string // Дата в формате YYYY-MM-DD
	count: number // Количество задач
	taskIds: string[] // ID задач (для будущего использования)
}
```

## API функции

Все хуки используют API функции из `task.api.ts`:

- `getTasks()` - получить все задачи
- `getTasksByDate(date)` - получить задачи на дату
- `getTaskSubtasks(taskId)` - получить подзадачи
- `getTaskById(taskId)` - получить задачу по ID
- `getTasksCountByPeriod(startDate, endDate)` - получить счётчики по периоду
- `createTask(info)` - создать задачу

## Инвалидация кэша

После создания задачи автоматически инвалидируются кэши:

- `['tasks']`
- `['tasks-flat']`
- `['tasks-by-date']`
- `['tasks-count-period']`
- `['tasks-count-day']`

Для ручной инвалидации используйте `useQueryClient`:

```typescript
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['tasks'] })
```

## Примеры

Примеры использования для каждого экрана находятся в папке:
`src/features/TaskList/examples/`

- `TodayScreenExample.tsx` - экран "Сегодня"
- `CalendarScreenExample.tsx` - экран "Календарь"
- `TaskDetailScreenExample.tsx` - экран "Задача"
