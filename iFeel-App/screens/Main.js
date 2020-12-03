// Thank you https://www.youtube.com/watch?v=pnBsuXTK8po for the
// tutorial on authentication with firebase.

// Your run of the mill React-Native imports.
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Alert } from 'react-native';
import * as firebase from 'firebase';
// Our custom components.
import { Input } from '../components/Input';
import { Button } from '../components/Button';
// API key and information for firebase
import config from '../api.json';

class Main extends React.Component {
    // Header theming and title
    static navigationOptions = {
        title: 'Login',
        headerStyle: {
            backgroundColor: '#13294B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    }
    // Stores login state, e.g. what username, and password have been
    // entered, is the app currently trying to authenticate the user,
    // and should the user be authenticated, the user object.
    state = {
        email: '',
        password: '',
        authenticating: false,
        user: null,
        error: '',
    }
    
    // Initialize Firebase
    componentWillMount() {
        firebase.initializeApp(config);
    }

    loginFailed = () => {
        this.setState({
            authenticating: false,
            user: null,
            error: 'Authentication Failure',
        })
        Alert.alert('Login Error', 'Ruh, roh! Login failure, please tried again.');
    };

    // Method to call the try to sign in the user when they hit the sign
    // in button.
    onPressSignIn() {
        this.setState({
            authenticating: true,
        });
        const { email, password } = this.state;
        // Send the entered username and password to Firebase to check
        // if they are correct.
        firebase.auth().signInWithEmailAndPassword(email, password)
            // Set authenticating back to false on response and store
            // the returned user (or lack thereof).
            .then(user => this.setState({
                authenticating: false,
                user,
                error: '',
            }))
        // If authentication went well, take the user to the groups
        // page.
        // Pass name along when switching to new window
        .then(() => this.props.navigation.navigate('Groups', { email: this.state.email }))
        // Wipe entered credentials from textinput.
        .then(() => {this.setState({email: '', password: '',})})
        
        // If not, then let the user know that something went wrong.
        .catch(() => this.loginFailed());
    }

    // Method to call if the user clicks the button to create a new
    // account.
    onPressCreateAccount() {
        // Pretty straightforward, just take the user to the Account
        // Creation page.
        this.props.navigation.navigate('CreateAccount')
    }

    // Helper function to render the screen.
    renderCurrentState() {
        // Show a progress doodad if the app is trying to log the user
        // in.
        if (this.state.authenticating) {
            return (
              <View style={styles.form}>
                <ActivityIndicator size='large' color='#13294B'/>
              </View>
            )
        }
        // Othewise, render the textboxes and buttons.
        return (
          <View style={styles.form}>
            <Input
              placeholder='Enter your email...'
              label='Email'
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            />
            <Input
              placeholder='Enter your password...'
              label='Password'
              secureTextEntry
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
            />
            <Button onPress={() => this.onPressSignIn()}>Let me in!</Button>
            <Button onPress={() => this.onPressCreateAccount()}>Create an account!</Button>
            <Text>{this.state.error}</Text>
          </View>
        )

  }
  // Actually render the screen.
  render() {
    return (
      <View style={styles.container}>
        {this.renderCurrentState()}
      </View>
    );
  }
}

// Stylesheet, who says this app can't be beautiful and smart?
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#E84A27',
  },
  form: {
    flex: 1
  }
});

export default Main; 
