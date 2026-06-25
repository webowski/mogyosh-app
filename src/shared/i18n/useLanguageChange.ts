import { useEffect, useRef } from 'react'

import { useLangStore } from '@/shared/model/lang.store'

export function useLanguageChange(callback: () => void) {
	const { language } = useLangStore()
	const isFirstRender = useRef(true)

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}
		callback()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language])
}
