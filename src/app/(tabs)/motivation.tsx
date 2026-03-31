import { Image } from 'expo-image'
import { Platform, Text } from 'react-native'

import { textStyles } from '@/shared/styles/text'
import { Fonts } from '@/shared/styles/themes'
import { Collapsible } from '@/shared/ui/Collapsible'
import { ExternalLink } from '@/shared/ui/ExternalLink'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function MotivationScreen() {
	return (
		<ScrollBox>
			<Text style={textStyles.heading1}>Explore</Text>
			<Text>This app includes example code to help you get started.</Text>
			<Collapsible title='File-based routing'>
				<Text>
					This app has two screens: <Text>app/(tabs)/index.tsx</Text> and{' '}
					<Text>app/(tabs)/explore.tsx</Text>
				</Text>
				<Text>
					The layout file in <Text>app/(tabs)/_layout.tsx</Text> sets up the tab
					navigator.
				</Text>
				<ExternalLink href='https://docs.expo.dev/router/introduction'>
					<Text style={textStyles.link}>Learn more</Text>
				</ExternalLink>
			</Collapsible>
			<Collapsible title='Android, iOS, and web support'>
				<Text>
					You can open this project on Android, iOS, and the web. To open the
					web version, press <Text>w</Text> in the terminal running this
					project.
				</Text>
			</Collapsible>
			<Collapsible title='Images'>
				<Text>
					For static images, you can use the <Text>@2x</Text> and{' '}
					<Text>@3x</Text> suffixes to provide files for different screen
					densities
				</Text>
				<Image
					source={require('@/shared/images/react-logo.png')}
					style={{ width: 100, height: 100, alignSelf: 'center' }}
				/>
				<ExternalLink href='https://reactnative.dev/docs/images'>
					<Text style={textStyles.link}>Learn more</Text>
				</ExternalLink>
			</Collapsible>
			<Collapsible title='Light and dark mode components'>
				<Text>
					This template has light and dark mode support. The{' '}
					<Text>useColorScheme()</Text> hook lets you inspect what the
					user&apos;s current color scheme is, and so you can adjust UI colors
					accordingly.
				</Text>
				<ExternalLink href='https://docs.expo.dev/develop/user-interface/color-themes/'>
					<Text style={textStyles.link}>Learn more</Text>
				</ExternalLink>
			</Collapsible>
			<Collapsible title='Animations'>
				<Text>
					This template includes an example of an animated component. The{' '}
					<Text>components/HelloWave.tsx</Text> component uses the powerful{' '}
					<Text style={{ fontFamily: Fonts.mono }}>
						react-native-reanimated
					</Text>{' '}
					library to create a waving hand animation.
				</Text>
				{Platform.select({
					ios: (
						<Text>
							The <Text>components/ParallaxScrollView.tsx</Text> component
							provides a parallax effect for the header image.
						</Text>
					)
				})}
			</Collapsible>
		</ScrollBox>
	)
}
