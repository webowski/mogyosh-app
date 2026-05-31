import { SubitemEntity } from '@/shared/domain/subitem'

export type SubitemWithChildren = SubitemEntity & {
	children: SubitemWithChildren[]
}
