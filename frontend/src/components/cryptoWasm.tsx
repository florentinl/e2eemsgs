import { useEffect, useState, type ReactNode } from "react";
import init from "argon2wasm";
import LoadingPage from "../pages/LoadingPage";

export const CryptoWasmWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    init().then(() => {
      setInitialized(true);
    });
  }, []);

  return initialized ? children : <LoadingPage />;
};
