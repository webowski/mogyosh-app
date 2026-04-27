import { fireEvent, render } from '@testing-library/react-native'

import { ChecklistItem } from '../ChecklistItem'

describe('ChecklistItem', () => {
	const mockOnToggle = jest.fn()

	beforeEach(() => {
		mockOnToggle.mockClear()
	})

	// === РЕНДЕР ===

	it('отображает переданный text', () => {
		const { getByText } = render(
			<ChecklistItem
				checked={false}
				text='Купить молоко'
				onToggle={mockOnToggle}
			/>
		)

		expect(getByText('Купить молоко')).toBeTruthy()
	})

	it('отображает пустой text без ошибок', () => {
		const { getByText } = render(
			<ChecklistItem checked={false} text='' onToggle={mockOnToggle} />
		)

		expect(getByText('')).toBeTruthy()
	})

	it('корректно отображает длинный текст', () => {
		const longText =
			'Это очень длинный текст, который может занимать несколько строк и проверять, как компонент обрабатывает длинные строки без поломки layout'

		const { getByText } = render(
			<ChecklistItem checked={false} text={longText} onToggle={mockOnToggle} />
		)

		expect(getByText(longText)).toBeTruthy()
	})

	// === СОСТОЯНИЕ ===

	it('показывает галочку ✓ когда checked=true', () => {
		const { getByText } = render(
			<ChecklistItem checked={true} text='Выполнено' onToggle={mockOnToggle} />
		)

		expect(getByText('✓')).toBeTruthy()
	})

	it('не показывает галочку когда checked=false', () => {
		const { queryByText } = render(
			<ChecklistItem
				checked={false}
				text='Не выполнено'
				onToggle={mockOnToggle}
			/>
		)

		expect(queryByText('✓')).toBeNull()
	})

	it('корректно отображается с checked=true при инициализации', () => {
		const { getByText } = render(
			<ChecklistItem
				checked={true}
				text='Инициализировано как выполненное'
				onToggle={mockOnToggle}
			/>
		)

		expect(getByText('✓')).toBeTruthy()
		expect(getByText('Инициализировано как выполненное')).toBeTruthy()
	})

	it('корректно отображается с checked=false при инициализации', () => {
		const { getByText, queryByText } = render(
			<ChecklistItem
				checked={false}
				text='Инициализировано как невыполненное'
				onToggle={mockOnToggle}
			/>
		)

		expect(queryByText('✓')).toBeNull()
		expect(getByText('Инициализировано как невыполненное')).toBeTruthy()
	})

	// === ВЗАИМОДЕЙСТВИЕ ===

	it('вызывает onToggle(true) при нажатии на непроверенный элемент', () => {
		const { getByText } = render(
			<ChecklistItem
				checked={false}
				text='Нажми меня'
				onToggle={mockOnToggle}
			/>
		)

		fireEvent.press(getByText('Нажми меня'))

		expect(mockOnToggle).toHaveBeenCalledTimes(1)
		expect(mockOnToggle).toHaveBeenCalledWith(true)
	})

	it('вызывает onToggle(false) при нажатии на проверенный элемент', () => {
		const { getByText } = render(
			<ChecklistItem checked={true} text='Нажми меня' onToggle={mockOnToggle} />
		)

		fireEvent.press(getByText('Нажми меня'))

		expect(mockOnToggle).toHaveBeenCalledTimes(1)
		expect(mockOnToggle).toHaveBeenCalledWith(false)
	})

	it('onToggle вызывается ровно 1 раз за нажатие', () => {
		const { getByText } = render(
			<ChecklistItem
				checked={false}
				text='Одно нажатие'
				onToggle={mockOnToggle}
			/>
		)

		fireEvent.press(getByText('Одно нажатие'))

		expect(mockOnToggle).toHaveBeenCalledTimes(1)
	})

	it('обрабатывает множественные нажатия корректно', () => {
		const { getByText, rerender } = render(
			<ChecklistItem
				checked={false}
				text='Множественные нажатия'
				onToggle={mockOnToggle}
			/>
		)

		fireEvent.press(getByText('Множественные нажатия'))
		expect(mockOnToggle).toHaveBeenCalledTimes(1)
		expect(mockOnToggle).toHaveBeenLastCalledWith(true)

		rerender(
			<ChecklistItem
				checked={true}
				text='Множественные нажатия'
				onToggle={mockOnToggle}
			/>
		)

		fireEvent.press(getByText('Множественные нажатия'))
		expect(mockOnToggle).toHaveBeenCalledTimes(2)
		expect(mockOnToggle).toHaveBeenLastCalledWith(false)
	})

	// === EDGE CASES ===

	it('обрабатывает текст с пробелами', () => {
		const { getByText } = render(
			<ChecklistItem
				checked={false}
				text='   Текст с пробелами   '
				onToggle={mockOnToggle}
			/>
		)

		expect(getByText('   Текст с пробелами   ')).toBeTruthy()
	})

	it('обрабатывает текст с специальными символами', () => {
		const specialText = 'Task with @#$%^&*() symbols'

		const { getByText } = render(
			<ChecklistItem
				checked={false}
				text={specialText}
				onToggle={mockOnToggle}
			/>
		)

		expect(getByText(specialText)).toBeTruthy()
	})

	it('обрабатывает текст с эмодзи', () => {
		const emojiText = 'Задача с эмодзи ✅'

		const { getByText } = render(
			<ChecklistItem checked={false} text={emojiText} onToggle={mockOnToggle} />
		)

		expect(getByText(emojiText)).toBeTruthy()
	})

	it('не вызывает onToggle при монтировании компонента', () => {
		render(
			<ChecklistItem
				checked={false}
				text='Без нажатия'
				onToggle={mockOnToggle}
			/>
		)

		expect(mockOnToggle).not.toHaveBeenCalled()
	})

	it('передаёт правильные значения при последовательных нажатиях', () => {
		const { getByText, rerender } = render(
			<ChecklistItem
				checked={true}
				text='Смена состояния'
				onToggle={mockOnToggle}
			/>
		)

		fireEvent.press(getByText('Смена состояния'))
		expect(mockOnToggle).toHaveBeenLastCalledWith(false)

		rerender(
			<ChecklistItem
				checked={false}
				text='Смена состояния'
				onToggle={mockOnToggle}
			/>
		)

		fireEvent.press(getByText('Смена состояния'))
		expect(mockOnToggle).toHaveBeenLastCalledWith(true)
	})
})
