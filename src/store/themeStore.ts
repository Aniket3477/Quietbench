import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const isDark = typeof window !== 'undefined' 
    ? localStorage.getItem('theme') !== 'light' // default to dark
    : true;
    
  if (typeof window !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    isDark,
    toggleTheme: () => set((state) => {
      const newIsDark = !state.isDark;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
        if (newIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDark: newIsDark };
    }),
  };
});
