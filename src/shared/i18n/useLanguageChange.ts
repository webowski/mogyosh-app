import { useEffect } from 'react'

import { useLangStore } from '@/shared/model/langStore'

export function useLanguageChange(callback: () => void) {
	const { language } = useLangStore()

	useEffect(() => {
		callback()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language])
}
