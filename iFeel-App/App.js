// Import the screens
import Main from './screens/Main';
import Chat from './screens/Chat';
import CreateAccount from './screens/CreateAccount';
import Groups from './screens/Groups';
import CreateChat from './screens/CreateChat';
import EditChat from './screens/EditChat';
// Import React Navigation
import { createStackNavigator, createAppContainer } from 'react-navigation';
// To hide yellow box warning.
import {YellowBox} from 'react-native'

// To hide the big Expo warning about timers. Firebase listener stuff
// likes them, but react-native does not. There is currently an issue
// open in React-Native to fix this.
YellowBox.ignoreWarnings([
    'Setting a timer'
]);

// Create the navigator
const navigator = createStackNavigator({
    Main: { screen: Main },
    Chat: { screen: Chat },
    CreateAccount: { screen: CreateAccount },
    Groups: { screen: Groups },
    CreateChat: { screen: CreateChat },
    EditChat: { screen: EditChat },
});
const App = createAppContainer(navigator)

// Export it as the root component
export default App
