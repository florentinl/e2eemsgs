use aes_gcm::{
    AeadCore as _, Aes256Gcm, Key, KeyInit as _,
    aead::{Aead, OsRng},
};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn generate_sym_key() -> Vec<u8> {
    Aes256Gcm::generate_key(OsRng).iter().cloned().collect()
}

#[wasm_bindgen(typescript_custom_section)]
const ENCRYPTED_MESSAGE: &'static str = r#"
type EncryptedMessage = {
  nonce: Uint8Array,
  message: Uint8Array
}
"#;

#[derive(Serialize, Deserialize)]
pub struct EncryptedMessage {
    pub nonce: Vec<u8>,
    pub cipher_text: Vec<u8>,
}

#[wasm_bindgen(unchecked_return_type = "EncryptedMessage")]
pub fn sym_encrypt_bytes(data: &[u8], key: &[u8]) -> Result<JsValue, JsError> {
    let key: [u8; 32] = key.try_into()?;
    let key = Key::<Aes256Gcm>::from(key);

    let cipher = Aes256Gcm::new(&key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let cipher_text = cipher
        .encrypt(&nonce, data)
        .map_err(|e| JsError::new(&e.to_string()))?;

    serde_wasm_bindgen::to_value(&EncryptedMessage {
        nonce: nonce.to_vec(),
        cipher_text,
    })
    .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen(unchecked_return_type = "EncryptedMessage")]
pub fn sym_encrypt(data: String, key: &[u8]) -> Result<JsValue, JsError> {
    sym_encrypt_bytes(data.as_bytes(), key)
}

#[wasm_bindgen]
pub fn sym_decrypt_bytes(
    #[wasm_bindgen(unchecked_param_type = "EncryptedMessage")] message: JsValue,
    key: &[u8],
) -> Result<Vec<u8>, JsError> {
    let message: EncryptedMessage =
        serde_wasm_bindgen::from_value(message).map_err(|e| JsError::new(&e.to_string()))?;

    let key: [u8; 32] = key.try_into()?;
    let key = Key::<Aes256Gcm>::from(key);
    let cipher = Aes256Gcm::new(&key);
    let nonce = message.nonce.as_slice().try_into()?;

    let clear_text = cipher
        .decrypt(nonce, message.cipher_text.as_slice())
        .map_err(|e| JsError::new(&e.to_string()));

    clear_text
}

#[wasm_bindgen]
pub fn sym_decrypt(
    #[wasm_bindgen(unchecked_param_type = "EncryptedMessage")] message: JsValue,
    key: &[u8],
) -> Result<String, JsError> {
    let decrypted = sym_decrypt_bytes(message, key)?;

    String::from_utf8(decrypted).map_err(|e| JsError::new(&e.to_string()))
}
