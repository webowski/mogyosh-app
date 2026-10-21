import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { textStyles } from '@/shared/styles/text'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'

type HelpSectionProps = {
	title: string
	children: React.ReactNode
}

function HelpSection({ title, children }: HelpSectionProps) {
	return (
		<View>
			<Text style={[textStyles.heading5, { marginBottom: 6 }]}>{title}</Text>
			{children}
		</View>
	)
}

type HelpParagraphProps = {
	children: React.ReactNode
}

function HelpParagraph({ children }: HelpParagraphProps) {
	const { theme } = useUnistyles()

	return (
		<Text
			style={[textStyles.p, { color: theme.colors.major, marginBottom: 8 }]}
		>
			{children}
		</Text>
	)
}

type HelpSubheadingProps = {
	children: React.ReactNode
}

function HelpSubheading({ children }: HelpSubheadingProps) {
	const { theme } = useUnistyles()

	return (
		<Text
			style={[
				textStyles.label,
				{ color: theme.colors.major, marginTop: 8, marginBottom: 4 }
			]}
		>
			{children}
		</Text>
	)
}

export default function HelpScreen() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

	return (
		<>
			<ScrollBox scrollIndent>
				<View style={{ gap: 22 }}>
					{/* Controls */}
					<HelpSection title={t('screen.help.Controls')}>
						<HelpSubheading>
							{t('screen.help.SwipeSwitch title')}
						</HelpSubheading>
						<HelpParagraph>
							{t('screen.help.SwipeSwitch description')}
						</HelpParagraph>
						<HelpParagraph>{t('screen.help.SwipeSwitch dots')}</HelpParagraph>
						<HelpParagraph>
							{t('screen.help.SwipeSwitch columns')}
						</HelpParagraph>
					</HelpSection>

					{/* Main actions */}
					<HelpSection title={t('screen.help.Main actions')}>
						<HelpSubheading>
							{t('screen.help.Add category title')}
						</HelpSubheading>
						<HelpParagraph>
							{t('screen.help.Add category description')}
						</HelpParagraph>

						<HelpSubheading>{t('screen.help.Add task title')}</HelpSubheading>
						<HelpParagraph>
							{t('screen.help.Add task description')}
						</HelpParagraph>

						<HelpSubheading>{t('screen.help.Add block title')}</HelpSubheading>
						<HelpParagraph>
							{t('screen.help.Add block description')}
						</HelpParagraph>

						<HelpSubheading>
							{t('screen.help.Block types title')}
						</HelpSubheading>
						<HelpParagraph>
							{t('screen.help.Block types description')}
						</HelpParagraph>

						<HelpSubheading>
							{t('screen.help.Block journal title')}
						</HelpSubheading>
						<HelpParagraph>
							{t('screen.help.Block journal description')}
						</HelpParagraph>
					</HelpSection>
				</View>
			</ScrollBox>

			<ActionsPanel>
				<Button
					round
					widthMode='equilateral'
					size='lg'
					onPress={() => router.back()}
				>
					<MaterialDesignIcons
						name='arrow-left'
						size={28}
						color={theme.colors.buttonText}
					/>
				</Button>
			</ActionsPanel>
		</>
	)
}
