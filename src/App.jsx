// src/App.jsx
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./Login";
import ChatRoom from "./ChatRoom";
import './App.css';


const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {user ? <ChatRoom /> : <Login />}
    </div>
  );
};

export default App;
