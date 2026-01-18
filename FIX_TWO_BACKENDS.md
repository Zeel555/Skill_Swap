# 🔧 Fix: Two Backend Servers Problem

## Problem

If you see in the backend logs:
- `Users in room: 1` (should be 2)
- Only one user appears in socket connections
- Offers are sent but not received

**This means both users are connecting to DIFFERENT backend servers!**

## Why This Happens

Each user is running their own backend:
- User 1's backend: `10.166.123.70:5000`
- User 2's backend: `10.166.123.98:5000`

They're in separate Socket.IO instances, so they can't see each other's events.

## ✅ Solution

**Only ONE person should run the backend server!**

### Correct Setup:

**Device 1 (Server):**
- ✅ Runs backend: `npm start` in `backend/` folder
- ✅ Runs frontend: `npm run dev` in `frontend/` folder
- ✅ Access: `http://localhost:5173`
- ✅ Backend IP: `10.166.123.70:5000` (example)

**Device 2 (Client):**
- ❌ **DO NOT run backend!**
- ✅ Create `frontend/.env`:
  ```env
  VITE_API_URL=http://10.166.123.70:5000/api
  ```
  (Use Device 1's IP)
- ✅ Runs frontend: `npm run dev` in `frontend/` folder
- ✅ Access: `http://localhost:5173`

## Verification

**Device 1's backend console should show:**
```
🔌 Socket connected: [id1] User1 Name
🔌 Socket connected: [id2] User2 Name
📞 join-call: User1 joined room: [room-id] | Users in room: 1
📞 join-call: User2 joined room: [room-id] | Users in room: 2  ← Should be 2!
```

**If you only see "Users in room: 1":**
- Device 2 is probably running its own backend
- Stop Device 2's backend
- Make sure Device 2's frontend connects to Device 1's backend

## Quick Fix Steps

1. **Stop backend on Device 2:**
   - Press `Ctrl+C` in Device 2's backend terminal
   - Or close the terminal running backend

2. **Verify Device 2's `.env` file:**
   ```env
   VITE_API_URL=http://[DEVICE1_IP]:5000/api
   ```

3. **Restart Device 2's frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Check Device 1's backend console:**
   - Should now see both users connecting
   - Should see "Users in room: 2" when both join call room

## Common Mistakes

❌ **Both users running backend** → They're in separate Socket.IO instances
✅ **Only one backend** → Both users in same Socket.IO instance

❌ **Device 2 using localhost for API** → Connects to Device 2's own backend
✅ **Device 2 using Device 1's IP** → Connects to Device 1's backend

❌ **Device 2's backend running** → Creates separate server
✅ **Device 2's backend stopped** → Uses Device 1's server

