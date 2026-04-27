export const StyleSheet = {
	create: (styles: any) =>
		typeof styles === 'function'
			? styles({
					colors: {
						primary: '#000',
						bright: '#fff',
						major: '#000'
					}
				})
			: styles
}

export const useUnistyles = () => ({
	theme: {
		colors: {
			primary: '#000',
			bright: '#fff',
			major: '#000'
		}
	}
})
