import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import init from "argon2wasm";
import LoadingPage from "../pages/LoadingPage";

interface CryptoWasmContextType {
  initialized: boolean;
}

const CryptoWasmContext = createContext<CryptoWasmContextType>({
  initialized: false,
});

export const CryptoWasmProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    init().then(() => {
      setInitialized(true);
    });
  }, []);

  return (
    <CryptoWasmContext.Provider value={{ initialized }}>
      {!initialized ? <LoadingPage /> : children}
    </CryptoWasmContext.Provider>
  );
};

export const useCryptoWasmReady = () => {
  const context = useContext(CryptoWasmContext);
  if (!context)
    throw new Error(
      "useCryptoWasmReady must be used within a CryptoWasmContext"
    );
  return context;
};
