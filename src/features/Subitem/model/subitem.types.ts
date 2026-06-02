import { SubitemEntity } from '@/shared/domain/subitem'

export type SubitemData = SubitemEntity & {
	children: SubitemData[]
}

export type SubitemProps = {
	data: SubitemData
	onCheckToggle?: (checked: boolean) => void
}
