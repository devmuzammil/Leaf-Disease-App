# Leaf Disease App - Charsada & Chitral

**Region-Specific Application for Charsada and Chitral Districts (Khyber Pakhtunkhwa, Pakistan)**

A full-stack leaf leaf disease detection application designed specifically for farmers in Charsada and Chitral. Built with Expo React Native mobile frontend and Express backend, the app helps farmers identify crop diseases using leaf images and provides localized treatment recommendations.

## Regional Scope

**This application is specifically designed for farmers in Charsada and Chitral districts of Khyber Pakhtunkhwa, Pakistan.** The app provides crop disease detection and treatment recommendations tailored to the agricultural context of these regions.

## Overview

The app detects diseases from leaf images using AI-powered machine learning, shows confidence scores, and displays disease-specific treatment recommendations in local languages. Key capabilities:

- Real-time leaf disease prediction using deployed HuggingFace machine learning models
- Automatic leaf image validation (confirms image is a leaf, rejects other objects)
- Express backend gateway for API routing, logging, authentication, and prediction history
- User authentication with JWT tokens
- Email-based password reset with secure OTP verification via Resend API
- Multi-language support (English, Urdu, and Pashto) for accessibility
- Text-to-speech functionality for disease recommendations
- Prediction history with persistent MongoDB storage
- Device tracking for both registered users and anonymous farmers
- Offline support using device storage
- Optimized image handling and caching

## Supported Crops & Diseases

The app currently supports detection for the following crops and their common diseases:

### Apple
- Brown Spot, Black Spot, Scab, Black Rot, Cedar Apple Rust, Healthy

### Cherry
- Leaf Scorch, Brown Spot, Purple Leaf Spot, Shot Hole, Powdery Mildew, Healthy

### Grape
- Anthracnose, Brown Spot, Downy Mildew, Mites, and more, Healthy

### Tomato
- Fusarium Wilt, Verticillium Wilt, Leaf Curl, Leaf Miner, Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Healthy

Each disease includes severity level (low/medium/high), description, and treatment recommendations.

## Project Structure

```
leaf-disease-app/
├── backend/ – TypeScript Express backend
│   ├── src/
│   │   ├── app.ts – Express app configuration
│   │   ├── config/ – Database and environment configuration
│   │   ├── controllers/ – Request handlers
│   │   ├── middleware/ – Authentication, validation, image optimization
│   │   ├── models/ – MongoDB schemas (User, Prediction, PasswordReset)
│   │   ├── routes/ – API route definitions
│   │   ├── schemas/ – Zod validation schemas
│   │   ├── services/ – Business logic (ML, email, task queue)
│   │   ├── types/ – TypeScript type definitions
│   │   └── utils/ – JWT, logging utilities
│   └── uploads/ – Stored leaf images
├── mobile/ – Expo React Native application
│   ├── src/
│   │   ├── components/ – UI components
│   │   ├── screens/ – App screens (Auth, Detect, History, Profile, etc.)
│   │   ├── services/ – API communication, authentication
│   │   ├── store/ – Redux state management
│   │   ├── config/ – API and backend configuration
│   │   ├── hooks/ – Custom React hooks
│   │   ├── i18n/ – Multilingual translations (English, Urdu, Pashto)
│   │   ├── constants/ – Disease recommendations and localized data
│   │   ├── navigation/ – App navigation setup
│   │   ├── types/ – TypeScript type definitions
│   │   └── utils/ – Helper functions for disease formatting, TTS, fonts
│   └── assets/ – Images and static files
```

## Features

### Mobile App

- **Image Capture & Upload** – Capture from camera or select from gallery
- **AI-Powered Disease Detection** – Real-time leaf disease prediction with confidence scores
- **Treatment Recommendations** – Disease-specific, actionable treatment advice for farmers
- **Multi-Language Support** – English, Urdu, and Pashto translations
- **Text-to-Speech** – Hear disease recommendations and treatment advice in local languages
- **Prediction History** – View past predictions with timestamp and image data
- **User Authentication** – Secure registration, login, and password management
- **Profile Management** – Update user profile information and preferences
- **Offline Support** – Store and access predictions without internet connectivity
- **Responsive UI** – Optimized for different screen sizes and devices

