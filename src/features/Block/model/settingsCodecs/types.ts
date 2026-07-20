export interface BlockSettingsCodec<TSettings> {
	version: number
	encode(settings: TSettings): unknown[]
	decode(tuple: unknown[]): TSettings
}
