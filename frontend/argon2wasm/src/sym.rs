use aes_gcm::{
    AeadCore as _, Aes256Gcm, Key, KeyInit as _,
    aead::{Aead, OsRng},
};
use base64::{Engine as _, prelude::BASE64_STANDARD};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn generate_sym_key() -> String {
    let key: Vec<u8> = Aes256Gcm::generate_key(OsRng).iter().cloned().collect();
    BASE64_STANDARD.encode(key)
}

#[wasm_bindgen(typescript_custom_section)]
const ENCRYPTED_MESSAGE: &'static str = r#"
type EncryptedMessage = {
  nonce: string,
  message: string
}
"#;

#[derive(Serialize, Deserialize)]
pub struct EncryptedMessage {
    pub nonce: String,
    pub message: String,
}

fn key_from_str(key: &str) -> Result<Key<Aes256Gcm>, JsError> {
    let key: Vec<u8> = BASE64_STANDARD.decode(key)?;
    let key_array: [u8; 32] = key.as_slice().try_into()?;
    Ok(Key::<Aes256Gcm>::from(key_array))
}

#[wasm_bindgen(unchecked_return_type = "EncryptedMessage")]
pub fn sym_encrypt_bytes(data: &[u8], key: &str) -> Result<JsValue, JsError> {
    let key = key_from_str(key)?;

    let cipher = Aes256Gcm::new(&key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let cipher_text = cipher
        .encrypt(&nonce, data)
        .map_err(|e| JsError::new(&e.to_string()))?;

    serde_wasm_bindgen::to_value(&EncryptedMessage {
        nonce: BASE64_STANDARD.encode(nonce),
        message: BASE64_STANDARD.encode(cipher_text),
    })
    .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen(unchecked_return_type = "EncryptedMessage")]
pub fn sym_encrypt(data: String, key: &str) -> Result<JsValue, JsError> {
    sym_encrypt_bytes(data.as_bytes(), key)
}

#[wasm_bindgen]
pub fn sym_decrypt_bytes(
    #[wasm_bindgen(unchecked_param_type = "EncryptedMessage")] message: JsValue,
    key: &str,
) -> Result<Vec<u8>, JsError> {
    let key = key_from_str(&key)?;

    let message: EncryptedMessage =
        serde_wasm_bindgen::from_value(message).map_err(|e| JsError::new(&e.to_string()))?;

    let cipher_text = BASE64_STANDARD.decode(message.message)?;
    let nonce = BASE64_STANDARD.decode(message.nonce)?;
    let nonce = nonce.as_slice().try_into()?;

    let cipher = Aes256Gcm::new(&key);
    let clear_text = cipher
        .decrypt(nonce, cipher_text.as_slice())
        .map_err(|e| JsError::new(&e.to_string()));

    clear_text
}

#[wasm_bindgen]
pub fn sym_decrypt(
    #[wasm_bindgen(unchecked_param_type = "EncryptedMessage")] message: JsValue,
    key: &str,
) -> Result<String, JsError> {
    let decrypted = sym_decrypt_bytes(message, key)?;

    String::from_utf8(decrypted).map_err(|e| JsError::new(&e.to_string()))
}
