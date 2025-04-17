# STEM Inventory Management System



## How to Use

// ... existing How to Use section ...

## Running Locally

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v18 or later recommended)
- npm or yarn
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/stem_inventory.git
cd stem_inventory
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Set Up Environment Variables
1. Create a `.env` file in the root directory
2. Add the following environment variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Step 4: Set Up Firebase
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Update the security rules to allow read/write access
5. Copy your Firebase configuration values to the `.env` file

### Step 5: Set Up Clerk
1. Create a new Clerk project at [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Configure your authentication methods
3. Copy your Clerk keys to the `.env` file

### Step 6: Start the Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at:
- Local: [http://localhost:3000](http://localhost:3000)

### Step 7: Build for Production
```bash
npm run build
# or
yarn build
```

### Step 8: Start Production Server
```bash
npm run start
# or
yarn start
```

### Troubleshooting

#### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in the root directory
   - Check for typos in variable names
   - Restart the development server

2. **Firebase Connection Issues**
   - Verify Firebase configuration values
   - Check internet connection
   - Ensure Firebase project is properly set up

3. **Authentication Problems**
   - Verify Clerk configuration
   - Check browser console for errors
   - Clear browser cache and cookies

4. **Database Access Denied**
   - Check Firebase security rules
   - Verify user authentication status
   - Ensure proper permissions are set

### Development Tips

1. **Hot Reloading**
   - The development server supports hot reloading
   - Changes to components will automatically update
   - No need to restart the server for most changes

2. **Debugging**
   - Use browser developer tools
   - Check server logs in terminal
   - Use `console.log()` for debugging

3. **Testing**
   - Run `npm run lint` to check code quality
   - Test all authentication flows
   - Verify database operations
