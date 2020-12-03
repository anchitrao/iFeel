import React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';

const Input = ({ label, value, onChangeText, placeholder, secureTextEntry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{ label }</Text>
      <TextInput
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        secureTextEntry={secureTextEntry}
        value={value}
        // Otherwise there is an ugly line under the text entry fields
        underlineColorAndroid='transparent'
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    width: '100%',
    borderColor: '#eee',
  
  },
  label: {
    padding: 5,
    paddingBottom: 0,
    color: '#13294B',
    fontSize: 17,
    fontWeight: '700',
    width: '100%',
  },
  input: {
    paddingRight: 5,
    paddingLeft: 5,
    paddingBottom: 2,
    paddingTop: 5,
    //color: '#333',
    backgroundColor: 'white',
    //marginBottom: 5,
    fontSize: 18,
    width: '100%',
    borderRadius: 4,
  }
});

export { Input };
