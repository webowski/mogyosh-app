import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useState, type PropsWithChildren } from 'react'
import {
	LayoutAnimation,
	Platform,
	Pressable,
	Text,
	UIManager,
	View
} from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

if (
	Platform.OS === 'android' &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true)
}

type AccordionItemProps = PropsWithChildren & {
	title: string
	defaultOpen?: boolean
}

export function AccordionItem({
	title,
	defaultOpen = false,
	children
}: AccordionItemProps) {
	const { theme } = useUnistyles()
	const [isOpen, setIsOpen] = useState(defaultOpen)

	const handlePress = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		setIsOpen((previousValue) => !previousValue)
	}

	return (
		<View style={styles.AccordionItem}>
			<Pressable
				onPress={handlePress}
				style={({ pressed }) => [
					styles.AccordionItem__header,
					pressed && styles.AccordionItem__header_pressed
				]}
				accessibilityRole='button'
				accessibilityState={{ expanded: isOpen }}
			>
				<Text style={styles.AccordionItem__title}>{title}</Text>
				<MaterialDesignIcons
					name={isOpen ? 'chevron-up' : 'chevron-down'}
					size={22}
					color={theme.colors.mutedTextStrong}
				/>
			</Pressable>

			{isOpen && <View style={styles.AccordionItem__content}>{children}</View>}
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	AccordionItem: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: theme.colors.border
	},
	AccordionItem__header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 14,
		gap: 12
	},
	AccordionItem__header_pressed: {
		opacity: 0.7
	},
	AccordionItem__title: {
		flex: 1,
		fontSize: 16,
		fontWeight: '600',
		color: theme.colors.major
	},
	AccordionItem__content: {
		paddingBottom: 14,
		gap: 8
	}
}))
