# 🔍 Debugging Call Connection Issues

## Step-by-Step Debugging

### 1. Check Socket Connection

**In Browser Console (both users):**
```javascript
// Check if socket is connected
console.log("Socket:", window.socket); // Should show socket object
```

**Look for these logs:**
- ✅ `GLOBAL socket connected: [socket-id]` - Socket is connected
- ✅ `Joined personal room: [user-id]` - User room joined
- ✅ `Joining call room: [room-id]` - Call room joined

**If you see:**
- ❌ `Socket is null` - Socket not initialized
- ❌ `Socket connection error` - Connection failed
- ❌ `Socket not connected` - Socket disconnected

### 2. Check Room Joining

**In Backend Console:**
Look for:
```
📞 join-call: [username] joined room: [room-id] | Users in room: [count]
```

**Both users should see:**
- User 1: `Users in room: 1` then `Users in room: 2`
- User 2: `Users in room: 1` then `Users in room: 2`

**If you only see 1 user in room:**
- One user's socket isn't joining the room
- Check if both users are in the same chat window
- Verify both users have the same `roomId` (should be sorted user IDs)

### 3. Check Offer/Answer Flow

**When User 1 clicks Voice/Video:**
**Backend should show:**
```
📞 Offer received from: [user1] to room: [room-id] type: [audio/video]
👥 Users in room [room-id]: 2
✅ Offer forwarded to room: [room-id]
```

**User 2's Browser Console should show:**
```
📞 Incoming call received! From: [user1-id] Type: [audio/video] Room: [room-id]
```

**If User 2 doesn't see the incoming call:**
- Check if User 2's socket is in the room
- Check if User 2's socket listeners are set up
- Verify both users are using the same network IP

### 4. Common Issues & Solutions

#### Issue: "Socket not connected"

**Solution:**
1. Check if backend is running: `http://YOUR_IP:5000`
2. Check browser console for connection errors
3. Verify network IP is correct
4. Check firewall settings
5. Try refreshing the page

#### Issue: "Only 1 user in room"

**Solution:**
1. Both users must be in the chat window
2. Both users must have socket connected
3. Check backend logs for join-call events
4. Verify roomId is the same for both users (sorted user IDs)

#### Issue: "Offer sent but not received"

**Solution:**
1. Check backend logs - should show "Offer forwarded"
2. Check User 2's browser console for "Incoming call received"
3. Verify User 2's socket listeners are active
4. Check if User 2's socket is connected
5. Try refreshing User 2's page

#### Issue: "Socket connection error"

**Solution:**
1. Check backend CORS settings
2. Verify network IP is correct
3. Check firewall allows port 5000
4. Try accessing backend directly: `http://YOUR_IP:5000`
5. Check backend console for errors

### 5. Manual Testing

**Test Socket Connection:**
```javascript
// In browser console
const socket = io('http://YOUR_IP:5000', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.emit('join-call', 'test-room');
```

**Test Room Join:**
```javascript
// In browser console (both users)
socket.emit('join-call', 'user1_user2'); // Use actual room ID
```

**Test Offer:**
```javascript
// User 1 - Create offer
const pc = new RTCPeerConnection();
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
socket.emit('offer', { 
  roomId: 'user1_user2', 
  offer: offer, 
  callType: 'video' 
});
```

### 6. Network Verification

**Check if both users can reach backend:**
```bash
# On both computers, test:
curl http://YOUR_IP:5000
# Should return: "Skill Swap API is running 🚀"
```

**Check socket connection:**
- Open browser DevTools → Network tab
- Look for WebSocket connection to `ws://YOUR_IP:5000/socket.io/`
- Status should be "101 Switching Protocols"

### 7. Browser Console Checklist

**User 1 (Caller):**
- [ ] `✅ GLOBAL socket connected`
- [ ] `🟢 Joined personal room`
- [ ] `🟢 Joining call room`
- [ ] `📞 Starting call`
- [ ] `📞 Sending offer`
- [ ] `✅ Offer sent`

**User 2 (Receiver):**
- [ ] `✅ GLOBAL socket connected`
- [ ] `🟢 Joined personal room`
- [ ] `🟢 Joining call room`
- [ ] `📞 Incoming call received!`

**Backend:**
- [ ] `🔌 Socket connected` (for both users)
- [ ] `📞 join-call` (for both users)
- [ ] `👥 Users in room: 2`
- [ ] `📞 Offer received`
- [ ] `✅ Offer forwarded`

### 8. Quick Fixes

**If nothing works:**
1. Restart backend server
2. Clear browser cache
3. Refresh both pages
4. Check both users are logged in
5. Verify both users are in the same chat
6. Check network connectivity

**Force reconnection:**
```javascript
// In browser console
socket.disconnect();
socket.connect();
```

