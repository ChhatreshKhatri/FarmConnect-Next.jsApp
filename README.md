# FarmConnect - Next.js Application

A comprehensive farm management platform built with Next.js, TypeScript, and Tailwind CSS. FarmConnect simplifies livestock management for owners and suppliers with role-based access control and modern web technologies.

## Features

### 🔐 Authentication & Authorization

- JWT-based authentication with secure token storage
- Role-based access control (Owner/Supplier)
- Protected routes with middleware
- Automatic session management

### 🏗️ Core Functionality

- **Medicine Management**: Create, edit, and manage medicine inventory
- **Feed Management**: Handle feed products and inventory
- **Livestock Management**: Track and manage livestock records (Owner role)
- **Request System**: Submit and manage resource requests
- **Feedback System**: Customer feedback and supplier responses
- **Image Upload**: File upload with base64 conversion and storage

### 📸 Image Management

- Drag-and-drop file upload interface
- Automatic base64 conversion for storage
- Support for JPEG, PNG, GIF, and WebP formats
- 5MB file size limit with validation
- Preview functionality with removal option
- Responsive image display components

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom React components
- **Authentication**: JWT tokens with localStorage
- **File Handling**: Browser FileReader API for base64 conversion

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

Create a `.env.local` file in the root directory with your environment variables:

```env
# Add your environment variables here
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── owner/             # Owner role specific pages
│   ├── supplier/          # Supplier role specific pages
│   ├── login/             # Authentication pages
│   └── register/
├── components/            # Reusable React components
│   ├── ImageUpload.tsx    # File upload component
│   ├── ImageDisplay.tsx   # Image display component
│   └── Navbar.tsx         # Navigation component
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── services/              # API service layers
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
    └── imageUtils.ts      # Image handling utilities
```

## Key Features

### Image Upload System

- **File Selection**: Click or drag-and-drop interface
- **Validation**: Automatic file type and size validation
- **Preview**: Real-time image preview with edit/remove options
- **Storage**: Base64 encoding for database storage
- **Display**: Optimized rendering with fallback support

### Role-Based Navigation

- **Owner**: Access to livestock, medicine browsing, feed browsing, requests, and feedback
- **Supplier**: Access to medicine management, feed management, request handling, and feedback viewing

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript language reference
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [React Documentation](https://react.dev/) - React library documentation

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
