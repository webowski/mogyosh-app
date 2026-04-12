import { MMKV } from 'react-native-mmkv'
import { StateStorage } from 'zustand/middleware'

export const createZustandStorage = (storage: MMKV): StateStorage => ({
	setItem: (name, value) => storage.set(name, value),
	getItem: (name) => storage.getString(name) ?? null,
	removeItem: (name) => storage.remove(name)
})
