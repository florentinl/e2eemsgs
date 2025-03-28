import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import "./styles.css";

import DemoCrypto from "./pages/DemoCrypto.tsx";
import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import Login from "./pages/Login.tsx";
import Chat from "./pages/Chat.tsx";
import { WebSocketProvider } from "./hooks/websockets.tsx";
import { CryptoWasmProvider } from "./hooks/cryptoWasm.tsx";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DemoCrypto,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const wsDemoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: Chat,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, wsDemoRoute]);

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  const prefers_dark_mode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = createTheme({
    colorSchemes: prefers_dark_mode
      ? {
          dark: true,
        }
      : {
          light: true,
        },
  });
  return (
    <StrictMode>
      <WebSocketProvider>
        <CryptoWasmProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <RouterProvider router={router} />
          </ThemeProvider>
        </CryptoWasmProvider>
      </WebSocketProvider>
    </StrictMode>
  );
};

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
