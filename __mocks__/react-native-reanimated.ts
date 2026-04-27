import { Animated } from 'react-native'

export default {
	View: Animated.View,
	Text: Animated.Text,
	Image: Animated.Image,
	ScrollView: Animated.ScrollView,
	createAnimatedComponent: (component: any) => component
}

export const useSharedValue = (val: any) => ({ value: val })
export const useAnimatedStyle = (fn: () => any) => ({ style: fn() })
export const withTiming = (val: any) => val
export const withSpring = (val: any) => val
export const interpolateColor = (_val: any, _input: any, output: any[]) =>
	output[0]
export const Easing = { linear: (t: any) => t }
