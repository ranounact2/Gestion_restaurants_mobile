import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) => {
  const theme = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Tailles
    const sizeStyles = {
      small: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        minHeight: 36,
      },
      medium: {
        paddingVertical: theme.spacing.md + 2,
        paddingHorizontal: theme.spacing.lg + 4,
        minHeight: 50,
      },
      large: {
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
        minHeight: 56,
      },
    };

    // Variantes modernes
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? theme.colors.textMuted : theme.colors.primary,
        ...theme.shadows.primary,
      },
      secondary: {
        backgroundColor: disabled ? theme.colors.accent : theme.colors.secondary,
        ...theme.shadows.medium,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? theme.colors.border : theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      success: {
        backgroundColor: disabled ? theme.colors.textMuted : theme.colors.success,
        ...theme.shadows.small,
      },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: theme.typography.weights.semibold,
    };

    // Tailles de texte
    const sizeTextStyles = {
      small: { fontSize: theme.typography.sizes.sm },
      medium: { fontSize: theme.typography.sizes.md },
      large: { fontSize: theme.typography.sizes.lg },
    };

    // Couleurs selon la variante
    const variantTextStyles = {
      primary: {
        color: theme.colors.textWhite,
      },
      secondary: {
        color: theme.colors.textWhite,
      },
      outline: {
        color: disabled ? theme.colors.textLight : theme.colors.primary,
      },
      ghost: {
        color: disabled ? theme.colors.textMuted : theme.colors.primary,
      },
      success: {
        color: theme.colors.textWhite,
      },
    };

    return [baseTextStyle, sizeTextStyles[size], variantTextStyles[variant]];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? theme.colors.textWhite : theme.colors.primary}
          style={{ marginRight: theme.spacing.sm }}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
