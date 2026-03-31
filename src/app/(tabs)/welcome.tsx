import { Platform, StyleSheet, Text, View } from 'react-native'

import { Link } from 'expo-router'

import { commonStyles } from '@/shared/styles/common'
import { useUnistyles } from 'react-native-unistyles'

export default function HomeScreen() {
	const { theme } = useUnistyles()

	return (
		<View style={commonStyles.mainArea}>
			<View style={styles.titleContainer}>
				<Text type='title'>Welcome!</Text>
			</View>
			<View style={styles.stepContainer}>
				<Text type='subtitle'>Step 1: Try it</Text>
				<Text>
					Edit <Text type='defaultSemiBold'>app/(tabs)/index.tsx</Text> to see
					changes. Press{' '}
					<Text type='defaultSemiBold'>
						{Platform.select({
							ios: 'cmd + d',
							android: 'cmd + m',
							web: 'F12'
						})}
					</Text>{' '}
					to open developer tools.
				</Text>
			</View>
			<View style={styles.stepContainer}>
				<Link href='/modal'>
					<Link.Trigger>
						<Text type='subtitle'>Step 2: Explore</Text>
					</Link.Trigger>
					<Link.Preview />
					<Link.Menu>
						<Link.MenuAction
							title='Action'
							icon='cube'
							onPress={() => alert('Action pressed')}
						/>
						<Link.MenuAction
							title='Share'
							icon='square.and.arrow.up'
							onPress={() => alert('Share pressed')}
						/>
						<Link.Menu title='More' icon='ellipsis'>
							<Link.MenuAction
								title='Delete'
								icon='trash'
								destructive
								onPress={() => alert('Delete pressed')}
							/>
						</Link.Menu>
					</Link.Menu>
				</Link>

				<Text>
					{`Tap the Explore tab to learn more about what's included in this starter app.`}
				</Text>
			</View>
			<View style={styles.stepContainer}>
				<Text type='subtitle'>Step 3: Get a fresh start</Text>
				<Text>
					{`When you're ready, run `}
					<Text type='defaultSemiBold'>npm run reset-project</Text> to get a
					fresh <Text type='defaultSemiBold'>app</Text> directory. This will
					move the current <Text type='defaultSemiBold'>app</Text> to{' '}
					<Text type='defaultSemiBold'>app-example</Text>.
				</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8
	}
})