### Backend

- **ML Service Integration** – Proxies predictions to HuggingFace or other model providers
- **Leaf Validation** – Automatically rejects non-leaf images to ensure accurate predictions
- **Image Optimization** – Compresses and resizes images (max 800x800, 80% quality) for efficient processing
- **User Authentication** – JWT-based authentication with email/password
- **Prediction History** – CRUD operations for storing and retrieving prediction records
- **Password Reset** – Secure email-based password reset with OTP verification
- **Request Validation** – Zod schemas ensure data integrity
- **Comprehensive Logging** – Request/response logging for monitoring and debugging
- **Health Check Endpoint** – Service availability monitoring
- **Background Task Processing** – Optional async task queue for non-blocking operations
- **Device Tracking** – Supports both registered users and anonymous device-based tracking

## Architecture

### Application Flow

```
Mobile App (React Native + Expo)
    ↓
    Capture/Upload Leaf Image
    ↓
    Express Backend (TypeScript)
    – Image Optimization & Validation
    – Leaf Detection Check
    ↓
    HuggingFace ML Model
    – Disease Prediction
    – Confidence Score
    ↓
    Backend Stores in MongoDB
    – Prediction History
    – User Profile Data
    ↓
    Response to Mobile
    – Disease Name (translated to Urdu/Pashto)
    – Confidence Score
    – Localized Treatment Recommendations
    – Text-to-Speech Audio
```

### Key Processing Steps

1. **Image Capture**: User captures or uploads leaf image from camera/gallery
2. **Upload to Backend**: Image sent to Express backend with authentication
3. **Image Optimization**: Sharp library compresses and resizes image
4. **Leaf Validation**: Backend validates image is a leaf using ML model
5. **Disease Detection**: HuggingFace model predicts disease with confidence score
6. **Data Storage**: Prediction stored in MongoDB with user/device tracking
7. **Treatment Resolution**: Backend returns localized recommendations
8. **Mobile Display**: Results shown with TTS option in user's preferred language

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for backend)
- Expo CLI (for mobile development)
- HuggingFace API key (for ML model access)

### Mobile Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Expo development server:
   ```bash
   npx expo start
   ```

4. Open in Expo Go app or emulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go on physical device

### Mobile Environment Variables

Create a `.env` file in the mobile directory:
```bash
BACKEND_URL=http://your-backend-url
```

For local development, the app automatically detects the Expo host. You can override with `expo.extra.apiBaseUrl` in `app.json` if needed.

### Important Notes

- The app requires **internet access** for prediction requests
- **Authentication and history** require the Express backend to be running
- App uses **device storage** for offline prediction caching
- **Text-to-Speech** requires device language support for Urdu/Pashto

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```bash
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=debug
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:8081
   
   # Database
   MONGODB_URI=mongodb://127.0.0.1:27017/leaf_disease_app
   
   # ML Model Service
   HF_SERVICE_URL=https://a-rehman-12-leafdiseasedetection.hf.space/predict
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   MODEL_PROVIDER=huggingface
   
   # File Upload
   MAX_FILE_SIZE_MB=5
   ALLOWED_MIME_TYPES=image/jpeg,image/png,image/jpg
   
   # JWT Authentication
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRY=7d
   
- **Email Service (Resend API for password reset)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@leafdiseaseapp.com
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3000`

## Backend API Endpoints

### Prediction routes

- `GET /api/health` — health status
- `POST /api/predict` — image prediction
- `GET /api/predictions` — get prediction history
- `DELETE /api/predictions` — clear user history
- `DELETE /api/predictions/:id` — delete a single history item

