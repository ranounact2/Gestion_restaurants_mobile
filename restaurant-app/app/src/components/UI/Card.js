import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'medium',
  ...props
}) => {
  const theme = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
    };

    // Variantes modernes
    const variantStyles = {
      default: {
        ...theme.shadows.card,
      },
      elevated: {
        ...theme.shadows.medium,
      },
      outlined: {
        borderWidth: 1.5,
        borderColor: theme.colors.border,
      },
      flat: {
        backgroundColor: theme.colors.backgroundLight,
      },
      primary: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.primary,
      },
    };

    // Padding
    const paddingStyles = {
      none: {},
      small: { padding: theme.spacing.sm },
      medium: { padding: theme.spacing.md },
      large: { padding: theme.spacing.lg },
    };

    return [baseStyle, variantStyles[variant], paddingStyles[padding]];
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[getCardStyle(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
