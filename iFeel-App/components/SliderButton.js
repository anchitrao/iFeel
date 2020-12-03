import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const OpenSliderButton = ({ onPress, children }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.openButton}>
      <Text style={styles.text}>{ children }</Text>
    </TouchableOpacity>
  )
}
const CloseSliderButton = ({ onPress, children }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
      <Text style={styles.text}>{ children }</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  openButton: {
    marginTop: 0,
    marginBottom: 0,
    padding: 5,
    width: '35%',
    backgroundColor: '#13294B',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    marginTop: 0,
    padding: 5,
    width: '35%',
    backgroundColor: '#13294B',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  }
});

export {
    OpenSliderButton,
    CloseSliderButton
};
 
