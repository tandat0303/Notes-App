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
};

// Color theme configurations
const colorThemeConfig = {
  blue: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#3b82f6',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
  },
  green: {
    primary: '#16a34a',
    primaryHover: '#15803d',
    primaryLight: '#22c55e',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
  },
  purple: {
    primary: '#9333ea',
    primaryHover: '#7e22ce',
    primaryLight: '#a855f7',
    gradient: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
  },
  orange: {
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryLight: '#f97316',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
  },
  red: {
    primary: '#dc2626',
    primaryHover: '#b91c1c',
    primaryLight: '#ef4444',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)',
  },
  pink: {
    primary: '#db2777',
    primaryHover: '#be185d',
    primaryLight: '#ec4899',
    gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
  },
  teal: {
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#14b8a6',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
  },
  yellow: {
    primary: '#eab308',
    primaryHover: '#ca8a04',
    primaryLight: '#facc15',
    gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
  },
  indigo: {
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryLight: '#6366f1',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
  },
  cyan: {
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    primaryLight: '#22d3ee',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
  },
  slate: {
    primary: '#475569',
    primaryHover: '#334155',
    primaryLight: '#64748b',
    gradient: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
  },
};

// Font theme configurations
const fontThemeConfig = {
  inter: '"Inter", system-ui, -apple-system, sans-serif',
  roboto: '"Roboto", system-ui, -apple-system, sans-serif',
  poppins: '"Poppins", system-ui, -apple-system, sans-serif',
  geist: '"Geist", system-ui, -apple-system, sans-serif',
  catamaran: '"Catamaran", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
};

export const ThemeProvider = ({ children }) => {
  const { user } = useUser();
  const [localTheme, setLocalTheme] = useState({
    colorTheme: "blue",
    fontTheme: "inter",
  });

  const preferences = useQuery(
    api.userPreferences.getUserPreferences,
    user ? { userId: user.id } : "skip",
  );

  const updatePreferences = useMutation(
    api.userPreferences.updateUserPreferences,
  );

  useEffect(() => {
    if (preferences) {
      setLocalTheme(preferences);
    }
  }, [preferences]);

  useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    const colors = colorThemeConfig[localTheme.colorTheme];
    const font = fontThemeConfig[localTheme.fontTheme];

    // Set CSS custom properties for colors
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-hover', colors.primaryHover);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--gradient-primary', colors.gradient);

    // Set font family
    root.style.setProperty('--font-primary', font);
    document.body.style.fontFamily = font;

    // Update meta theme color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', colors.primary);

  }, [localTheme]);

  const setTheme = async (updates) => {
    if (!user) {
      // If no user, just update local state
      setLocalTheme(prev => ({ ...prev, ...updates }));
      return;
    }

    const newTheme = { ...localTheme, ...updates };
    setLocalTheme(newTheme);

    try {
      await updatePreferences({
        userId: user.id,
        ...updates,
      });
    } catch (error) {
      console.error("Failed to update theme:", error);
      toast.error("Failed to save theme preference");
      // Revert on error
      setLocalTheme(localTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: localTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};