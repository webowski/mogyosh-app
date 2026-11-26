import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import SVGNavDiagram from '@/shared/images/nav-diagram.svg'
import { STYLE_VARS } from '@/shared/styles/common'
import { AccordionItem } from '@/shared/ui/Accordion'
import { Button } from '@/shared/ui/Button'
import Paragraph from '@/shared/ui/Paragraph'
import ScrollBox from '@/shared/ui/ScrollBox'

const NAV_DIAGRAM_ASPECT_RATIO = 360 / 135

export default function HelpScreen() {
	const { theme } = useUnistyles()
	const { t } = useTranslation('content')
	const { width: windowWidth } = useWindowDimensions()

	// Horizontal padding of ScrollBox is sidePadding on both sides
	const diagramWidth = windowWidth - 16 * 2
	const diagramHeight = diagramWidth / NAV_DIAGRAM_ASPECT_RATIO

	return (
		<>
			<ScrollBox scrollIndent sidePadding={STYLE_VARS.sidePadding * 2}>
				<View style={{ gap: 0 }}>
					<AccordionItem title={t('help.Navigation title')}>
						<View style={{ alignItems: 'center', marginBottom: 4 }}>
							<SVGNavDiagram width={diagramWidth} height={diagramHeight} />
						</View>

						<Paragraph>{t('help.Navigation description')}</Paragraph>
						<Paragraph>{t('help.Navigation diagram legend')}</Paragraph>
					</AccordionItem>

					<AccordionItem title={t('help.Add category title')}>
						<Paragraph>{t('help.Add category description')}</Paragraph>
					</AccordionItem>

					<AccordionItem title={t('help.Add task title')}>
						<Paragraph>{t('help.Add task description')}</Paragraph>
					</AccordionItem>

					<AccordionItem title={t('help.Add block title')}>
						<Paragraph>{t('help.Add block description')}</Paragraph>
					</AccordionItem>

					<AccordionItem title={t('help.Block types title')}>
						<Paragraph>{t('help.Block types description')}</Paragraph>
					</AccordionItem>

					<AccordionItem title={t('help.Block journal title')}>
						<Paragraph>{t('help.Block journal description')}</Paragraph>
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
