import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, useWindowDimensions, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import NavDiagram from '@/shared/images/nav-diagram.svg'
import { textStyles } from '@/shared/styles/text'
import { AccordionItem } from '@/shared/ui/Accordion'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'

const NAV_DIAGRAM_ASPECT_RATIO = 360 / 135

type HelpParagraphProps = {
	children: React.ReactNode
}

function HelpParagraph({ children }: HelpParagraphProps) {
	const { theme } = useUnistyles()

	return (
		<Text style={[textStyles.p, { color: theme.colors.major }]}>
			{children}
		</Text>
	)
}

export default function HelpScreen() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()
	const { width: windowWidth } = useWindowDimensions()

	// Horizontal padding of ScrollBox is sidePadding on both sides
	const diagramWidth = windowWidth - 16 * 2
	const diagramHeight = diagramWidth / NAV_DIAGRAM_ASPECT_RATIO

	return (
		<>
			<ScrollBox scrollIndent>
				<View style={{ gap: 0 }}>
					<AccordionItem title={t('screen.help.SwipeSwitch title')} defaultOpen>
						<View style={{ alignItems: 'center', marginBottom: 4 }}>
							<NavDiagram width={diagramWidth} height={diagramHeight} />
						</View>

						<HelpParagraph>
							{t('screen.help.SwipeSwitch description')}
						</HelpParagraph>
						<HelpParagraph>{t('screen.help.Nav diagram legend')}</HelpParagraph>
					</AccordionItem>

					<AccordionItem title={t('screen.help.Add category title')}>
						<HelpParagraph>
							{t('screen.help.Add category description')}
						</HelpParagraph>
					</AccordionItem>

					<AccordionItem title={t('screen.help.Add task title')}>
						<HelpParagraph>
							{t('screen.help.Add task description')}
						</HelpParagraph>
					</AccordionItem>

					<AccordionItem title={t('screen.help.Add block title')}>
						<HelpParagraph>
							{t('screen.help.Add block description')}
						</HelpParagraph>
					</AccordionItem>

					<AccordionItem title={t('screen.help.Block types title')}>
						<HelpParagraph>
							{t('screen.help.Block types description')}
						</HelpParagraph>
					</AccordionItem>

					<AccordionItem title={t('screen.help.Block journal title')}>
						<HelpParagraph>
							{t('screen.help.Block journal description')}
						</HelpParagraph>
					</AccordionItem>
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
