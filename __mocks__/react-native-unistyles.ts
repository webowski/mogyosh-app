export const StyleSheet = {
	create: (styles: any) =>
		typeof styles === 'function'
			? styles({
					colors: {
						primary500: '#000',
						inverse: '#fff',
						major: '#000'
					}
				})
			: styles
}

export const useUnistyles = () => ({
	theme: {
		colors: {
			primary500: '#000',
			inverse: '#fff',
			major: '#000'
		}
	}
})
