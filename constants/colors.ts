const THEMES = {
  forest: {
    primary: '#008751',
    primaryDark: '#005C37',
    primaryLight: '#E8F5EC',
    accent: '#FF6B00',
    accentLight: '#FFF0E6',
    gold: '#FFB300',
  },
  teal: {
    primary: '#00695C',
    primaryDark: '#004D40',
    primaryLight: '#E0F2F1',
    accent: '#F59E0B',
    accentLight: '#FFFBEB',
    gold: '#FFD700',
  },
  blue: {
    primary: '#1565C0',
    primaryDark: '#003C8F',
    primaryLight: '#E3F2FD',
    accent: '#FF6B00',
    accentLight: '#FFF0E6',
    gold: '#FFD700',
  },
  dark: {
    primary: '#1B4332',
    primaryDark: '#0A2818',
    primaryLight: '#D8F3DC',
    accent: '#E8621A',
    accentLight: '#FFF0E6',
    gold: '#F4A261',
  },
};

export type ThemeKey = keyof typeof THEMES;

export function getTheme(): ThemeKey {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('cityhup_theme') as ThemeKey | null;
    if (saved && THEMES[saved]) return saved;
  }
  return 'forest';
}

export function switchTheme(id: ThemeKey) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cityhup_theme', id);
    window.location.reload();
  }
}

export const THEME_META: { id: ThemeKey; label: string; preview: string; accent: string }[] = [
  { id: 'forest', label: 'Forest Green', preview: '#008751', accent: '#FF6B00' },
  { id: 'teal',   label: 'Teal & Gold',  preview: '#00695C', accent: '#F59E0B' },
  { id: 'blue',   label: 'Royal Blue',   preview: '#1565C0', accent: '#FF6B00' },
  { id: 'dark',   label: 'Dark Forest',  preview: '#1B4332', accent: '#E8621A' },
];

const theme = THEMES[getTheme()];

export const Colors = {
  ...theme,
  white: '#FFFFFF',
  black: '#000000',
  bgLight: '#F6F8FA',
  bgCard: '#FFFFFF',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  textDark: '#1A1A2E',
  textMedium: '#4A4A6A',
  textLight: '#888898',
  textMuted: '#BBBBCC',
  danger: '#D32F2F',
  dangerLight: '#FFEBEE',
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#F57F17',
  warningLight: '#FFFDE7',
  info: '#0277BD',
  infoLight: '#E1F5FE',
  shadow: 'rgba(0,0,0,0.08)',
  overlay: 'rgba(0,0,0,0.5)',
};
