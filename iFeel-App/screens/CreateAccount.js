// Your run of the mill React-Native imports.
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as firebase from 'firebase';
// Our custom components.
import { Input } from '../components/Input';
import { Button } from '../components/Button';

class CreateAccount extends React.Component {
    // Store useful state on this screen, namely what information the
    // user entered to create their new account.
    state = {
        email: '',
        password: '',
        password2: '',
        errorMessage: null
    }

    // Header theming and title
    static navigationOptions = {
        title: 'Create Account',
        headerStyle: {
            backgroundColor: '#13294b',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    }
    // Helper function to get user UID.
    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }
    // Helper function to check if an email looks somewhat valid.
    checkEmail = (email) => {
        // Thank you https://stackoverflow.com/questions/36147276/how-to-validate-textinput-values-in-react-native
        // for the regex!
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    // Helper function to check if the two passwords match and are long
    // enough.
    checkPassword = (password, password2) => {
        return password === password2 && password.length >= 7;
    } 
    // Method run when the user hits the create account button.
    handleSignUp = () => {
        // Call helpers to check if input looks kosher.
        if (this.checkPassword(this.state.password, this.state.password2) && this.checkEmail(this.state.email)) {
            // Sends the entered information to Firebase to create the
            // account.
            firebase
              .auth()
              .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => firebase.database().ref('users/' + this.uid).set({
                'email': this.state.email,
            }))
            .then(() => this.props.navigation.navigate('Main'))
            // If something goes wrong, tell the user.
            .catch(() => this.setState({error: "Failed to create account"}))
        // If something is wrong, tell the user what it is.
        // Creates alert dialog pop up and puts text under button.
        } else {
            if (!this.checkEmail(this.state.email)) {
                var err = "Ruh, roh! The email entered is not valid. Please reenter a new one."
                // Popup dialog.
                Alert.alert('Account Creation Error', err)
                // Updates state and by extension text under button.
                this.setState({error: err});
            } else {
                var err = "Ruh, roh! The passwords were not identical or are too short. Please reenter them."
                Alert.alert('Account Creation Error', err)
                this.setState({error: err});
            }
        }
    }

    // Helper method to render the screen.
    // Renders our custom text inputs and button.
    renderCurrentState() {
        return (
            <View style={styles.form}>
              <Input
                placeholder='Enter your email...'
                label='Email'
                onChangeText={email => this.setState({ email })}
                value={this.state.email}
              />
              <Input
                placeholder='Enter your password. Min 7 chars...'
                label='Password'
                secureTextEntry
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
              />
              <Input
                placeholder='Please reenter your password...'
                label='Password'
                secureTextEntry
                onChangeText={password2 => this.setState({ password2 })}
                value={this.state.password2}
              />
              <Button onPress={() => this.handleSignUp()}>Create an account!</Button>
              <Text>{this.state.error}</Text>
            </View>
        )
    }

    // Actually render the screen with the given stylesheet.
    render(){
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

export default CreateAccount; 
