import * as React from "react";
import { useState, useEffect, createContext, useContext } from "react";

// Create the context
const ThemeProviderContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("vite-ui-theme") || "dark");
  
  useEffect(() => {
    // Update localStorage and document class when theme changes
    localStorage.setItem("vite-ui-theme", theme);
    
    // Apply the theme - this works for Shadcn UI
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Also set the data-theme attribute for completeness
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};