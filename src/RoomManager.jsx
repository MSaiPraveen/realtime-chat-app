import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

const RoomManager = ({ onSelectRoom, selectedRoomId }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'rooms'),
      where('members', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [user]);

  const createRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        name: newRoomName,
        description: '',
        members: [user.uid],
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        color: ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500'][
          Math.floor(Math.random() * 5)
        ],
      });
      setNewRoomName('');
      onSelectRoom(docRef.id);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteDoc(doc(db, 'rooms', roomId));
        if (selectedRoomId === roomId) {
          onSelectRoom(null);
        }
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  return (
    <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Rooms</h2>
        <form onSubmit={createRoom} className="space-y-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name..."
            className="input-field text-sm"
          />
          <button
            type="submit"
            disabled={loading || !newRoomName.trim()}
            className="btn-primary w-full text-sm py-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {rooms.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <p className="text-sm">No rooms yet</p>
            <p className="text-xs">Create one to get started!</p>
          </div>
        ) : (
          rooms.map(room => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all group ${
                selectedRoomId === room.id
                  ? 'bg-white/20 border border-white/30 shadow-lg'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate text-sm">
                    {room.name}
                  </h3>
                  <p className="text-xs text-white/50 truncate">
                    {room.description || 'No description'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRoom(room.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 bg-red-500/20 hover:bg-red-500/40 rounded text-red-300 transition-all"
                  title="Delete room"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomManager;