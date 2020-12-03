// Your run of the mill React-Native imports.
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as firebase from 'firebase';
// Our custom components.
import { Input } from '../components/Input';
import { Button } from '../components/Button';

class EditChat extends React.Component {
    //Header theming, title, and navbar button for creating new groups.
    // Need to give header access to functions in instance of screen
    // with this weird, ugly fat arrow params thing, hence why the
    // navigation prop is referred to as navigation and not
    // this.prop.navigation
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Edit Chat: ' + navigation.state.params.groupName,
            headerStyle: {
                backgroundColor: '#13294B',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        };
    };

    // Constructor to bind state and some functions to this.
    constructor (props) {
        super (props);
        // Stores new group state, e.g. what group name, and members have been entered, and the user object.
        this.state = {
            addMembers: '',
            removeMembers: '',
            error: '',
        };
        this.editGroup = this.editGroup.bind(this);
    }

    // Helper function to get user UID.
    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }
    
    editGroup() {
        // First, reset errors in case this function was run before.
        this.setState({error: ''});
        // Unique ID of group to modify.
        const GroupId = this.props.navigation.state.params.groupID;
        // Group name
        const GroupName =  this.props.navigation.state.params.groupName;
        // Flag determining if we need to navigate out of this chat after action.
        let removedSelf = false;
        // Errors, so they can be concatenated if necessary at the end.
        let errors = '';
        // Keep track of emails that do not exist.
        let nonExistent = [];
        //First deal with removing group members.
        if (this.state.removeMembers.length > 0) {
            const removeMembersArray = this.state.removeMembers.trim().split(',');
            // Loop through all of the users entered.
            for (let i = 0; i < removeMembersArray.length; i++) {
                if (removeMembersArray[i] === this.props.navigation.state.params.email) {
                    removedSelf = true;
                }
                // Get UID of user with matching email.
                // Query that searches for email and gives direct parent.
                firebase.database().ref('users')
                  .orderByChild('email')
                  .equalTo(removeMembersArray[i].trim())
                  // Arrow functions used because need to bind function to this in order to access this.state.
                  .once("value")
                  .then( (snapshot) => { // Need to use value, on_child_added would not run block at all if user did not exist.
                      if (snapshot.exists()) {
                          snapshot.forEach( (child) => {
                              // Remove group to other users' groups.
                              firebase.database().ref('/users/' + child.key + '/groups/' + GroupId).set({'name': null});
                          })
                      } else {
                          nonExistent.push(removeMembersArray[i].trim() + ' ');
                      }
                  })
                  // Set errors and alert.
                  .then( () => {
                      if (nonExistent.length > 0) {
                          errors = errors + 'User(s) ' + nonExistent + ' do(es) not exist. Real users have been removed from the group. Please recheck your spelling. ';
                          Alert.alert('Warning', errors);
                          this.setState({'error': errors});
                      }
                  });
            }
        }
        // Now deal with adding group members.
        if (this.state.addMembers.length > 0) {
            const addMembersArray = this.state.addMembers.trim().split(',');
            // Loop through all of the users entered.
            for (let i = 0; i < addMembersArray.length; i++) {
                // Get UID of user with matching email.
                // Query that searches for email and gives direct parent.
                firebase.database().ref('users')
                  .orderByChild('email')
                  .equalTo(addMembersArray[i].trim())
                  // Arrow functions used because need to bind function to this in order to access this.state.
                  .once("value")
                  .then( (snapshot) => { // Need to use value on_child_added would not run block at all if user did not exist.
                      if (snapshot.exists()) {
                          snapshot.forEach( (child) => {
                              // Add group to other users' groups.
                              firebase.database().ref('/users/' + child.key + '/groups/' + GroupId).set({'name': GroupName});
                          })
                      } else {
                          nonExistent.push(addMembersArray[i].trim() + ' ');
                      }
                  })
                  // Set errors and alert.
                  .then( () => {
                      if (nonExistent.length > 0) {
                          errors = errors + 'User(s) ' + nonExistent + ' do(es) not exist. Real users have been added to the group. Please recheck your spelling. ';
                          Alert.alert('Warning', errors);
                          this.setState({'error': errors});
                      }
                  });
            }
        }
        // Remove group from list of groups.
        //firebase.database().ref('/groups/' + groupID).set({'name': null})
        // Go to groups if user removed themself.
         Alert.alert('Done!', 'Group has been modified!');
        if (removedSelf) {
            this.props.navigation.navigate('Groups');
        }
        
    }

    // Helper function to render the screen.
    renderCurrentState() {
        // Render the textboxes and buttons.
        return (
          <View style={styles.form}>
            <Input
              placeholder='Comma separated emails...'
              label='Members to add'
              onChangeText={addMembers => this.setState({ addMembers })}
              value={this.state.addMembers}
            />
            <Input
              placeholder='Comma separated emails...'
              label='Members to remove'
              onChangeText={removeMembers => this.setState({ removeMembers })}
              value={this.state.removeMembers}
            />
            <Button onPress={() => this.editGroup()}>Edit!</Button>
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
  
export default EditChat; 
 