### Auth routes

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-reset-code`
- `POST /api/auth/reset-password`

## Important Features & Behavior

### Leaf Validation

- Before prediction, uploaded images are validated using the HuggingFace leaf detection model
- Non-leaf images (e.g., random photos) are automatically rejected
- Invalid images receive a clear error message guiding users to upload actual leaf photos

### Prediction Logic

- Mobile app sends images as `image` field in `multipart/form-data`
- Backend optimizes images before sending to ML model
- Predictions are matched against disease recommendation maps in `mobile/src/constants/diseaseRecommendations.ts`
- Each prediction includes:
  - Disease name (translated to Urdu/Pashto)
  - Confidence score (0-100)
  - Disease severity (low/medium/high)
  - 3-4 treatment recommendations tailored to local farming practices

### History & Storage

- Prediction history is stored in MongoDB with user/device tracking
- Anonymous users can save predictions to device storage (offline)
- Registered users have cloud-synced history accessible from any device
- Each history record includes:
  - Original leaf image
  - Disease detected
  - Confidence score
  - Timestamp
  - User/device identification

### Multilingual & Accessibility

- **Supported Languages**: English, Urdu (ur-PK), Pashto (ps-AF)
- **Language Switching**: Users can change language from preferences
- **Text-to-Speech**: All disease recommendations available in local languages
- **Translation**: UI, disease names, and recommendations fully translated
- **Language Persistence**: Selected language preference saved in device storage

## Technology Stack

### Frontend (Mobile)

- **React Native** with Expo for cross-platform iOS/Android
- **Redux Toolkit** for state management
- **React Navigation** for screen navigation
- **Axios** for API communication
- **AsyncStorage** for local data persistence
- **Expo Image Picker** for camera/gallery access
- **Expo Speech** for text-to-speech functionality
- **NetInfo** for network connectivity detection
- **i18n** for multilingual support
- **TypeScript** for type safety

### Backend (Server)

- **Express.js** as web framework
- **TypeScript** for type-safe backend code
- **MongoDB** with Mongoose for data persistence
- **JWT** for authentication tokens
- **Multer** for file upload handling
- **Sharp** for image optimization and compression
- **Resend API** for email notifications
- **Bull** for background task queue processing
- **Helmet** for security headers
- **CORS** for cross-origin resource sharing
- **Morgan** for HTTP request logging
- **Zod** for request validation schemas
- **Resend** for email service integration
- **dotenv** for environment configuration

### Machine Learning

- **HuggingFace** hosted ML model for disease detection and leaf validation
- **Image preprocessing** in backend before model inference

## Troubleshooting

### Common Issues

**Mobile app cannot connect to backend:**
- Ensure backend is running on the same network
- For local development, use the LAN IP of your machine instead of `localhost`
- Configure `expo.extra.apiBaseUrl` in `app.json` with the correct backend URL

**Predictions not working:**
- Verify HuggingFace API key is correctly set in backend `.env`
- Check that the model URL is accessible: `https://a-rehman-12-leafdiseasedetection.hf.space/predict`
- Ensure uploaded images are in JPEG or PNG format and under 5MB

**Image optimization issues:**
- Verify Sharp is properly installed: `npm install sharp`
- Check that image files are not corrupted

**Authentication fails:**
- Verify JWT_SECRET is set in backend `.env`
- Check MongoDB connection string
- Ensure backend is running on the correct PORT

### Database Reset

To reset the database during development:
```bash
cd backend
mongosh # or mongo
use leaf_disease_app
db.dropDatabase()
```

## Development Commands

### Mobile Development

```bash
cd mobile
npm install          # Install dependencies
npm start           # Start Expo development server
npm run test        # Run tests (if configured)
npm run build       # Build for production
```

### Backend Development

```bash
cd backend
npm install          # Install dependencies
npm run dev         # Start development server with hot reload
npm run build       # Build TypeScript to JavaScript
npm start           # Start production server
npm run test        # Run tests (if configured)
```

## Project Information

- **Target Users**: Farmers in Charsada and Chitral districts (Khyber Pakhtunkhwa, Pakistan)
- **Languages**: English, Urdu, Pashto
- **Primary Use Case**: Crop disease identification and treatment recommendations
- **Data Sensitivity**: User privacy is prioritized; device tracking for anonymous users requires consent

## Future Enhancements

- Extended crop variety support
- Seasonal disease forecasting
- Integration with local agricultural extension services
- Farmer community features for knowledge sharing
- SMS-based alerts for disease outbreaks
- Offline prediction capability using on-device ML model
