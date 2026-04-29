import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const inputRef = useRef(null);

  const getContainerStyle = () => {
    return {
      marginBottom: theme.spacing.md,
    };
  };

  const getLabelStyle = () => {
    return {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.semibold,
      color: isFocused ? theme.colors.primary : theme.colors.text,
      marginBottom: theme.spacing.sm,
    };
  };

  const getInputContainerStyle = () => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: isFocused ? 2 : 1.5,
      borderBottomColor: error 
        ? theme.colors.error 
        : isFocused 
          ? theme.colors.primary 
          : theme.colors.border,
      paddingVertical: theme.spacing.md,
    };
  };

  const getInputStyle = () => {
    return {
      flex: 1,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text,
      paddingVertical: theme.spacing.sm,
      textAlignVertical: multiline ? 'top' : 'center',
    };
  };

  const getErrorStyle = () => {
    return {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    };
  };

  const handleSecureToggle = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      
      <View style={getInputContainerStyle()} pointerEvents="auto">
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={theme.colors.textLight}
            style={{ marginRight: theme.spacing.sm }}
          />
        )}
        
        <TextInput
          ref={inputRef}
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={true}
          pointerEvents="auto"
          selectTextOnFocus={false}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={handleSecureToggle}>
            <Ionicons
              name={isSecure ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.textLight}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={theme.colors.textLight}
              style={{ marginLeft: theme.spacing.sm }}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={getErrorStyle()}>{error}</Text>}
    </View>
  );
};

export default Input;
