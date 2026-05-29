const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
	...expoConfig,
	{
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'react-hooks/immutability': 'off',
			'react-hooks/set-state-in-effect': 'off',
			'react-hooks/refs': 'off',
			'react-hooks/purity': 'off',
			'react-hooks/static-components': 'off',
			'react-hooks/incompatible-library': 'off'
		}
	}
])
