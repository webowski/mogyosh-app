import { Image } from 'expo-image'
import { Platform, StyleSheet, Text, View } from 'react-native'

import { Fonts } from '@/shared/styles/themes'
import { Collapsible } from '@/shared/ui/Collapsible'
import { ExternalLink } from '@/shared/ui/ExternalLink'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function MotivationScreen() {
	return (
		<ScrollBox>
			<View style={styles.titleContainer}>
				<Text
					style={{
						fontFamily: Fonts.rounded
					}}
				>
					Explore
				</Text>
			</View>
			<Text>This app includes example code to help you get started.</Text>
			<Collapsible title='File-based routing'>
				<Text>
					This app has two screens:{' '}
					<Text type='defaultSemiBold'>app/(tabs)/index.tsx</Text> and{' '}
					<Text type='defaultSemiBold'>app/(tabs)/explore.tsx</Text>
				</Text>
				<Text>
					The layout file in{' '}
					<Text type='defaultSemiBold'>app/(tabs)/_layout.tsx</Text> sets up the
					tab navigator.
				</Text>
				<ExternalLink href='https://docs.expo.dev/router/introduction'>
					<Text type='link'>Learn more</Text>
				</ExternalLink>
			</Collapsible>
			<Collapsible title='Android, iOS, and web support'>
				<Text>
					You can open this project on Android, iOS, and the web. To open the
					web version, press <Text type='defaultSemiBold'>w</Text> in the
					terminal running this project.
				</Text>
			</Collapsible>
			<Collapsible title='Images'>
				<Text>
					For static images, you can use the{' '}
					<Text type='defaultSemiBold'>@2x</Text> and{' '}
					<Text type='defaultSemiBold'>@3x</Text> suffixes to provide files for
					different screen densities
				</Text>
				<Image
					source={require('@/shared/images/react-logo.png')}
					style={{ width: 100, height: 100, alignSelf: 'center' }}
				/>
				<ExternalLink href='https://reactnative.dev/docs/images'>
					<Text type='link'>Learn more</Text>
				</ExternalLink>
			</Collapsible>
			<Collapsible title='Light and dark mode components'>
				<Text>
					This template has light and dark mode support. The{' '}
					<Text type='defaultSemiBold'>useColorScheme()</Text> hook lets you
					inspect what the user&apos;s current color scheme is, and so you can
					adjust UI colors accordingly.
				</Text>
				<ExternalLink href='https://docs.expo.dev/develop/user-interface/color-themes/'>
					<Text type='link'>Learn more</Text>
				</ExternalLink>
			</Collapsible>
			<Collapsible title='Animations'>
				<Text>
					This template includes an example of an animated component. The{' '}
					<Text type='defaultSemiBold'>components/HelloWave.tsx</Text> component
					uses the powerful{' '}
					<Text type='defaultSemiBold' style={{ fontFamily: Fonts.mono }}>
						react-native-reanimated
					</Text>{' '}
					library to create a waving hand animation.
				</Text>
				{Platform.select({
					ios: (
						<Text>
							The{' '}
							<Text type='defaultSemiBold'>
								components/ParallaxScrollView.tsx
							</Text>{' '}
							component provides a parallax effect for the header image.
						</Text>
					)
				})}
			</Collapsible>
		</ScrollBox>
	)
}

const styles = StyleSheet.create({
	headerImage: {
		color: '#808080',
		bottom: -90,
		left: -35,
		position: 'absolute'
	},
	titleContainer: {
		flexDirection: 'row',
		gap: 8
	}
})
