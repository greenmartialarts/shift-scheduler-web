"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");
    useEffect(() => {
        const initTheme = () => {
            // Check local storage or system preference
            const storedTheme = localStorage.getItem("theme") as Theme | null;
            if (storedTheme) {
                setTheme(storedTheme);
                document.documentElement.classList.toggle("dark", storedTheme === "dark");
            } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                setTheme("dark");
                document.documentElement.classList.add("dark");
            }
        };

        // Delay to avoid cascading render warning
        const timer = setTimeout(initTheme, 0);
        return () => clearTimeout(timer);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    // We always render the provider to ensure useTheme works during SSR
    // The theme will default to 'light' on server and initial client render
    // Then useEffect will update it based on preference
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
