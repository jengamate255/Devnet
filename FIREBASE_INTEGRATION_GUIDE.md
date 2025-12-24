# Firebase Integration Guide for Devnet

## Overview

Firebase has been integrated into Devnet to provide:
- ☁️ **Cloud Storage** (Firestore) - Replace localStorage
- 🔐 **Authentication** (Firebase Auth) - User management
- 📊 **Real-time Sync** - Live updates across devices
- 📈 **Analytics** - Usage tracking
- 💾 **Backup & Recovery** - Automatic data backup

## Setup Complete ✅

Your Firebase project is configured and ready:
- **Project ID**: devnet-fc606
- **Auth Domain**: devnet-fc606.firebaseapp.com
- **Storage**: devnet-fc606.firebasestorage.app

## Files Created

```
src/firebase/
├── config.js          # Firebase initialization
├── devnetService.js   # Firestore data operations
└── authService.js     # Authentication service
```

## Firebase Services

### 1. Firestore Database Structure

```
users/
  └── {userId}/
      ├── routerConfig/
      │   └── current        # Router configuration
      ├── users/
      │   ├── {userId1}      # Hotspot user 1
      │   ├── {userId2}      # Hotspot user 2
      │   └── ...
      ├── vouchers/
      │   ├── {voucherId1}   # Voucher 1
      │   └── ...
      ├── traffic/
      │   └── current        # Traffic data
      ├── blockedUsers/
      │   └── current        # Blocked users list
      ├── portalConfig/
      │   └── current        # Portal settings
      └── historicalData/
          └── current        # Historical data
```

### 2. Authentication

Firebase Authentication provides:
- Email/Password sign-in
- Password reset
- User profiles
- Session management

## Integration Steps

### Step 1: Replace localStorage with Firebase

**Before (localStorage):**
```javascript
const saveData = () => {
  localStorage.setItem('devnet-users', JSON.stringify(users));
};

const loadData = () => {
  const data =局storedLocalStorage.getItem('devnet-users');
  return JSON.parse(data);
};
```

**After (Firebase):**
```javascript
import firebaseService from './firebase/devnetService';

const saveData = async () => {
  await firebaseService.saveUsers(users);
};

const loadData = async () => {
  const result = await firebaseService.loadUsers();
  return result.data;
};
```

### Step 2: Add Authentication

```javascript
import authService from './firebase/authService';

// Sign in
const handleSignIn = async (email, password) => {
  const result = await authService.signIn(email, password);
  if (result.success) {
    console.log('User signed in:', result.user);
  } else {
    console.error('Error:', result.error);
  }
};

// Sign up
const handleSignUp = async (email, password, displayName) => {
  const result = await authService.signUp(email, password, displayName);
  if (result.success) {
    console.log('Account created:', result.user);
  }
};

// Sign out
const handleSignOut = async () => {
  await authService.signOut();
};
```

### Step 3: Real-time Updates

```javascript
import firebaseService from './firebase/devnetService';

// Subscribe to users changes
useEffect(() => {
  const unsubscribe = firebaseService.subscribeToUsers((updatedUsers) => {
    setUsers(updatedUsers);
  });

  return () => unsubscribe(); // Cleanup
}, []);

// Subscribe to router config changes
useEffect(() => {
  const unsubscribe = firebaseService.subscribeToRouterConfig((config) => {
    setRouterConfig(config);
  });

  return () => unsubscribe();
}, []);
```

### Step 4: Update MikroTikManager.jsx

**Find the saveData function and replace with:**

```javascript
const saveData = async () => {
  try {
    const result = await firebaseService.saveAll({
      routerConfig,
      users,
      vouchers,
      trafficData,
      blockedUsers,
      portalConfig
    });

    if (!result.success) {
      // Fallback to localStorage
      const dataToSave = {
        routerConfig,
        users,
        vouchers,
        trafficData,
        blockedUsers,
        portalConfig
      };
      
      for (const [key, value] of Object.entries(dataToSave)) {
        localStorage.setItem(`devnet-${key}`, JSON.stringify(value));
      }
      
      addNotification('warning', 'Saved locally (offline mode)');
    }
  } catch (error) {
    console.error('Failed to save data:', error);
    addNotification('error', 'Failed to save data');
  }
};
```

**Find the loadData function and replace with:**

