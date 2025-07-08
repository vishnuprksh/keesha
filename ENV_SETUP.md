# Environment Variables Setup

This application uses environment variables for configuration. Follow these steps to set them up:

## 1. Copy the example file
```bash
cp .env.example .env
```

## 2. Update the .env file with your actual values

### For the React App (PDF Import feature):
- `REACT_APP_GEMINI_API_KEY`: Your Gemini API key from https://makersuite.google.com/app/apikey

### For the standalone test script:
- `GEMINI_API_KEY`: Your Gemini API key (same as above, but without the REACT_APP_ prefix)

### Firebase Configuration:
- `REACT_APP_FIREBASE_API_KEY`: Your Firebase API key
- `REACT_APP_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `REACT_APP_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `REACT_APP_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `REACT_APP_FIREBASE_APP_ID`: Your Firebase app ID

## 3. Running the test script
To test the Gemini API integration:
```bash
# Set the environment variable and run the test
GEMINI_API_KEY=your_api_key_here node check_gemini_api.js
```

## 4. Security Notes
- Never commit the `.env` file to version control
- The `.env` file is already listed in `.gitignore`
- Use different API keys for development and production environments
