// src/features/MindMap/MindMap.web.tsx
import React from 'react'

import NativeMindMap from './MindMap' // импортируем нативную версию

export default function MindMap() {
	// Skia уже инициализирован в index.web.tsx
	return <NativeMindMap />
}
