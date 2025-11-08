import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
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

  // Subscribe to ALL rooms (not filtered by user)
  useEffect(() => {
    if (!user) return;

    // Get ALL rooms in the system
    const q = query(collection(db, 'rooms'));

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
        members: [user.uid], // Start with creator as member
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        isPublic: true,
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

  // Join room (add user to members array)
  const joinRoom = async (roomId) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
      });
      onSelectRoom(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  // Leave room (remove user from members array)
  const leaveRoom = async (roomId) => {
    if (window.confirm('Leave this room?')) {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          members: arrayRemove(user.uid),
        });
        if (selectedRoomId === roomId) {
          onSelectRoom(null);
        }
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
  };

  // Check if user is member of a room
  const isMember = (room) => {
    return room.members && room.members.includes(user?.uid);
  };

  // Check if user is creator
  const isCreator = (room) => {
    return room.createdBy === user?.uid;
  };

  return (
    <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Chat Rooms</h2>
        <form onSubmit={createRoom} className="space-y-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Create new room..."
            className="input-field text-sm"
          />
          <button
            type="submit"
            disabled={loading || !newRoomName.trim()}
            className="btn-primary w-full text-sm py-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : '➕ Create'}
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
          rooms.map(room => {
            const userIsMember = isMember(room);
            const userIsCreator = isCreator(room);

            return (
              <div
                key={room.id}
                className={`p-3 rounded-lg transition-all group ${
                  selectedRoomId === room.id
                    ? 'bg-white/20 border border-white/30 shadow-lg'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                } ${!userIsMember ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      if (userIsMember) {
                        onSelectRoom(room.id);
                      }
                    }}
                  >
                    <h3 className="font-semibold text-white truncate text-sm">
                      {room.name}
                    </h3>
                    <p className="text-xs text-white/50">
                      {room.members?.length || 0} members
                      {userIsCreator && ' • 🔑 You created this'}
                      {userIsMember && !userIsCreator && ' • ✓ Member'}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-1">
                    {userIsMember ? (
                      <>
                        {!userIsCreator && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              leaveRoom(room.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 bg-orange-500/20 hover:bg-orange-500/40 rounded text-orange-300 transition-all"
                            title="Leave room"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </button>
                        )}
                        {userIsCreator && (
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
                        )}
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          joinRoom(room.id);
                        }}
                        className="px-2 py-1 bg-green-500/30 hover:bg-green-500/50 rounded text-green-300 text-xs transition-all font-semibold"
                        title="Join room"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoomManager;