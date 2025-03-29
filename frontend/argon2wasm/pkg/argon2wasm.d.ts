/* tslint:disable */
/* eslint-disable */
/**
 * Derives an X25519 key pair from a given password and salt using Argon2 key stretching.
 *
 * The function hashes the password with a base64-encoded salt using Argon2, and derives an X25519 private key from the hash.
 * The public key is returned as a Bech32-encoded string while the private key is kept inside the wasm module for later use.
 *
 * # Arguments
 *
 * * `password` - A string slice representing the password.
 * * `salt` - A string slice representing the salt. Its representation in base64 must be more than 4-byte long.
 *
 * # Returns
 *
 * * `Ok(String)` - A Bech32-encoded public key string if key derivation is successful.
 * * `Err(String)` - An error message if key derivation fails.
 */
export function derive_key_pair(password: string, salt: string): string;
export function asym_encrypt(data: string, public_key: string): Uint8Array;
export function asym_encrypt_bytes(data: Uint8Array, public_key: string): Uint8Array;
export function asym_decrypt(data: Uint8Array): string;
export function asym_decrypt_bytes(data: Uint8Array): Uint8Array;
export function generate_sym_key(): Uint8Array;
export function sym_encrypt_bytes(data: Uint8Array, key: Uint8Array): EncryptedMessage;
export function sym_encrypt(data: string, key: Uint8Array): EncryptedMessage;
export function sym_decrypt_bytes(message: EncryptedMessage, key: Uint8Array): Uint8Array;
export function sym_decrypt(message: EncryptedMessage, key: Uint8Array): string;

type EncryptedMessage = {
  nonce: Uint8Array,
  message: Uint8Array
}



export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly derive_key_pair: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly asym_encrypt: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly asym_decrypt: (a: number, b: number) => [number, number, number, number];
  readonly asym_decrypt_bytes: (a: number, b: number) => [number, number, number, number];
  readonly asym_encrypt_bytes: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly generate_sym_key: () => [number, number];
  readonly sym_encrypt_bytes: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly sym_encrypt: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly sym_decrypt_bytes: (a: any, b: number, c: number) => [number, number, number, number];
  readonly sym_decrypt: (a: any, b: number, c: number) => [number, number, number, number];
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_4: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
