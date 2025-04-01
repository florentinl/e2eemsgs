use std::str::FromStr as _;

use age::x25519::Recipient;
use base64;
use pyo3::prelude::*;

#[pyfunction]
pub fn asym_encrypt(data: &str, public_key: &str) -> String {
    let recipient = Recipient::from_str(public_key).unwrap();
    base64::encode(age::encrypt(&recipient, data.as_bytes()).unwrap())
}

#[pymodule]
fn agepy(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(asym_encrypt, m)?)?;
    Ok(())
}
