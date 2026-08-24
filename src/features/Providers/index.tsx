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
						{/* TEMP DEBUG: removed BottomSheetModalProvider (@gorhom/bottom-sheet,
						    incompatible with reanimated v4, superseded by react-native-true-sheet)
						    to test if it's swallowing the first 1-2 taps app-wide */}
						{children}
					</SafeAreaProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	)
}
