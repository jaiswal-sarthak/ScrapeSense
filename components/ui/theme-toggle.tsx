"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="group relative rounded-full border border-white/20 bg-white/10 p-3 transition-all duration-300 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60"
                aria-label="Toggle theme"
                disabled
            >
                <div className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={toggle}
            className="group relative rounded-full border border-white/20 bg-white/10 p-3 transition-all duration-300 hover:scale-110 hover:border-white/30 hover:bg-white/20 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-white/30 dark:hover:bg-slate-800/80"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-300 transition-transform duration-300 group-hover:rotate-90" />
            ) : (
                <Moon className="h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:-rotate-12 dark:text-blue-200" />
            )}

            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 dark:from-sky-400/20 dark:to-violet-400/20" />
        </button>
    );
}
