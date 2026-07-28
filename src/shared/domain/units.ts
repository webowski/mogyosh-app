export type UnitCategory = 'weight' | 'distance' | 'volume' | 'quantity'
export type UnitSystem = 'metric' | 'imperial'

export type UnitDefinition = {
	id: string
	labelKey: string
	category: UnitCategory
	system: UnitSystem
}

export const UNITS: UnitDefinition[] = [
	{ id: 'kg', labelKey: 'units.kg', category: 'weight', system: 'metric' },
	{ id: 'g', labelKey: 'units.g', category: 'weight', system: 'metric' },
	{ id: 'lb', labelKey: 'units.lb', category: 'weight', system: 'imperial' },
	{ id: 'oz', labelKey: 'units.oz', category: 'weight', system: 'imperial' },
	{ id: 'km', labelKey: 'units.km', category: 'distance', system: 'metric' },
	{ id: 'm', labelKey: 'units.m', category: 'distance', system: 'metric' },
	{ id: 'mi', labelKey: 'units.mi', category: 'distance', system: 'imperial' },
	{ id: 'ft', labelKey: 'units.ft', category: 'distance', system: 'imperial' },
	{ id: 'l', labelKey: 'units.l', category: 'volume', system: 'metric' },
	{ id: 'ml', labelKey: 'units.ml', category: 'volume', system: 'metric' },
	{ id: 'gal', labelKey: 'units.gal', category: 'volume', system: 'imperial' },
	{
		id: 'floz',
		labelKey: 'units.floz',
		category: 'volume',
		system: 'imperial'
	},
	{ id: 'pcs', labelKey: 'units.pcs', category: 'quantity', system: 'metric' }
]

export const findUnitById = (unitId?: string): UnitDefinition | undefined =>
	UNITS.find((unit) => unit.id === unitId)
