export const Colors = {
  primary: '#6C5CE7',
  background: '#F8F6FF',
  surface: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',
  border: '#CFC8FB',
  success: '#00B894',
  error: '#E17055',
  accent: '#FDCB6E',

  // Derived
  primaryLight: 'rgba(108, 92, 231, 0.06)',
  primaryMid: 'rgba(108, 92, 231, 0.12)',
  primaryBorder: 'rgba(108, 92, 231, 0.25)',
  tabActive: '#6C5CE7',
  tabInactive: '#B2BEC3',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  card: {
    elevation: 2,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  modal: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: Colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '700' as const, color: Colors.textPrimary },
  h4: { fontSize: 15, fontWeight: '600' as const, color: Colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400' as const, color: Colors.textPrimary },
  bodyBold: { fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textSecondary },
  captionBold: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
  tiny: { fontSize: 11, fontWeight: '400' as const, color: Colors.textMuted },
};
