import React from 'react'
import { useWindowDimensions } from 'react-native'

import { MindMap } from '@/features/MindMap/MindMap'
import type { MindMapNode } from '@/features/MindMap/model/types'

const DEMO_DATA: MindMapNode = {
	id: 'root',
	label: 'Categories',
	type: 'root',
	children: [
		{
			id: 'cat1',
			label: 'Category',
			type: 'category',
			children: [
				{ id: 'task1', label: 'Task', type: 'task' },
				{ id: 'task2', label: 'Task', type: 'task' }
			]
		},
		{
			id: 'cat2',
			label: 'Category',
			type: 'category',
			children: [
				{ id: 'task3', label: 'Task', type: 'task' },
				{ id: 'task4', label: 'Task', type: 'task' }
			]
		},
		{
			id: 'cat3',
			label: 'Category',
			type: 'category',
			children: [
				{
					id: 'sub1',
					label: 'Subcategory',
					type: 'subcategory',
					children: []
				},
				{
					id: 'sub2',
					label: 'Subcategory',
					type: 'subcategory',
					children: []
				}
			]
		},
		{
			id: 'cat4',
			label: 'Category',
			type: 'category',
			children: [
				{ id: 'task5', label: 'Task', type: 'task' },
				{ id: 'task6', label: 'Task', type: 'task' },
				{ id: 'task7', label: 'Task', type: 'task' }
			]
		},
		{
			id: 'cat5',
			label: 'Category',
			type: 'category',
			children: []
		},
		{
			id: 'cat6',
			label: 'Category',
			type: 'category',
			children: []
		},
		{
			id: 'cat7',
			label: 'Category',
			type: 'category',
			children: []
		}
	]
}

export default function MindMapExample() {
	const { width, height } = useWindowDimensions()

	return <MindMap data={DEMO_DATA} width={width} height={height} />
}
