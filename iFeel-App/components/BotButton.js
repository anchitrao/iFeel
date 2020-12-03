import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

// Round button to hit to have the bot send a message.
const BotButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
        <Image source={require('../assets/bot.png')} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 5,
    marginLeft: 5,
    padding: 10,
    width: 70,
    height: 70,
    backgroundColor: '#13294B',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent:'center',
    position: "absolute",
    alignSelf: 'flex-end',
  }
});

export { BotButton }; 
