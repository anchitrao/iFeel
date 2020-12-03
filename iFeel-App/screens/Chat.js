// Thank you https://blog.expo.io/how-to-build-a-chat-app-with-react-native-3ef8604ebb3c
// for the tutorial on using Gifted Chat.

// Your run of the mill React-Native imports.
import React, { Component } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, View, SectionList } from 'react-native';
import * as firebase from 'firebase';
// Our custom components.
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BotButton } from '../components/BotButton';
import { TextPickerButton } from '../components/TextPickerButton';
import { OpenSliderButton } from '../components/SliderButton';
import { CloseSliderButton } from '../components/SliderButton';
import { NavBarSettingsButton } from '../components/NavBarButtons';
import { NavBarLogoutButton } from '../components/NavBarButtons';
// Component for dialog for inputs to slide up.
import SlidingUpPanel from 'rn-sliding-up-panel';
// Array of potential responses and posts. Might be a fancy schmancy Markov chain like thing for bots in the future.
import {potentialPosts} from '../Constants.js';
import {potentialResponses} from '../Constants.js';
import {botResponses} from '../Constants.js';
// Gifted-chat import. The library takes care of fun stuff like rendering message bubbles and having a message composer (that we override).
import { GiftedChat } from 'react-native-gifted-chat';
// To keep keyboard from covering up text input.
import { KeyboardAvoidingView } from 'react-native';
// Because keyboard avoiding behavior is platform specific.
import {Platform} from 'react-native';
// NLP library for sentiment analysis, also works with emojis.
const Sentiment = require('sentiment');

