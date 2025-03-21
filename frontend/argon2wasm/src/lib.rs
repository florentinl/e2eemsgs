use std::{str::FromStr, sync::Mutex};

use age::x25519::{Identity, Recipient};
use argon2::{password_hash::SaltString, Argon2, Params, PasswordHasher};
use base64::{prelude::BASE64_STANDARD_NO_PAD, Engine};
use bech32::{Bech32, Hrp};
use lazy_static::lazy_static;
use wasm_bindgen::prelude::*;

lazy_static! {
    static ref IDENTITY: Mutex<Option<Identity>> = Mutex::new(None);
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
pub fn derive_key_pair(password: &str, salt: &str) -> Result<String, String> {
    // Default len is 32 bytes and customizing the params is annoying, so just asserting that the default is what we expect.
    assert_eq!(Params::DEFAULT_OUTPUT_LEN, 32);

    let argon2 = Argon2::default();

    let password = password.as_bytes();

    // Encode salt as base64
    let salt = BASE64_STANDARD_NO_PAD.encode(salt);

    let salt = SaltString::from_b64(&salt).unwrap();

    let hashed = argon2.hash_password(password, &salt).unwrap();

    let data = hashed.hash.unwrap();
    // Bech32 encode the data
    let hrp = Hrp::parse("age-secret-key-").unwrap();
    let data = bech32::encode::<Bech32>(hrp, data.as_bytes()).unwrap();

    let identity = Identity::from_str(&data).unwrap();
    let recipient = identity.to_public();
    IDENTITY.lock().unwrap().replace(identity);

    Ok(recipient.to_string())
}

#[wasm_bindgen]
pub fn asym_encrypt(data: &str, public_key: &str) -> Vec<u8> {
    let recipient = Recipient::from_str(public_key).unwrap();
    age::encrypt(&recipient, data.as_bytes()).unwrap()
}

#[wasm_bindgen]
pub fn asym_decrypt(data: &[u8]) -> String {
    let identity = IDENTITY.lock().unwrap();
    let identity = identity.as_ref().unwrap();

    let decrypted = age::decrypt(identity, data).unwrap();

    String::from_utf8(decrypted).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_key_pair() {
        let password = "password";
        let salt = "toto@gmail.com";
        let _ = derive_key_pair(password, salt).unwrap();
        assert!(IDENTITY.lock().unwrap().is_some());
    }

    #[test]
    fn test_encrypt_decrypt() {
        let password = "password";
        let salt = "toto@gmail.com";
        let recipient = derive_key_pair(password, salt).unwrap();
        let data = "Hello, world!";
        let encrypted = asym_encrypt(data, &recipient);
        let decrypted = asym_decrypt(&encrypted);
        assert_eq!(data, decrypted);
    }
}
