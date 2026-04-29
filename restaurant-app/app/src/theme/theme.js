// Thème moderne et élégant pour l'application Restaurant
// Design moderne avec palette Orange vibrante et interface épurée

export const colors = {
  // Couleurs principales - Gradient Orange moderne
  primary: '#FF6B35',      // Orange vif et moderne
  primaryDark: '#E85A2B',  // Orange foncé pour hover/pressed
  primaryLight: '#FF8C5A', // Orange clair pour accents
  primaryGradient: ['#FF6B35', '#FF8C42'], // Gradient pour les boutons
  
  // Couleurs secondaires - Tons neutres élégants
  secondary: '#2D3748',    // Gris charbon moderne
  secondaryLight: '#4A5568', // Gris moyen
  accent: '#F7FAFC',        // Gris très clair pour backgrounds
  
  // Arrière-plans
  background: '#FFFFFF',    // Blanc pur
  backgroundLight: '#FAFAFA', // Gris très clair subtil
  backgroundDark: '#1A202C',  // Fond sombre pour sections spéciales
  backgroundGradient: ['#FFF5F0', '#FFFFFF'], // Gradient subtil
  
  // Texte
  text: '#1A202C',         // Texte principal - presque noir
  textLight: '#718096',    // Texte secondaire - gris doux
  textMuted: '#A0AEC0',    // Texte désactivé
  textWhite: '#FFFFFF',    // Texte blanc
  
  // États
  success: '#48BB78',      // Vert moderne
  error: '#F56565',        // Rouge moderne
  warning: '#ED8936',      // Orange d'avertissement
  info: '#4299E1',         // Bleu moderne
  
  // Bordures et séparateurs
  border: '#E2E8F0',       // Bordure claire moderne
  borderDark: '#CBD5E0',   // Bordure foncée
  divider: '#EDF2F7',      // Divider subtil
  
  // Ombres modernes avec transparence
  shadow: 'rgba(45, 55, 72, 0.1)',     // Ombre légère
  shadowMedium: 'rgba(45, 55, 72, 0.15)', // Ombre moyenne
  shadowDark: 'rgba(45, 55, 72, 0.2)',   // Ombre foncée
  shadowPrimary: 'rgba(255, 107, 53, 0.3)', // Ombre colorée primaire
};

export const spacing = {
  // Grille 8pt comme dans l'image
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const borderRadius = {
  // Rayons d'angle observés dans l'image
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 50,
};

export const typography = {
  // Tailles de police
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Poids de police
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Hauteurs de ligne
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const shadows = {
  // Ombres modernes avec élévation subtile
  small: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  medium: {
    shadowColor: colors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  large: {
    shadowColor: colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Ombre colorée pour les boutons primaires
  primary: {
    shadowColor: colors.shadowPrimary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // Ombre subtile pour les cards
  card: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
};

// Thème complet
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export default theme;
