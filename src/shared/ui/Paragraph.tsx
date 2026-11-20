import { Text } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { textStyles } from '@/shared/styles/text'

type ParagraphProps = {
	children: React.ReactNode
}

export default function Paragraph({ children }: ParagraphProps) {
	const { theme } = useUnistyles()

	return (
		<Text style={[textStyles.p, { color: theme.colors.major }]}>
			{children}
		</Text>
	)
}