```javascript
const loadData = async () => {
  try {
    const result = await firebaseService.loadAll();
    
    if (result.success && result.data) {
      const { routerConfig: rc, users: u, vouchers: v, trafficData: td, portalConfig: pc } = result.data;
      
      if (rc) setRouterConfig(rc);
      if (u) setUsers(u);
      if (v) setVouchers(v);
      if (td) setTrafficData(td);
      if (pc) setPortalConfig(pc);
      
      addNotification('success', 'Data loaded from cloud');
      return;
    }
    
    // Fallback to localStorage if Firebase fails
    loadFromLocalStorage();
  } catch (error) {
    console.log('Firebase unavailable, using local storage');
    loadFromLocalStorage();
  }
};

const loadFromLocalStorage = () => {
  // Existing localStorage logic
  const configData = localStorage.getItem('devnet-router-config');
  if (configData) setRouterConfig(JSON.parse(configData));
  // ... etc
};
```

## Firestore Security Rules

Add these rules to your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin access (optional)
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## Usage Examples

### Save Router Configuration
```javascript
await firebaseService.saveRouterConfig({
  host: '192.168.88.1',
  username: 'admin',
  password: 'password',
  port: 8729,
  connected: true
});
```

### Load Users
```javascript
const result = await firebaseService.loadUsers();
if (result.success) {
  setUsers(result.data);
}
```

### Add User
```javascript
await firebaseService.saveUser({
  id: Date.now().toString(),
  name: 'John Doe',
  mac: '00:11:22:33:44:55',
  enabled: true
});
```

### Batch Save
```javascript
await firebaseService.saveAll({
  routerConfig,
  users,
  vouchers,
  trafficData,
  portalConfig
});
```

## Authentication UI (Optional)

Create a simple login component:

```javascript
import { useState } from 'react';
import authService from './firebase/authService';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await authService.signIn(email, password);
    if (result.success) {
      // Redirect to dashboard
    } else {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

## Benefits

### Before (localStorage)
- ❌ Data lost if browser cleared
- ❌ No sync across devices
- ❌ No backup
- ❌ No multi-user support
- ❌ Limited storage (10MB)

### After (Firebase)
- ✅ Cloud backup (automatic)
- ✅ Real-time sync
- ✅ Multi-device access
- ✅ User authentication
- ✅ Unlimited storage
- ✅ Analytics & monitoring

## Migration Strategy

### Phase 1: Hybrid Mode (Recommended)
- ✅ Use Firebase for new data
- ✅ Keep localStorage as fallback
- ✅ Gradual migration

### Phase 2: Firebase-First
- ✅ Primary: Firebase
- ✅ Fallback: localStorage (offline)

### Phase 3: Cloud-Only
- ✅ Remove localStorage dependency
- ✅ Full Firebase integration

## Testing

### 1. Sign Up
```bash
# Create test account
Email: test@example.com
Password: test123456
```

### 2. Save Data
```javascript
await firebaseService.saveUsers([
  { id: '1', name: 'Test User', mac: '00:11:22:33:44:55' }
]);
```

### 3. Load Data
```javascript
const result = await firebaseService.loadUsers();
console.log(result.data);
```

### 4. Real-time Test
- Open app in two browsers
- Make changes in one
- See updates in the other instantly

## Firestore Console

Access your database:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **devnet-fc606**
3. Click "Firestore Database"
4. View/edit data in real-time

## Troubleshooting

### Error: Permission Denied
**Solution**: Update Firestore rules to allow access

### Error: Auth Required
**Solution**: Sign in before accessing data

### Data Not Syncing
**Solution**: Check internet connection and Firestore rules

### Slow Performance
**Solution**: Use indexing for queries

## Next Steps

1. ✅ **Enable Authentication** (optional)
   - Add sign-in UI
   - Protect routes

2. ✅ **Add Offline Support**
   - Enable Firestore offline persistence
   - Queue operations when offline

3. ✅ **Implement Real-time Sync**
   - Subscribe to data changes
   - Update UI automatically

4. ✅ **Add Analytics**
   - Track user actions
   - Monitor app usage

## Firebase CLI Commands

```bash
# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy functions (if using)
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting
```

## Security Best Practices

1. ✅ **Never expose API keys in public repos**
2. ✅ **Use environment variables** for sensitive data
3. ✅ **Set proper Firestore rules**
4. ✅ **Enable App Check** (optional, recommended)
5. ✅ **Monitor usage** in Firebase Console

## Cost Estimation

Firebase Free Tier (Spark Plan):
- Firestore: 1GB storage, 50K reads/day
- Auth: Unlimited users
- Analytics: Unlimited events

**For Devnet**: Free tier is MORE than enough!

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guides](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)

---

**Your Firebase integration is ready to use!** 🎉

All services are configured and waiting for you to integrate them into your app.
