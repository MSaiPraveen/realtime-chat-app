// ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Picker from 'emoji-picker-react'; // ✅ import emoji picker

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [showPicker, setShowPicker] = useState(false); // ✅ emoji picker toggle

  const scrollRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await addDoc(collection(db, 'messages'), {
      text: input,
      uid: user.uid,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    });

    setInput('');
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onEmojiClick = (emojiData) => {
    setInput(prev => prev + emojiData.emoji); // ✅ append emoji to message input
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`message ${msg.uid === user?.uid ? 'sent' : 'received'}`}
          >
            <img src={msg.photoURL} alt="user" />
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </div>

      <form onSubmit={sendMessage} className="send-message-form">
        {/* ✅ Toggle emoji picker */}
        <button
          type="button"
          onClick={() => setShowPicker(val => !val)}
          className="emoji-toggle"
        >
          😊
        </button>

        {/* ✅ Show emoji picker */}
        {showPicker && (
          <div className="emoji-picker">
            <Picker onEmojiClick={onEmojiClick} />
          </div>
        )}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;
