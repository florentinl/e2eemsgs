import {
  asym_decrypt,
  derive_key_pair,
  asym_encrypt,
  sym_decrypt,
  generate_sym_key,
  sym_encrypt,
} from "argon2wasm";
import { useRef, useState } from "react";
import { Box, Input } from "@mui/material";
import { useCryptoWasmReady } from "../hooks/cryptoWasm";

function App() {
  const { initialized } = useCryptoWasmReady();

  const passwordRef = useRef<HTMLInputElement>(null);
  const saltRef = useRef<HTMLInputElement>(null);
  const clearTextRef = useRef<HTMLInputElement>(null);

  const [publicKey, setPublicKey] = useState<string>();
  const [cipherBytes, setCipherBytes] = useState<Uint8Array>();
  const [clearText, setClearText] = useState<string>();

  const testSymEnc = () => {
    const key = generate_sym_key();
    const msg = "This is a hello msg";
    const encrypted_message = sym_encrypt(msg, key);

    const decrypt_message = sym_decrypt(encrypted_message, key);

    console.log(msg == decrypt_message);
    console.log(encrypted_message);
  };

  const onClick = () => {
    const password = passwordRef.current?.value;
    const salt = saltRef.current?.value;

    if (password && salt) {
      setPublicKey(derive_key_pair(password, salt));
    }
  };

  const onClickEncrypt = () => {
    const clearText = clearTextRef.current?.value;
    if (clearText && publicKey) {
      setCipherBytes(asym_encrypt(clearText, publicKey));
    }
  };

  const onClickDecrypt = () => {
    if (!cipherBytes) return;
    setClearText(asym_decrypt(cipherBytes));
  };

  return (
    <Box>
      <Box>
        <Input inputRef={passwordRef} />
      </Box>
      <Box>
        <Input inputRef={saltRef} />
      </Box>
      <button onClick={onClick} disabled={!initialized}>
        Derive
      </button>
      <Box>
        <p>Public Key</p>
        <p>{publicKey}</p>
      </Box>
      <Box>
        <Input inputRef={clearTextRef} />
      </Box>
      <button onClick={onClickEncrypt} disabled={!initialized}>
        Encrypt
      </button>
      <Box>
        <p>Encrypted Bytes</p>
        <p>{cipherBytes?.toString()}</p>
      </Box>
      <button onClick={onClickDecrypt} disabled={!initialized}>
        Decrypt
      </button>
      <Box>
        <p>Clear Text</p>
        <p>{clearText}</p>
      </Box>
      <Box>
        <button onClick={testSymEnc} disabled={!initialized}>
          Test Symmetric Encryption
        </button>
      </Box>
    </Box>
  );
}

export default App;
