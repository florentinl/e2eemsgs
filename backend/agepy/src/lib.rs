use std::str::FromStr as _;

use age::x25519::Recipient;
use pyo3::prelude::*;

#[pyfunction]
pub fn asym_encrypt(data: &str, public_key: &str) -> Vec<u8> {
    let recipient = Recipient::from_str(public_key).unwrap();
    age::encrypt(&recipient, data.as_bytes()).unwrap()
}

#[pymodule]
fn agepy(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(asym_encrypt, m)?)?;
    Ok(())
}
