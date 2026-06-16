import { MaterialIcons } from '@expo/vector-icons'
import { useRef } from 'react'
import { Platform, Pressable, View } from 'react-native'
import { type EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { type SubitemInsert } from '@/shared/domain/subitem'
import { STYLE_VARS } from '@/shared/styles/common'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from './MarkdownInput'

interface SubitemListEditorProps {
	subitems: SubitemInsert[]
	onChange: (subitems: SubitemInsert[]) => void
}

export function SubitemListEditor({
	subitems,
	onChange
}: SubitemListEditorProps) {
	const { theme } = useUnistyles()

	const inputRefs = useRef<
		Map<
			string,
			React.RefObject<EnrichedMarkdownTextInputInstance | HTMLDivElement | null>
		>
	>(new Map())

	const getRefForSubitemInput = (id: string) => {
		if (!inputRefs.current.has(id)) {
			inputRefs.current.set(id, { current: null })
		}
		return inputRefs.current.get(id)!
	}

	const moveCursorToEnd = (element: HTMLDivElement) => {
		const range = document.createRange()
		const selection = window.getSelection()
		range.selectNodeContents(element)
		range.collapse(false)
		selection?.removeAllRanges()
		selection?.addRange(range)
	}

	const focusSubitem = (id: string) => {
		const ref = inputRefs.current.get(id)?.current
		if (!ref) return

		if (Platform.OS === 'web') {
			const element = ref as HTMLDivElement
			element.focus()
			moveCursorToEnd(element)
		} else {
			;(ref as EnrichedMarkdownTextInputInstance).focus()
		}
	}

	const addSubitemAfter = (index: number) => {
		const newSubitem: SubitemInsert = {
			id: Date.now().toString(),
			info: '',
			type: 'p'
		}
		const next = [...subitems]
		next.splice(index + 1, 0, newSubitem)
		onChange(next)

		setTimeout(() => {
			focusSubitem(newSubitem.id)
		}, 50)
	}

	const removeSubitem = (index: number) => {
		if (subitems.length < 1) {
			onChange([{ ...subitems[0], info: '' }])
			return
		}

		const updatedSubitems = subitems.filter((_, i) => i !== index)
		onChange(updatedSubitems)

		if (updatedSubitems.length === 0) return

		const focusIndex = Math.max(0, index - 1)
		setTimeout(() => {
			focusSubitem(updatedSubitems[focusIndex].id)
		}, 50)
	}

	const updateSubitem = (id: string, info: string) => {
		const subitemIndex = subitems.findIndex((subitem) => subitem.id === id)
		const updatedItems = subitems.map((subitem) =>
			subitem.id === id ? { ...subitem, info } : subitem
		)
		onChange(updatedItems)

		// Auto-remove empty subitem when field is cleared
		// if (info === '' && subitems.length > 1) {
		if (info === '') {
			removeSubitem(subitemIndex)
		}
	}

	return (
		<View style={styles.container}>
			{subitems.map((subitem, index) => (
				<View key={subitem.id} style={styles.row}>
					<MarkdownInput
						ref={getRefForSubitemInput(subitem.id)}
						subitemText={subitem.info}
						onChangeText={(info) => updateSubitem(subitem.id, info)}
						onChangeMarkdown={(markdown) => updateSubitem(subitem.id, markdown)}
						onEnterPress={() => addSubitemAfter(index)}
						onBackspaceOnEmpty={() => removeSubitem(index)}
					/>
					<Checkbox checked={false} style={{ marginTop: 3 }} />
				</View>
			))}

			<Pressable
				style={styles.addButton}
				onPress={() => addSubitemAfter(subitems.length - 1)}
			>
				<MaterialIcons name='add' size={28} color={theme.colors.minor} />
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: {
		gap: 2
	},
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: theme.spacing.sm
	},
	addButton: {
		marginTop: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: theme.spacing.xs,
		backgroundColor: theme.colors.mutedLightFill,
		borderTopLeftRadius: STYLE_VARS.radius_sm,
		borderTopRightRadius: STYLE_VARS.radius_sm,
		borderBottomLeftRadius: STYLE_VARS.radius_lg,
		borderBottomRightRadius: STYLE_VARS.radius_lg
	}
}))
