import React from 'react';
import { TextInput, View } from 'react-native';
import { TITLES } from '@constants/titles';
import { COLORS } from '@constants/colors';
import styles from './style';

const SearchBar = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={TITLES.TICKET_LIST.SEARCH_PLACEHOLDER}
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        accessibilityLabel={TITLES.TICKET_LIST.SEARCH_PLACEHOLDER}
        returnKeyType="search"
      />
    </View>
  );
};

export default SearchBar;
