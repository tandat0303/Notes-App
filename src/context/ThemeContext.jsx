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
    primaryDark: '#1e40af',
    primary50: '#eff6ff',
    primary100: '#dbeafe',
    primary200: '#bfdbfe',
    primary600: '#2563eb',
    primary700: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
    gradientHover: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
    shadow: 'rgba(37, 99, 235, 0.3)',
    shadowLight: 'rgba(37, 99, 235, 0.1)',
  },
  green: {
    primary: '#16a34a',
    primaryHover: '#15803d',
    primaryLight: '#22c55e',
    primaryDark: '#166534',
    primary50: '#f0fdf4',
    primary100: '#dcfce7',
    primary200: '#bbf7d0',
    primary600: '#16a34a',
    primary700: '#15803d',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
    gradientHover: 'linear-gradient(135deg, #15803d 0%, #047857 100%)',
    shadow: 'rgba(22, 163, 74, 0.3)',
    shadowLight: 'rgba(22, 163, 74, 0.1)',
  },
  purple: {
    primary: '#9333ea',
    primaryHover: '#7e22ce',
    primaryLight: '#a855f7',
    primaryDark: '#6b21a8',
    primary50: '#faf5ff',
    primary100: '#f3e8ff',
    primary200: '#e9d5ff',
    primary600: '#9333ea',
    primary700: '#7e22ce',
    gradient: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
    gradientHover: 'linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%)',
    shadow: 'rgba(147, 51, 234, 0.3)',
    shadowLight: 'rgba(147, 51, 234, 0.1)',
  },
  orange: {
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryLight: '#f97316',
    primaryDark: '#9a3412',
    primary50: '#fff7ed',
    primary100: '#ffedd5',
    primary200: '#fed7aa',
    primary600: '#ea580c',
    primary700: '#c2410c',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
    gradientHover: 'linear-gradient(135deg, #c2410c 0%, #d97706 100%)',
    shadow: 'rgba(234, 88, 12, 0.3)',
    shadowLight: 'rgba(234, 88, 12, 0.1)',
  },
  red: {
    primary: '#dc2626',
    primaryHover: '#b91c1c',
    primaryLight: '#ef4444',
    primaryDark: '#991b1b',
    primary50: '#fef2f2',
    primary100: '#fee2e2',
    primary200: '#fecaca',
    primary600: '#dc2626',
    primary700: '#b91c1c',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)',
    gradientHover: 'linear-gradient(135deg, #b91c1c 0%, #be123c 100%)',
    shadow: 'rgba(220, 38, 38, 0.3)',
    shadowLight: 'rgba(220, 38, 38, 0.1)',
  },
  pink: {
    primary: '#db2777',
    primaryHover: '#be185d',
    primaryLight: '#ec4899',
    primaryDark: '#9f1239',
    primary50: '#fdf2f8',
    primary100: '#fce7f3',
    primary200: '#fbcfe8',
    primary600: '#db2777',
    primary700: '#be185d',
    gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
    gradientHover: 'linear-gradient(135deg, #be185d 0%, #d946ef 100%)',
    shadow: 'rgba(219, 39, 119, 0.3)',
    shadowLight: 'rgba(219, 39, 119, 0.1)',
  },
  teal: {
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#14b8a6',
    primaryDark: '#115e59',
    primary50: '#f0fdfa',
    primary100: '#ccfbf1',
    primary200: '#99f6e4',
    primary600: '#0d9488',
    primary700: '#0f766e',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
    gradientHover: 'linear-gradient(135deg, #0f766e 0%, #0891b2 100%)',
    shadow: 'rgba(13, 148, 136, 0.3)',
    shadowLight: 'rgba(13, 148, 136, 0.1)',
  },
  yellow: {
    primary: '#eab308',
    primaryHover: '#ca8a04',
    primaryLight: '#facc15',
    primaryDark: '#a16207',
    primary50: '#fefce8',
    primary100: '#fef9c3',
    primary200: '#fef08a',
    primary600: '#eab308',
    primary700: '#ca8a04',
    gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
    gradientHover: 'linear-gradient(135deg, #ca8a04 0%, #d97706 100%)',
    shadow: 'rgba(234, 179, 8, 0.3)',
    shadowLight: 'rgba(234, 179, 8, 0.1)',
  },
  indigo: {
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryLight: '#6366f1',
    primaryDark: '#3730a3',
    primary50: '#eef2ff',
    primary100: '#e0e7ff',
    primary200: '#c7d2fe',
    primary600: '#4f46e5',
    primary700: '#4338ca',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    gradientHover: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)',
    shadow: 'rgba(79, 70, 229, 0.3)',
    shadowLight: 'rgba(79, 70, 229, 0.1)',
  },
  cyan: {
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    primaryLight: '#22d3ee',
    primaryDark: '#0e7490',
    primary50: '#ecfeff',
    primary100: '#cffafe',
    primary200: '#a5f3fc',
    primary600: '#06b6d4',
    primary700: '#0891b2',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
    gradientHover: 'linear-gradient(135deg, #0891b2 0%, #0284c7 100%)',
    shadow: 'rgba(6, 182, 212, 0.3)',
    shadowLight: 'rgba(6, 182, 212, 0.1)',
  },
  slate: {
    primary: '#475569',
    primaryHover: '#334155',
    primaryLight: '#64748b',
    primaryDark: '#1e293b',
    primary50: '#f8fafc',
    primary100: '#f1f5f9',
    primary200: '#e2e8f0',
    primary600: '#475569',
    primary700: '#334155',
    gradient: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
    gradientHover: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
    shadow: 'rgba(71, 85, 105, 0.3)',
    shadowLight: 'rgba(71, 85, 105, 0.1)',
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
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-primary-50', colors.primary50);
    root.style.setProperty('--color-primary-100', colors.primary100);
    root.style.setProperty('--color-primary-200', colors.primary200);
    root.style.setProperty('--color-primary-600', colors.primary600);
    root.style.setProperty('--color-primary-700', colors.primary700);
    root.style.setProperty('--gradient-primary', colors.gradient);
    root.style.setProperty('--gradient-primary-hover', colors.gradientHover);
    root.style.setProperty('--shadow-primary', colors.shadow);
    root.style.setProperty('--shadow-primary-light', colors.shadowLight);

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
    const newTheme = { ...localTheme, ...updates };
    setLocalTheme(newTheme);

    if (!user) return;

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