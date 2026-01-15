import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const ThemeContext = createContext(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
}

export const ThemeProvider = ({ children }) => {
    const { user } = useUser;
    const [localTheme, setLocalTheme] = useState({
        colorTheme: "blue",
        fontTheme: "inter"
    });

    const preferences = useQuery(api.userPreferences.getUserPreferences, user ?
        {userId: user.id} : "skip"
    );

    const updatePreferences = useMutation(api.userPreferences.updateUserPreferences);

    useEffect(() => {
        if (preferences) {
            setLocalTheme(preferences);
        }
    }, [preferences]);

    useEffect(() => {
        //Apply theme classes to the document
        const root = document.documentElement;

        //Remove existing classes
        root.classList.remove(
            "theme-blue",
            "theme-green",
            "theme-purple",
            "theme-orange",
            "theme-red",
            "theme-pink",
            "theme-teal",
            "theme-yellow",
            "theme-indigo",
            "theme-cyan",
            "theme-slate",
            "font-inter",
            "font-roboto",
            "font-poppins",
            "font-mono",
        );

        //Apply new theme
        root.classList.add(
            `theme-${localTheme.colorTheme}`,
            `font-${localTheme.fontTheme}`
        );
    }, [localTheme])

    const setTheme = async (updates) => {
        if (!user) return;

        const newTheme = {...localTheme, ...updates};
        setLocalTheme(newTheme);

        try {
            await updatePreferences({
                userId: user.id,
                ...updates,
            });
        } catch (error) {
            console.error("Failed to update theme: ", error);
            toast.error("Failed to update theme: ");
        }
    }

    return <ThemeContext.Provider value={{ theme: localTheme, setTheme }}>
        {children}
    </ThemeContext.Provider>
}