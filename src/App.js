import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyDb5fKq44bvgilCPf-9CwhFonqIUi2P3E4",
  authDomain: "superchat-78e0c.firebaseapp.com",
  projectId: "superchat-78e0c",
  storageBucket: "superchat-78e0c.appspot.com",
  messagingSenderId: "136369883363",
  appId: "1:136369883363:web:2611d923b5a22cc5481dd6",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  //if signed in = the hook returns an object that has an user-id, email etc
  //if signed out = user is null

  return (
    <div className="App">
      <header className="header">
        <h1>Tjatten</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      //if we have a user, we return a button with sign out
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  //we reference a firestore collection called "messages"
  const query = messagesRef.orderBy("createdAt").limit(25);
  //query documents in a collection and order them

  const [messages] = useCollectionData(query, { idField: "id" });
  //listens to data with the hook. it returns a array of object, where each object is a chat message in the database
  //it reacts to changes in realtime
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    //prevent the page from refreshing when forms are submitted

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      //creates/writes a new document in firestore
      //it takes a JS-object as argument (with the values that i want to write to the database below)
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        {/* we loop over our messages array
        for each message, we'll use a dedicated chatmessage component with key prop=msgId and passes document data as message prop */}
        <div ref={dummy}></div>
        {/* this will scroll messages into view/to the bottom */}
      </main>

      {/* sendMessage = write value to firestore database */}
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        {/* bind state to the form input */}

        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  //we show the text by accessing it from the props.message

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  //we compare the uid with the current user, to see if it was sent or received

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
