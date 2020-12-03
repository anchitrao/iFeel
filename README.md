# iFeel

<img alt="Logo" src="screenshots/icon.png" width="128" height="128" />

The culmination of technical progress — four billion years of evolution have at last culminated in a social media app capable of providing you with the truly vacuous social interaction and validation that you have been waiting for.

## What is iFeel?

Specifically, this is a group messaging app that allows people to interact with others using a limited subset of emotions and feign caring about others' emotions with a bot. This is accomplished by limiting the user to posting only from a dropdown of preselected phrases, emojis and emotionally empathetic and supportive responses. 

## Demo

![Screen Recording](screenshots/screen_recording.gif)

## Getting Started

### Compilation and Installation


  1. Create a [Firebase](https://firebase.google.com/) account (used for backend), create a project from the Firebase console, and copy the server setup API code and company for web applications into a new file called `api.json` under iFeel-App.
  2. Clone this repository.
  3. [Install Node](https://nodejs.org/en/download/).
  4. Open a terminal in the iFeel-App directory and run `npm install`.
  5. Run `expo start`, fire up an emulator or install the Expo app on your phone
  6. Get your mind blown by this apps awesomeness!

Congrats! You can now use the iFeel app!

*Having Expo also on your phone will help you run and test your app locally. Search "Expo Client" in the App Store or Google Play Store and download the app on your phone.*

***Note:** Right now you can also play around with this app without setting up Firebase for yourself by opening the Expo app, going to Explore, and running iFeel.*

## Technologies

  * **React-Native**: React was used to develop the frontend experience for the application.
  * **GiftedChat**: A React Native library used to render elements of the chat UI such as the message bubbles.
  * **Firebase**: Firebase was used to develop and host the backend — authentication and storing message, group, and user data in its NoSQL RealTime Database.
  * **Sentiment**: a Node library that uses some basic natural language processing to assign an emotional valence ranging between -5 and 5 to text and emojis.
  * **Node & Expo**: Used to run app locally on iOS and/or Android.

## Contributors

* Anchit Rao
* Grant Garrett-Grossman

  * Anna Tan
  * Kshitij Sharma
  * Neil Reddy
  * Nirmal Prakash - *Project Manager*
