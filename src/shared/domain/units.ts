export type UnitCategory = 'weight' | 'distance' | 'volume' | 'quantity'
export type UnitSystem = 'metric' | 'imperial'

export type UnitDefinition = {
	id: string
	label: string
	category: UnitCategory
	system: UnitSystem
}

export const UNITS: UnitDefinition[] = [
	{ id: 'kg', label: 'кг', category: 'weight', system: 'metric' },
	{ id: 'g', label: 'г', category: 'weight', system: 'metric' },
	{ id: 'lb', label: 'lbs', category: 'weight', system: 'imperial' },
	{ id: 'oz', label: 'oz', category: 'weight', system: 'imperial' },
	{ id: 'km', label: 'км', category: 'distance', system: 'metric' },
	{ id: 'm', label: 'м', category: 'distance', system: 'metric' },
	{ id: 'mi', label: 'mi', category: 'distance', system: 'imperial' },
	{ id: 'ft', label: 'ft', category: 'distance', system: 'imperial' },
	{ id: 'l', label: 'л', category: 'volume', system: 'metric' },
	{ id: 'ml', label: 'мл', category: 'volume', system: 'metric' },
	{ id: 'gal', label: 'gal', category: 'volume', system: 'imperial' },
	{ id: 'floz', label: 'fl oz', category: 'volume', system: 'imperial' },
	{ id: 'pcs', label: 'шт.', category: 'quantity', system: 'metric' }
]

export const findUnitById = (unitId?: string): UnitDefinition | undefined =>
	UNITS.find((unit) => unit.id === unitId)
