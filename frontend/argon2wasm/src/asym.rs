use std::str::FromStr;

use age::{
    secrecy::ExposeSecret,
    x25519::{Identity, Recipient},
};
use argon2::{Argon2, Params, PasswordHasher, password_hash::SaltString};
use base64::{
    Engine,
    prelude::{BASE64_STANDARD, BASE64_STANDARD_NO_PAD},
};
use bech32::{Bech32, Hrp};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct AsymKeys {
    pub public_key: String,
    pub private_key: String,
}

#[wasm_bindgen]
/// Derives an X25519 key pair from a given password and salt using Argon2 key stretching.
///
/// The function hashes the password with a base64-encoded salt using Argon2, and derives an X25519 private key from the hash.
/// The public key is returned as a Bech32-encoded string while the private key is kept inside the wasm module for later use.
///
/// # Arguments
///
/// * `password` - A string slice representing the password.
/// * `salt` - A string slice representing the salt. Its representation in base64 must be more than 4-byte long.
///
/// # Returns
///
/// * `Ok(String)` - A Bech32-encoded public key string if key derivation is successful.
/// * `Err(String)` - An error message if key derivation fails.
pub fn derive_key_pair(password: &str, salt: &str) -> Result<AsymKeys, JsError> {
    // Default len is 32 bytes and customizing the params is annoying, so just asserting that the default is what we expect.
    assert_eq!(Params::DEFAULT_OUTPUT_LEN, 32);

    let argon2 = Argon2::default();

    let password = password.as_bytes();

    // Encode salt as base64
    let salt = BASE64_STANDARD_NO_PAD.encode(salt);

    let salt = SaltString::from_b64(&salt).map_err(|e| JsError::new(&e.to_string()))?;

    let hashed = argon2
        .hash_password(password, &salt)
        .map_err(|e| JsError::new(&e.to_string()))?;

    let data = hashed
        .hash
        .ok_or(JsError::new("Error occured during hashing of variable"))?;
    // Bech32 encode the data
    let hrp = Hrp::parse("age-secret-key-").map_err(|e| JsError::new(&e.to_string()))?;
    let data =
        bech32::encode::<Bech32>(hrp, data.as_bytes()).map_err(|e| JsError::new(&e.to_string()))?;

    let identity = Identity::from_str(&data).map_err(JsError::new)?;
    let recipient = identity.to_public();
    let secret: String = identity.to_string().expose_secret().to_string();

    Ok(AsymKeys {
        public_key: recipient.to_string(),
        private_key: secret,
    })
}

#[wasm_bindgen]
pub fn asym_encrypt(data: &str, public_key: &str) -> Result<String, JsError> {
    asym_encrypt_bytes(data.as_bytes(), public_key)
}

#[wasm_bindgen]
pub fn asym_encrypt_bytes(data: &[u8], public_key: &str) -> Result<String, JsError> {
    let recipient = Recipient::from_str(public_key).map_err(JsError::new)?;
    age::encrypt(&recipient, data)
        .map_err(|e| JsError::new(&e.to_string()))
        .map(|v| BASE64_STANDARD.encode(&v))
}

#[wasm_bindgen]
pub fn asym_decrypt(data: &str, private_key: &str) -> Result<String, JsError> {
    let decrypted = asym_decrypt_bytes(data, private_key)?;
    String::from_utf8(decrypted).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn asym_decrypt_bytes(data: &str, private_key: &str) -> Result<Vec<u8>, JsError> {
    let bytes_data = BASE64_STANDARD.decode(data)?;
    let identity = Identity::from_str(private_key).map_err(JsError::new)?;
    age::decrypt(&identity, &bytes_data).map_err(|e| JsError::new(&e.to_string()))
}
