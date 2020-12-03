// Your run of the mill React-Native imports.
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as firebase from 'firebase';
// Our custom components.
import { Input } from '../components/Input';
import { Button } from '../components/Button';

class CreateChat extends React.Component {
    //Header theming, title, and navbar button for creating new groups.
    static navigationOptions = {
        title: 'Create Chat',
        headerStyle: {
            backgroundColor: '#13294B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    }

    // Constructor to bind state and some functions to this.
    constructor (props) {
        super (props);
        // Stores new group state, e.g. what group name, and members have
        //been entered, and the user object.
        this.state = {
            groupName: '',
            groupMembers: '',
            error: '',
        };
        this.createGroup = this.createGroup.bind(this);
    }

    // Helper function to get user UID.
    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }
    
    createGroup() {
        if (this.state.groupName.trim().length === 0) {
            Alert.alert('Warning', 'Please enter a groupname, the group has not been created.');
            this.setState({'error': 'Please enter a groupname, the group has not been created.'});
            return;
        }
        // Make sure members are not empty because of weird string splitting behavior.
        if (this.state.groupMembers.trim().length === 0) {
            Alert.alert('Warning', 'Please enter group members, the group has not been created.');
            this.setState({'error': 'Please enter group members, the group has not been created.'});
            return;
        }
        // Generate unique ID for group.
        var newPostKey = firebase.database().ref().child('groups').push().key;
        // Dictionary to store all firebase requests that will be made.
        //var updates = {};
        const groupMembersArray = this.state.groupMembers.trim().split(',');
        // Keep track of emails that do not exist.
        const nonExistent = [];
        // Loop through all of the users entered.
        for (let i = 0; i < groupMembersArray.length; i++) {
            // Get UID of user with matching email.
            // Query that searches for email and gives direct parent.
            firebase.database().ref('users')
              .orderByChild('email')
              .equalTo(groupMembersArray[i].trim())
              // Arrow functions used because need to bind function to this in order to access this.state.
              .once("value")
              .then( (snapshot) => { // Need to use value on_child_added would not run block at all if user did not exist.
                  if (snapshot.exists()) {
                      snapshot.forEach( (child) => {
                          //updates['/users/' + child.key + '/groups/' + newPostKey + '/name'] = this.state.groupName;
                          // Add group to other users' groups.
                          firebase.database().ref('/users/' + child.key + '/groups/' + newPostKey).set({'name': this.state.groupName});
                      })
                  } else {
                      nonExistent.push(groupMembersArray[i].trim() + ' ');
                  }
              })
                // Create an alert box if emails do not exist.
                // This .then is the best way I could figure out to print all nonexistent emails because of async nightmares.
                .then(() => {
                    if (nonExistent.length > 0) {
                        Alert.alert('Warning', 'User(s) ' + nonExistent + ' do(es) not exist. Existing users have been added to the group. Please recheck your spelling.');
                        this.setState({'error': 'User(s) ' + nonExistent + ' do(es) not exist. Existing users have been added to the group. Please recheck your spelling.'});
                    }
                });
        }
        // Add new group to current user's groups.
        firebase.database().ref('/users/' + this.uid + '/groups/' + newPostKey).set({'name': this.state.groupName})
        //updates['/users/' + this.uid + '/groups/' + newPostKey + '/name'] = this.state.groupName;
        // Add new group to list of groups.
        firebase.database().ref('/groups/' + newPostKey).set({'name': this.state.groupName})
        //updates['/groups/' + newPostKey + '/name'] = this.state.groupName;
        // Had to send each request manually because async issues mean that a request is occasionally missing with this method.
        //firebase.database().ref().update(updates);
        this.props.navigation.navigate('Groups');
    }

    // Helper function to render the screen.
    renderCurrentState() {
        // Render the textboxes and buttons.
        return (
          <View style={styles.form}>
            <Input
              placeholder='Enter the group name...'
              label='Group name'
              onChangeText={groupName => this.setState({ groupName })}
              value={this.state.groupName}
            />
            <Input
              placeholder='Enter new members...'
              label='Members'
              onChangeText={groupMembers => this.setState({ groupMembers })}
              value={this.state.groupMembers}
            />
            <Button onPress={() => this.createGroup()}>Create!</Button>
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
  
export default CreateChat; 
