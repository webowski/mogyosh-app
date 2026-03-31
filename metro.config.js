const { getDefaultConfig } = require('expo/metro-config')

module.exports = (() => {
	const config = getDefaultConfig(__dirname)

	const { transformer, resolver } = config

	config.transformer = {
		...transformer,
		babelTransformerPath: require.resolve('react-native-svg-transformer/expo')
	}
	config.resolver = {
		...resolver,
		assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
		sourceExts: [...resolver.sourceExts, 'svg']
	}

	// Фикс для разрешения CommonJS версии zustand, так как Metro не поддерживает "exports" в package.json.
	// Без этого возникает ошибка Metro error: Cannot use 'import.meta' outside a module при попытке импортировать zustand.
	config.resolver.unstable_enablePackageExports = true
	config.resolver.resolveRequest = (context, moduleName, platform) => {
		if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
			//? Resolve to its CommonJS entry (fallback to main/index.js)
			return {
				type: 'sourceFile',
				//? require.resolve will pick up the CJS entry (index.js) since "exports" is bypassed
				filePath: require.resolve(moduleName)
			}
		}
		return context.resolveRequest(context, moduleName, platform)
	}

	return config
})()
