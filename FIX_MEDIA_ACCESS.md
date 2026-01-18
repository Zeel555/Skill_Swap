# 🔧 Fix: Media Access (Camera/Microphone) Issues

## Problem

When accessing the app via network IP (e.g., `http://192.168.1.100:5173`), browsers block camera/microphone access because it's not considered a "secure context". Browsers only allow media access on:
- `https://` (secure)
- `localhost`
- `127.0.0.1`

## ✅ Solution Options

### Option 1: Use localhost on Each Device (Recommended for Testing)

**On Device 1 (Server):**
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Access: `http://localhost:5173`

**On Device 2:**
1. Create `frontend/.env` file:
   ```env
   VITE_API_URL=http://192.168.1.100:5000/api
   ```
   (Replace `192.168.1.100` with Device 1's IP)
2. Start frontend: `cd frontend && npm run dev`
3. Access: `http://localhost:5173`

This way:
- Device 1 connects to backend on localhost
- Device 2 connects to backend on Device 1's network IP
- Both use localhost for frontend (secure context for media)

### Option 2: Set Up HTTPS (Best for Production)

#### Quick HTTPS Setup with Vite:

1. Install `@vitejs/plugin-basic-ssl`:
   ```bash
   cd frontend
   npm install --save-dev @vitejs/plugin-basic-ssl
   ```

2. Update `vite.config.js`:
   ```js
   import react from '@vitejs/plugin-react'
   import { defineConfig } from 'vite'
   import basicSsl from '@vitejs/plugin-basic-ssl'

   export default defineConfig({
     plugins: [react(), basicSsl()],
     server: {
       https: true,
       host: '0.0.0.0', // Allow network access
     }
   })
   ```

3. Start frontend:
   ```bash
   npm run dev
   ```

4. Access via: `https://192.168.1.100:5173`
   - Browser will show security warning - click "Advanced" → "Proceed"
   - This is safe for local development

5. Update backend CORS to allow HTTPS:
   ```env
   CLIENT_URL=https://192.168.1.100:5173
   ```

### Option 3: Use ngrok (For Internet Access)

1. Install ngrok: https://ngrok.com/
2. Start your frontend on localhost
3. Run: `ngrok http 5173`
4. Use the HTTPS URL provided by ngrok
5. Both devices access via the ngrok URL

### Option 4: Browser Flags (Chrome Only - Not Recommended)

**⚠️ Warning: Only for development, not secure**

Chrome can be started with flags to allow insecure media access:
```bash
chrome --unsafely-treat-insecure-origin-as-secure=http://192.168.1.100:5173 --user-data-dir=/tmp/chrome-dev
```

## 🔍 Verify Media Access

Open browser console and run:
```javascript
navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  .then(stream => {
    console.log("✅ Media access works!");
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => {
    console.error("❌ Media access failed:", err);
  });
```

## 📝 Current Status Check

The code now:
- ✅ Checks if media devices are available before attempting access
- ✅ Provides clear error messages
- ✅ Suggests using localhost or HTTPS
- ✅ Handles permission errors gracefully

## 🚀 Recommended Setup for Your Use Case

**For same network testing:**

1. **Device 1 (Server):**
   - Backend: `npm start` (runs on port 5000)
   - Frontend: `npm run dev` (runs on port 5173)
   - Access: `http://localhost:5173`

2. **Device 2:**
   - Create `frontend/.env`:
     ```env
     VITE_API_URL=http://[DEVICE1_IP]:5000/api
     ```
   - Frontend: `npm run dev`
   - Access: `http://localhost:5173`

Both devices use localhost for frontend (secure context), but Device 2 connects to Device 1's backend via network IP.

## ✅ Quick Test

After setup, test media access:
1. Open browser console (F12)
2. Look for: `✅ Media devices available`
3. If you see: `⚠️ Media devices not available` - follow one of the solutions above

