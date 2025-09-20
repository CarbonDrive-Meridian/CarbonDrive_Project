import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  error,
  disabled = false,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const showPasswordToggle = secureTextEntry;
  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
    style,
  ];

  const inputStyleCombined = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
    disabled && styles.disabledInput,
    inputStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={containerStyle}>
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color="#6C757D"
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={inputStyleCombined}
          placeholder={placeholder}
          placeholderTextColor="#6C757D"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={actualSecureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#6C757D"
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color="#6C757D"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  focused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  error: {
    borderColor: '#FF3B30',
  },
  disabled: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5E7',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  disabledInput: {
    color: '#8E8E93',
  },
  leftIcon: {
    marginLeft: 16,
  },
  rightIcon: {
    marginRight: 16,
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
});
