import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useNotificationsBootstrap } from '@/services/Notifications/useNotificationsBootstrap'
import ContextMenuOverlay from '@/shared/ui/ContextMenu/ContextMenuOverlay'

const queryClient = new QueryClient()

function NotificationsBootstrap() {
	useNotificationsBootstrap()
	return null
}

export function Providers({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<NotificationsBootstrap />
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<SafeAreaProvider>
						<ReducedMotionConfig mode={ReduceMotion.Never} />
						<BottomSheetModalProvider>
							{children}
							<ContextMenuOverlay />
						</BottomSheetModalProvider>
					</SafeAreaProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	)
}
