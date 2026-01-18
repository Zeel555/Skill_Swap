# Network Setup Guide for Video/Voice Calls

This guide will help you set up the Skill Swap application to work between different devices on the same network and over the internet.

## 🎯 Quick Setup (Same Network)

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for "inet" address (usually starts with 192.168.x.x or 10.x.x.x)

### Step 2: Start the Backend Server

The backend will automatically detect and display your network IP when it starts:
```bash
cd backend
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
🌐 Server accessible on network at http://192.168.1.100:5000
```

### Step 3: Configure Frontend (Option A - Automatic)

The frontend will automatically detect if you're accessing it via network IP and connect to the backend on the same IP.

**On the server computer:**
1. Start the frontend: `cd frontend && npm run dev`
2. Access it using your network IP: `http://192.168.1.100:5173` (replace with your IP)

**On the other computer:**
1. Access the frontend using the server's IP: `http://192.168.1.100:5173`

### Step 4: Configure Frontend (Option B - Environment Variable)

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://192.168.1.100:5000/api
```

Replace `192.168.1.100` with your server's actual IP address.

Then start the frontend:
```bash
cd frontend
npm run dev
```

## 🌐 Internet Setup (Different Networks)

For calls over the internet, you need:

### Option 1: Port Forwarding (Home Network)

1. **Configure Router Port Forwarding:**
   - Forward port 5000 (backend) to your server's local IP
   - Forward port 5173 (frontend) to your server's local IP (optional, if hosting frontend)

2. **Find Your Public IP:**
   - Visit https://whatismyipaddress.com/
   - Note your public IP address

3. **Update Environment Variables:**
   - Backend: Set `CLIENT_URL=http://YOUR_PUBLIC_IP:5173` (or your domain)
   - Frontend: Set `VITE_API_URL=http://YOUR_PUBLIC_IP:5000/api`

### Option 2: Use a TURN Server (Recommended for Production)

For better connectivity through firewalls and NAT, configure a TURN server:

1. **Free TURN Options:**
   - https://www.metered.ca/tools/openrelay/ (free tier available)
   - https://xirsys.com/ (free tier available)

2. **Update WebRTC Configuration:**
   Edit `frontend/src/features/chat/useWebRTC.js` and add your TURN server:

```javascript
const ICE_CONFIG = {
  iceServers: [
    // ... existing STUN servers ...
    {
      urls: "turn:your-turn-server.com:3478",
      username: "your-username",
      credential: "your-password"
    }
  ],
};
```

### Option 3: Use a Cloud Service

Deploy your backend to:
- **Heroku** (free tier available)
- **Railway** (free tier available)
- **Render** (free tier available)
- **AWS/Azure/GCP**

Then update your frontend `.env`:
```env
VITE_API_URL=https://your-backend-url.com/api
```

## 🔧 Troubleshooting

### Issue: "Cannot connect to server"

**Solution:**
1. Check firewall settings - allow ports 5000 and 5173
2. Ensure both devices are on the same network
3. Verify the IP address is correct
4. Check backend console for connection logs

### Issue: "Video/Audio not working"

**Solution:**
1. Check browser permissions for camera/microphone
2. Ensure HTTPS or localhost (browsers require secure context for media)
3. Check browser console for WebRTC errors
4. Try different browsers (Chrome, Firefox, Edge)

### Issue: "CORS errors"

**Solution:**
1. The backend is configured to allow local network IPs automatically
2. If using a custom domain, add it to `CLIENT_URL` environment variable
3. Check backend console for CORS logs

### Issue: "Call connects but no audio/video"

**Solution:**
1. Check STUN/TURN server connectivity
2. For internet calls, you likely need a TURN server
3. Check browser console for WebRTC connection state
4. Try using Chrome (best WebRTC support)

## 📝 Environment Variables Reference

### Backend (.env)
```env
PORT=5000
HOST=0.0.0.0
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_PORT=5000
```

## ✅ Testing Checklist

- [ ] Backend starts and shows network IP
- [ ] Frontend connects to backend (check browser console)
- [ ] Socket connection established (check backend console)
- [ ] Can send/receive messages
- [ ] Can initiate voice call
- [ ] Can initiate video call
- [ ] Can accept incoming calls
- [ ] Audio works in voice calls
- [ ] Video works in video calls
- [ ] Can mute/unmute
- [ ] Can toggle camera
- [ ] Can end calls properly

## 🚀 Quick Test Commands

**Check if backend is accessible:**
```bash
curl http://YOUR_IP:5000
```

**Check if frontend is accessible:**
Open `http://YOUR_IP:5173` in browser

**Test WebRTC connectivity:**
Open browser console and check for WebRTC connection states

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend console for errors
3. Verify network connectivity
4. Ensure firewall allows connections
5. Try different browsers

