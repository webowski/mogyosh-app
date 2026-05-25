import { SubitemEntity } from '@/shared/domain/task'

export type SubitemWithChildren = SubitemEntity & {
	children: SubitemWithChildren[]
}