class Chat extends Component {
    // Header theming, title, and navbar button for creating new groups.
    // Need to give header access to functions in instance of screen with this weird, ugly fat arrow params thing, hence why the navigation prop is referred to as navigation and not this.prop.navigation.
    // Using React.Fragment as a cleaner way to return multiple elements without having to wrap in something.
    // Logout function put inline because easiest way, otherwise would need to pass function as navigator param. 
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Chat: ' + navigation.state.params.groupName,
            headerRight: (
                <React.Fragment>
                    <NavBarSettingsButton onPress={
                        () => navigation.navigate('EditChat', {
                            email: navigation.state.params.email,
                            groupID: navigation.state.params.groupID,
                            groupName: navigation.state.params.groupName
                        })
                    }></NavBarSettingsButton>
                    <NavBarLogoutButton onPress={() => {
                        firebase.auth().signOut();
                        navigation.navigate('Main');
                    }}></NavBarLogoutButton>
                </React.Fragment>
            ),
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
        this.responses = [];
        // Keep track of messages and some other things through state.
        this.state = {
            messages: [],
            isLoadingEarlier: false,
            visible: false,
            allowDragging: true,
            responses: [],
            posts: [],
        };
        this.onLoadEarlier = this.onLoadEarlier.bind(this);
        this.renderActions = this.renderActions.bind(this);
        this.renderInputToolbar = this.renderInputToolbar.bind(this);
        this.sendSelected = this.sendSelected.bind(this);
        this.renderListFooterComponent = this.renderListFooterComponent.bind(this);
        // Need to bind these in constructor, or repetitive firing of binding causes crash.
        this.onScrollBeginDrag = this.onScrollBeginDrag.bind(this);
        this.onScrollEndDrag = this.onScrollEndDrag.bind(this);
    }  

    // Reference to where in Firebase DB messages will be stored.
    get ref() {
        return firebase.database().ref('messages/' + this.props.navigation.state.params.groupID);
    }
    onLoadEarlier() {
        this.setState((previousState) => {
            return {
                isLoadingEarlier: true,
            };
        }, () => {
            //console.log(this.state.isLoadingEarlier)
            this.setState((previousState) => {
                return {
                    isLoadingEarlier: false,
                };
            });
        }); 
    }
        /*
        this.ref
          .orderByKey()
          .startAt('-LTVVuOn41zWjsZ_C_s-')
          .limitToFirst(20)
          .once("value", function(data) {
              console.log('Mes ' + data.key)
          });
          */
        /*
        this.ref
          .limitToFirst(40)
          .once("value", function(snapshot) {
              // Return whatever is associated with snapshot.
              const { timestamp: numberStamp, text, user } = snapshot.val();
              const { key: _id } = snapshot;
              // Convert timestamp to JS date object.
              const timestamp = new Date(numberStamp);
              // Create object for Gifted Chat. id is unique.
              const message = {
                  _id,
                  timestamp,
                  text,
                  user,
              };
              this.setState((previousState) => {
                  return {
                      messages: GiftedChat.prepend(previousState.messages, message),
                  };
              });
          });
        */ 
    // Get last 20 messages, any incoming messages, and send them to parse.
    on = callback =>
        this.ref
          .limitToLast(20)
          .on('child_added', snapshot => callback(this.parse(snapshot)));
    parse = snapshot => {
        // Return whatever is associated with snapshot.
        const { timestamp: numberStamp, text, user } = snapshot.val();
        const { key: _id } = snapshot;
        // Convert timestamp to JS date object.
        const timestamp = new Date(numberStamp);
        // Create object for Gifted Chat. id is unique.
        const message = {
            _id,
            timestamp,
            text,
            user,
        };
        return message;
    };
    // To unsubscribe from database
    off() {
        this.ref.off();
    }
    // Helper function to get user UID.
    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }
    // Get timestamp for saving messages.
    get timestamp() {
        return firebase.database.ServerValue.TIMESTAMP;
    }
    // Helper function that takes array of messages and prepares all of
    // them to be sent.
    send = messages => {
        for (let i = 0; i < messages.length; i++) {
            const { text, user } = messages[i];
            const message = {
                text,
                user,
                timestamp: this.timestamp,
            };
            // Now send the message to the server.
            this.append(message);
        }
    };
    botSend = messages => {
        const sentiment = new Sentiment();
        let valence = 0;
        // Find the latest message by another user, the one "we" are responding too.
        for (let i = 0; i < this.state.messages.length ; i++) {
            if (this.state.messages[i].user['_id'] !== this.user['_id']) {
                // Calculate the emotional valence of this message.
                // Some emojis have no score in the library, so hand-ranked here.
                var options = {extras: {'☺️': 5,'😯': 0.5,'🤔': -0.5,'🙁': -1,'😟': -1,'☹️': -2,'😢': -2,'🤢': -2,'⚰️': -3,'🤮': -3,'😭': -3}};
                let analysis = sentiment.analyze(this.state.messages[i].text, options);
                valence = analysis.score;
                break;
            }
        }
        // Valence is usually between -5 and 5, pick an appropriate category of response.
        let category = '';
        if (valence <= -1) {
            category = 'Negative';
        }
        else if (valence > -1 && valence < 2) {
            category = 'Neutral';
        }
        else {
            category = 'Positive';
        }
        //const { text, user } = messages[0];
        // Using this category, randomly select a message deemed suitable as a possible response by the kind of person who spends his time making this stuff instead of interacting with people.
        // As you can see, this bot exhibits cutting edge emotional intelligence so you don't have to. 
        text = botResponses[category][Math.floor(Math.random() * botResponses[category].length)];
        user = this.user;
        const message = {
            text,
            user,
            timestamp: this.timestamp,
        };
        // Now send the message to the server.
        this.append(message);
    };
    // Send message from input selection.
    sendSelected(selectedText) {
        this.setState({visible: false});
        text = selectedText;
        user = this.user;
        const message = {
            text,
            user,
            timestamp: this.timestamp,
        };
        // Now send the message to the server.
        this.append(message);
    }
    // Functino to save message objects. Actually sends them to server.
    append = message => this.ref.push(message);
        
    componentDidMount() {
        // Populate responses for user to input.
        let tempResponses = [];
        let i = 0;
        // Maintain separate id and value keys to avoid warning, since id needs to be unique (so here a simple incrementing index).
        potentialResponses.forEach(function(resp) {
            tempResponses.push({
                id: i,
                text: resp
            });
            i++;
        });
        // Populate posts too.
        let tempPosts = [];
        i = 0;
        // Maintain separate id and value keys to avoid warning, since id needs to be unique (so here a simple incrementing index).
        potentialPosts.forEach(function(p) {
            tempPosts.push({
                id: i,
                text: 'I feel ' + p // Prepend I feel before each post.
            });
            i++;
        });
        this.setState({responses: tempResponses});
        this.setState({posts: tempPosts});
        // When we open the chat, start looking for messages.
        this.on(message =>
          this.setState(previousState => ({
              messages: GiftedChat.append(previousState.messages, message),
          }))
        );
    }
    // Unsubscribe when we close the chat screen.
    componentWillUnmount() {
        this.off();
    }
    // Used to display the current user's messages on the other side of
    // the screen.
    get user() {
        // Return name and UID for GiftedChat to parse
        return {
            name: this.props.navigation.state.params.email,
            _id: this.uid,
        };
    }

    // Custom props
    // Button on left in composer
    renderActions() {
        return (
            <BotButton onPress={() => this.botSend()}></BotButton>
        );
    }
    // Replacing ordinary textinput message input.
    renderInputToolbar() {
        // Slider button calling a slide-in FlatList of potential inputs.
        return (
        <View style={styles.bottomButton}>
            <OpenSliderButton onPress={() => this.setState({visible: true})}>I feel/care...</OpenSliderButton>
        </View>
        );
    }
    // Horizontal line to divide buttons in post selector.
    renderItemSeparatorComponent() {
        return (
        <View style={styles.line} />
        );
    }
    renderListFooterComponent() {
        return (
        <View style={{ height: 0, marginBottom: 90 }}></View>
            
        );
    }
    // Callbacks for when the SectionList is scrolling to prevent the sliding-up-panel from moving during scroll.
    onScrollBeginDrag() {
        this.setState({allowDragging: false})
    }
    onScrollEndDrag() {
        this.setState({allowDragging: true})
    }
    // Show me the messages and chat UI! Updates as state updates.
    render() {
        // KeyboardAvoidingView: Platform specific hack to ensure that the keyboard does not cover the text composer.
        // Variant had button for bot botton next to Gifted Chat composer (does not work with slide-in FlatList).
        //renderActions={this.renderActions}
        // item.id.toString(): Need to cast the id to a string with keyExtractor to avoid warning.
        return (
        <View style={styles.container}>
            <GiftedChat
                loadEarlier={true}
                isLoadingEarlier={this.state.isLoadingEarlier}
                messages={this.state.messages}
                onSend={this.send}
                user={this.user}
                isAnimated={true}
                onLoadEarlier={this.onLoadEarlier}
                renderInputToolbar={this.renderInputToolbar}
                placeholder="I feel..."
            />
            <BotButton onPress={() => this.botSend()}></BotButton>
            <SlidingUpPanel
              visible={this.state.visible}
              allowDragging={this.state.allowDragging}
              onRequestClose={() => this.setState({visible: false})}>
            <View style={styles.container}>
                <View style={styles.topButton}>
                    <CloseSliderButton onPress={() => this.setState({visible: false})}>Close</CloseSliderButton>
                </View>
                <SectionList
                  renderSectionHeader={({section: {title}}) => (
                      <Text style={styles.sectionHeader}>{title}</Text>
                  )}
                  sections={[
                      {title: 'I feel', data: this.state.posts},
                      {title: 'I care', data: this.state.responses},
                  ]}
                  stickySectionHeadersEnabled={true}
                  renderItem={({item}) => <TextPickerButton onPress={() => this.sendSelected(item.text)}>{item.text}</TextPickerButton>}
                  ItemSeparatorComponent={this.renderItemSeparatorComponent}
                  ListFooterComponent={this.renderListFooterComponent}
                  keyExtractor={item => item.id.toString()}
                  onScrollEndDrag={this.onScrollEndDrag}
                  onScrollBeginDrag={this.onScrollBeginDrag}
                />
            </View>
            </SlidingUpPanel>
            <KeyboardAvoidingView behavior={
                Platform.OS === 'android' ?
                'padding' :  null
            } keyboardVerticalOffset={80}
            />
         </View>
        );
    }
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //padding: 20,
        //alignItems: 'center',
        //justifyContent: 'center',
        //flexDirection: 'row',
        backgroundColor: '#E84A27',
    },
    form: {
        flex: 1
    },
    // Make text in slide-in input look pretty.
    sectionHeader: {
        color: 'black',
        backgroundColor: '#efefef',
        fontWeight: 'bold',
        padding: 5,
        fontSize: 20,
    },
    // Needed to position button to trigger input slide-in.
    bottomButton: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    // Needed to position button to trigger input slide-in close.
    // Careful, flex: 1 would screw this up.
    topButton: {
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    line: {
        backgroundColor: '#efefef',
        alignSelf: 'center',
        height: 0.5,
        width: '100%'
    },
});
export default Chat; 
