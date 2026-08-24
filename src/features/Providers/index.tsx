import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const queryClient = new QueryClient()

export function Providers({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<SafeAreaProvider>
						<ReducedMotionConfig mode={ReduceMotion.Never} />
						<BottomSheetModalProvider>{children}</BottomSheetModalProvider>
					</SafeAreaProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	)
}
