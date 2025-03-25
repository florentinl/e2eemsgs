import init, { asym_decrypt, derive_key_pair, asym_encrypt } from "argon2wasm";
import { useEffect, useRef, useState } from "react";
import { Box, Input } from "@mui/material";

function App() {
  const [isReady, setIsReady] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const saltRef = useRef<HTMLInputElement>(null);
  const clearTextRef = useRef<HTMLInputElement>(null);

  const [publicKey, setPublicKey] = useState<string>();
  const [cipherBytes, setCipherBytes] = useState<Uint8Array>();
  const [clearText, setClearText] = useState<string>();

  useEffect(() => {
    init().then(() => {
      setIsReady(true);
    });
  }, []);

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
      <button onClick={onClick} disabled={!isReady}>
        Derive
      </button>
      <Box>
        <p>Public Key</p>
        <p>{publicKey}</p>
      </Box>
      <Box>
        <Input inputRef={clearTextRef} />
      </Box>
      <button onClick={onClickEncrypt} disabled={!isReady}>
        Encrypt
      </button>
      <Box>
        <p>Encrypted Bytes</p>
        <p>{cipherBytes?.toString()}</p>
      </Box>
      <button onClick={onClickDecrypt} disabled={!isReady}>
        Decrypt
      </button>
      <Box>
        <p>Clear Text</p>
        <p>{clearText}</p>
      </Box>
    </Box>
  );
}

export default App;
