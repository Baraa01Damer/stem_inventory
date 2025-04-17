# STEM Inventory Management System

A modern web application built with Next.js for managing STEM (Science, Technology, Engineering, and Mathematics) inventory. This application provides a user-friendly interface for tracking and managing educational resources and equipment.

## Features

- 🔐 Secure authentication using Clerk
- 📱 Responsive design with Material-UI
- 🔥 Real-time data management with Firebase
- 📊 Inventory tracking and management
- 👥 User role management
- 🎨 Modern and intuitive UI

## Tech Stack

- **Frontend Framework:** Next.js 15.2.5
- **UI Library:** Material-UI (@mui/material)
- **Authentication:** Clerk (@clerk/nextjs)
- **Database:** Firebase
- **Styling:** Emotion (@emotion/react, @emotion/styled)
- **Linting:** ESLint

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- Firebase account
- Clerk account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stem_inventory.git
cd stem_inventory
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
stem_inventory/
├── app/                  # Next.js app directory
│   ├── components/       # Reusable components
│   ├── page.js          # Main page component
│   ├── layout.js        # Root layout
│   └── providers.js     # Context providers
├── public/              # Static assets
├── firebase.js          # Firebase configuration
├── middleware.ts        # Next.js middleware
└── package.json         # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- Next.js team for the amazing framework
- Material-UI for the beautiful components
- Clerk for the authentication solution
- Firebase for the backend services
