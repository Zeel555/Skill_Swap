# 🚀 Quick Start: Network Setup for Video/Voice Calls

## For Same Network (Two Laptops on Same WiFi)

### Step 1: Find Server IP Address

**On the computer running the backend:**
```bash
cd backend
npm run get-ip
```

This will show your network IP (e.g., `192.168.1.100`)

### Step 2: Start Backend

**On the computer running the backend:**
```bash
cd backend
npm start
```

You'll see:
```
🚀 Server running on http://localhost:5000
🌐 Server accessible on network at http://192.168.1.100:5000
```

### Step 3: Start Frontend

**⚠️ IMPORTANT: For camera/microphone to work, both devices must use `localhost` for frontend access (browsers require secure context).**

**On Device 1 (Server):**
```bash
cd frontend
npm run dev
```
- Access: `http://localhost:5173`

**On Device 2:**
1. Create `frontend/.env` file:
   ```env
   VITE_API_URL=http://192.168.1.100:5000/api
   ```
   (Replace `192.168.1.100` with Device 1's actual IP)

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access: `http://localhost:5173`

**Why localhost?**
- Browsers only allow camera/microphone on HTTPS or localhost
- Network IPs (like 192.168.1.100) are not considered secure
- Device 2 connects to Device 1's backend via network IP, but uses localhost for frontend

### Step 4: Test Calls

1. Both users log in
2. Open a chat between the two users
3. Click "Voice" or "Video" button
4. The other user will see an incoming call notification
5. Accept the call!

## ⚠️ Important Notes

1. **Use Network IP, NOT localhost**: Both computers must access the frontend using the server's network IP (e.g., `http://192.168.1.100:5173`)

2. **Firewall**: Make sure Windows Firewall allows connections on ports 5000 and 5173

3. **Same Network**: Both laptops must be on the same WiFi/network

4. **Browser Permissions**: Allow camera/microphone when prompted

## 🔧 Troubleshooting

**"Cannot connect" errors:**
- Check firewall settings
- Verify both devices are on same network
- Use the network IP, not localhost

**"Call connects but no audio/video":**
- Check browser console for errors
- Ensure camera/microphone permissions are granted
- Try Chrome browser (best WebRTC support)

**"CORS errors":**
- The backend is configured to allow network IPs automatically
- Check backend console for connection logs

## 📝 Alternative: Environment Variable Method

If automatic detection doesn't work, create `frontend/.env`:

```env
VITE_API_URL=http://192.168.1.100:5000/api
```

Replace `192.168.1.100` with your server's actual IP.

## 🌐 For Internet (Different Networks)

See `NETWORK_SETUP.md` for detailed instructions on:
- Port forwarding
- TURN server setup
- Cloud deployment

