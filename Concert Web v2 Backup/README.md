# Allied - Event & Musician Collaboration Platform

Allied is a modern web application that connects event managers with talented musicians, streamlining the process of finding and booking talent for events.

## Features

### For Musicians
- **Profile Management**: Create detailed profiles with bio, genres, instruments, and portfolio links
- **GitHub-Style Availability Calendar**: Visual calendar showing availability, bookings, and blocked dates
- **Event Discovery**: Browse and search for performance opportunities
- **Application System**: Apply to events with one click
- **Real-time Messaging**: Communicate directly with event organizers
- **Application Tracking**: Monitor the status of all applications

### For Event Managers
- **Event Creation**: Post detailed event listings with requirements and compensation
- **Musician Discovery**: Browse musician profiles and availability calendars
- **Application Management**: Review, accept, or decline musician applications
- **Real-time Communication**: Message with potential performers
- **Event Analytics**: Track applications and manage event status

### Core Features
- **Dual User Roles**: Separate interfaces for musicians and event managers
- **Real-time Updates**: Live notifications and messaging
- **Advanced Search**: Filter events by genre, location, date, and instrument
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Theme**: Modern, professional dark UI design

## Tech Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context API
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Concert Web v2"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage
   - Copy your Firebase configuration

4. **Configure Firebase**
   - Open `src/config/firebase.js`
   - Replace the placeholder config with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   }
   ```

5. **Firestore Security Rules**
   Go to your Firebase Console → Firestore Database → Rules and replace the default rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection - users can read/write their own profile, read others
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Events collection - authenticated users can read, creators can write
       match /events/{eventId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update: if request.auth != null && request.auth.uid == resource.data.createdBy;
         allow delete: if request.auth != null && request.auth.uid == resource.data.createdBy;
       }
       
       // Applications collection - musicians and event managers can access their applications
       match /applications/{applicationId} {
         allow read: if request.auth != null && 
           (request.auth.uid == resource.data.musicianId || 
            request.auth.uid == resource.data.eventManagerId);
         allow create: if request.auth != null && request.auth.uid == request.resource.data.musicianId;
         allow update: if request.auth != null && 
           (request.auth.uid == resource.data.musicianId || 
            request.auth.uid == resource.data.eventManagerId);
       }
       
       // Conversations collection - participants can read/write
       match /conversations/{conversationId} {
         allow read, write: if request.auth != null && 
           request.auth.uid in resource.data.participants;
         allow create: if request.auth != null;
         
         // Messages subcollection
         match /messages/{messageId} {
           allow read, write: if request.auth != null;
           allow create: if request.auth != null;
         }
       }
       
       // Temporary rule for development - REMOVE IN PRODUCTION
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   
   **Important**: The last rule allows all authenticated users full access for development purposes. Remove this rule in production and use only the specific rules above.

## Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx
│   ├── calendar/
│   │   └── AvailabilityCalendar.jsx
│   └── layout/
│       └── Navbar.jsx
├── config/
│   └── firebase.js
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── CreateEvent.jsx
│   ├── Dashboard.jsx
│   ├── EventDetails.jsx
│   ├── Events.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Messages.jsx
│   ├── Profile.jsx
│   └── Register.jsx
├── App.jsx
├── index.css
└── main.jsx
```

## Key Components

### Authentication System
- Role-based registration (Musician/Event Manager)
- Firebase Authentication integration
- Protected routes and user context

### Availability Calendar
- GitHub-style contribution calendar
- Interactive date selection
- Real-time availability updates
- Visual status indicators (available/booked/blocked)

### Event Management
- Comprehensive event creation form
- Multi-role musician requirements
- Application tracking and management
- Real-time updates

### Messaging System
- Real-time chat between users
- Conversation management
- Message history and timestamps

## Usage

### For Musicians
1. **Sign Up**: Create an account and select "Musician" role
2. **Complete Profile**: Add bio, genres, instruments, and portfolio links
3. **Set Availability**: Use the calendar to mark available/blocked dates
4. **Browse Events**: Search and filter events by your preferences
5. **Apply**: Submit applications to interesting events
6. **Communicate**: Message event organizers directly

### For Event Managers
1. **Sign Up**: Create an account and select "Event Manager" role
2. **Create Events**: Post detailed event listings with requirements
3. **Review Applications**: Browse musician profiles and availability
4. **Select Musicians**: Accept applications and coordinate details
5. **Communicate**: Message with selected performers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.

---

**Allied** - Connecting talent with opportunity, one event at a time.
