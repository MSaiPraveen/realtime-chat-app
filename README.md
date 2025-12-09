<h1 align="center">Realtime Chat App 🚀</h1>

<p align="center">
<a href="https://realtime-chat-app-8131a.web.app" target="_blank"><b>Live Site: realtime-chat-app-8131a.web.app</b></a>
</p>

---

## Overview

This is a modern, real-time multi-room chat application built with React, Firebase, and Tailwind CSS. Users can authenticate with Google, join or create public chat rooms, and exchange messages in real time. The app features emoji support, message editing/deletion, and a responsive, animated UI. All rooms are visible to authenticated users, but only room members can send/read messages in a room.

---

## Features

- **Google Authentication**: Secure sign-in with Google OAuth
- **Multi-Room Chat**: Create, join, leave, and delete chat rooms (all rooms are public)
- **Real-Time Messaging**: Instant message updates using Firebase Firestore
- **Emoji Picker**: Express yourself with emoji support in messages
- **Edit & Delete Messages**: Users can edit or delete their own messages
- **Room Management**: Only room creators can delete rooms; all users can join/leave any room
- **Responsive UI**: Mobile-friendly, animated with Tailwind CSS custom themes
- **Security**: Firestore rules restrict message access to room members and room deletion to creators
- **SPA Hosting**: Deployed on Firebase Hosting with proper SPA rewrites

---

## Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Realtime DB**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth (Google)](https://firebase.google.com/docs/auth)
- **Hosting**: [Firebase Hosting](https://firebase.google.com/docs/hosting)
- **State & Hooks**: [react-firebase-hooks](https://github.com/CSFrequency/react-firebase-hooks)
- **Emoji Picker**: [emoji-picker-react](https://github.com/ealush/emoji-picker-react)

---

## Project Structure

```
src/
	App.jsx           # Main app logic, auth state, room selection
	ChatRoom.jsx      # Room-specific chat, real-time messages, emoji picker
	RoomManager.jsx   # List/create/join/leave/delete rooms
	Login.jsx         # Google OAuth login UI
	firebase.jsx      # Firebase config & initialization
	App.css, index.css# Tailwind and custom styles
public/
	...               # Static assets
firebase.json       # Firebase Hosting config (SPA rewrites)
firestore.rules     # Firestore security rules
tailwind.config.js  # Tailwind theme customization
vite.config.js      # Vite config
```

---

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/MSaiPraveen/realtime-chat-app.git
cd realtime-chat-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
- Enable **Authentication** (Google sign-in)
- Create a **Firestore Database** (in test mode for dev, secure for prod)
- Add a **Web App** and copy your Firebase config
- Create a `.env.local` file in the root:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally

```bash
npm run dev
```
App will be available at [http://localhost:5173](http://localhost:5173)

### 5. Deploy

- Install Firebase CLI: `npm install -g firebase-tools`
- Login: `firebase login`
- Deploy: `firebase deploy`

---

## Firestore Security Rules (Summary)

- All authenticated users can view all rooms
- Only room members can read/send messages in a room
- Only message authors can edit/delete their messages
- Only room creators can delete rooms

See `firestore.rules` for details.

---

## Customization

- **Theming**: Edit `tailwind.config.js` for custom colors/animations
- **SPA Hosting**: `firebase.json` is set up for single-page app routing

---

## Credits

- Built by [MSaiPraveen](https://github.com/MSaiPraveen)
- Powered by React, Firebase, and Tailwind CSS

---

## License

This project is licensed under the MIT License.

---

<p align="center">
<a href="https://realtime-chat-app-8131a.web.app" target="_blank"><b>🌐 Visit Live Site</b></a>
</p>
