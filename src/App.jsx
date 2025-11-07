import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./Login";
import ChatRoom from "./ChatRoom";

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-semibold">Loading ChatHub...</p>
        </div>
      </div>
    );
  }

  return user ? <ChatRoom /> : <Login />;
};

export default App;
