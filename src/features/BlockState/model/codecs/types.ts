export interface BlockStateCodec<TState> {
	/** Codec format version — bumped when the binary layout of TState changes */
	version: number
	encode(state: TState): Uint8Array
	decode(bytes: Uint8Array, version: number): TState
}
