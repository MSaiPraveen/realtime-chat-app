import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Picker from 'emoji-picker-react';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: input,
        uid: user.uid,
        photoURL: user.photoURL || 'https://via.placeholder.com/40',
        displayName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        edited: false,
      });
      setInput('');
      setShowPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEditMessage = (msgId, msgText) => {
    setEditingId(msgId);
    setEditText(msgText);
    setShowEditModal(true);
  };

  const saveEditMessage = async () => {
    if (!editText.trim()) return;

    try {
      const msgRef = doc(db, 'messages', editingId);
      await updateDoc(msgRef, {
        text: editText,
        edited: true,
        editedAt: serverTimestamp(),
      });
      setShowEditModal(false);
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteDoc(doc(db, 'messages', msgId));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const onEmojiClick = (emojiData) => {
    setInput(prev => prev + emojiData.emoji);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/10 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                <path fillRule="evenodd" d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ChatHub</h1>
              <p className="text-white/70 text-xs">Real-time messaging</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
              <img
                src={user?.photoURL || 'https://via.placeholder.com/32'}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-white font-semibold text-sm">
                {user?.displayName?.split(' ')[0]}
              </span>
              <span className="badge">Online</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-danger flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-7xl mb-4">💬</div>
            <h3 className="text-3xl font-bold text-white mb-2">No messages yet</h3>
            <p className="text-white/70 text-lg">Start a conversation by sending your first message!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-fadeIn group ${msg.uid === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              {msg.uid !== user?.uid && (
                <img
                  src={msg.photoURL}
                  alt="avatar"
                  className="w-10 h-10 rounded-full flex-shrink-0 shadow-lg object-cover"
                />
              )}
              <div className={`flex flex-col ${msg.uid === user?.uid ? 'items-end' : 'items-start'}`}>
                <p className="text-xs text-white/70 mb-2 px-3">
                  {msg.displayName}
                </p>
                <div className={`relative ${msg.uid === user?.uid ? 'message-sent' : 'message-received'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {msg.edited && (
                    <span className="text-xs opacity-70 mt-1">(edited)</span>
                  )}

                  {/* Edit/Delete buttons - Only for own messages */}
                  {msg.uid === user?.uid && (
                    <div className="absolute -left-20 top-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditMessage(msg.id, msg.text)}
                        className="p-1 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-xs"
                        title="Edit message"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 bg-red-500 hover:bg-red-600 rounded-md text-white text-xs"
                        title="Delete message"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-2 px-3">
                  {msg.createdAt?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'just now'}
                </p>
              </div>
              {msg.uid === user?.uid && (
                <img
                  src={msg.photoURL}
                  alt="avatar"
                  className="w-10 h-10 rounded-full flex-shrink-0 shadow-lg object-cover"
                />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Edit Message</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="input-field w-full h-24 resize-none mb-4"
              placeholder="Edit your message..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingId(null);
                  setEditText('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={saveEditMessage}
                className="btn-primary flex-1"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 px-6 py-4">
        {showPicker && (
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <Picker onEmojiClick={onEmojiClick} theme="dark" />
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex gap-3 items-end">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="flex-shrink-0 p-3 bg-white/10 hover:bg-white/20 text-yellow-300 rounded-xl transition-all border border-white/20 hover:border-white/30"
            title="Add emoji"
          >
            😊
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="input-field flex-1"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-primary flex-shrink-0 p-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
