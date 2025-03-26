import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")).render(

  // <StrictMode>
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: `${window.location.origin}/dashboard`,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    }}
    scope="openid profile email read:email"
    cacheLocation="localstorage"
  >
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </Auth0Provider>
  // </StrictMode>,
);
