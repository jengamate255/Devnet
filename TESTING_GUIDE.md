# Router Detection Testing Guide

## Prerequisites
✅ Frontend server running on http://localhost:3000
✅ Backend server running on http://localhost:8080

## Manual Testing Steps

### 1. Open the Application
1. Open your browser (Chrome/Edge/Firefox)
2. Navigate to: `http://localhost:3000`
3. Wait for the app to load completely

### 2. Navigate to Router Settings
1. Look for the horizontal navigation menu
2. Click on **"Router Settings"** tab
3. The page should show router configuration options

### 3. Test Autodetect Feature

#### What You Should See:
- A section showing "Connection Method" with IP/MAC toggle
- An **"Autodetect Router"** button with a 🔍 icon
- Router configuration fields (IP Address, Username, Password, etc.)

#### Steps to Test:
1. Click the **"Autodetect Router"** button
2. Watch for notifications in the top-right corner

#### Expected Behavior:
1. **Immediate notification**: "🔍 Autodetecting MikroTik router on local network..."
2. **Priority check**: "Checking common MikroTik addresses..."
3. **If router found at default IP (192.168.88.1)**:
   - "✅ Found MikroTik router at 192.168.88.1!"
   - Router IP field will be auto-filled
4. **If not found in priority IPs**:
   - "Scanning full network range (this may take a moment)..."
   - Progress updates: "Scanning... X% complete"
5. **Final result**:
   - **Success**: "✅ Found MikroTik router at [IP]!"
   - **Failure**: "⚠️ No MikroTik router found. Try manual configuration."

### 4. What the Scanner Checks

The autodetect will scan for these services in priority order:

1. **Priority IPs** (checked first, in parallel):
   - 192.168.88.1 (MikroTik default)
   - 192.168.1.1
   - 10.0.0.1
   - 172.16.0.1
   - Your network's .1 and .254 addresses

2. **Ports tested per IP**:
   - Port 8729 (API-SSL) ⭐ Recommended
   - Port 8728 (API)
   - Port 443 (REST API)
   - Port 80 (HTTP web interface)
   - Port 8291 (Winbox)

### 5. Performance Expectations

| Scenario | Expected Time |
|----------|--------------|
| Router at 192.168.88.1 | < 2 seconds |
| Router at .1 or .254 | < 5 seconds |
| Router elsewhere in /24 | 20-30 seconds |
| No router found | ~30 seconds |

### 6. What to Look For

#### Success Indicators:
- ✅ Green notification with checkmark
- ✅ Router IP field automatically filled
- ✅ MAC address field filled (if available)
- ✅ Notification shows which port/service was detected

#### Failure Indicators:
- ⚠️ Orange/yellow warning notification
- ❌ Red error notification (if scan fails)
- 💡 Suggestion to configure manually

### 7. Troubleshooting

#### If autodetect doesn't work:
1. **Check your network**:
   - Are you on the same network as the MikroTik router?
   - Is the router powered on and accessible?

2. **Check scan range**:
   - Default is 192.168.100.0/24
   - Scroll to "Router Discovery" section
   - Update "Network Range to Scan" if needed
   - Example: `192.168.1.0/24` or `10.0.0.0/24`

3. **Manual connection**:
   - If you know the router IP, enter it manually
   - Enter username (default: `admin`)
   - Enter password
   - Click "Connect to Router"

### 8. Advanced Testing

#### Test Different Scenarios:

**Scenario A: Default MikroTik Setup**
- Scan range: `192.168.88.0/24`
- Expected: Finds router at 192.168.88.1 in < 2 seconds

**Scenario B: Custom Network**
- Update scan range to match your network
- Example: `192.168.1.0/24`
- Click "Autodetect Router"

**Scenario C: Manual Discovery**
- Scroll to "Router Discovery" section
- Enter your network range
- Click "🔍 Discover Routers"
- View all discovered devices
- Click "Use This IP" on any found router

### 9. Backend API Testing (Optional)

If you want to test the backend API server:

```bash
# Test backend health
curl http://localhost:8080/api/health

# Expected response:
# {"status":"ok","version":"1.0.0"}
```

### 10. Console Logs

#### Open Browser DevTools:
- Press F12 or Right-click → Inspect
- Go to "Console" tab
- Click "Autodetect Router"
- Watch for debug messages:
  - "Autodetect error:" (if any errors)
  - Network requests to router IPs
  - Detection results

### 11. Network Tab Monitoring

In DevTools → Network tab:
- Click "Autodetect Router"
- Watch for requests to:
  - `https://192.168.88.1:443/rest/system/identity`
  - `http://192.168.88.1:80`
  - Other IP addresses being scanned

**Note**: You'll see many failed requests (CORS errors, timeouts) - this is normal! The scanner tries many IPs until it finds one.

## Expected Results Summary

### ✅ Working Detection:
- Notifications appear and update
- Progress shown for longer scans
- Router found and IP auto-filled
- OR clear message about no router found

### ❌ Not Working:
- No notifications appear
- Button stays "Autodetecting..." forever
- Console shows JavaScript errors
- App crashes or freezes

## Screenshot Guide

Please capture screenshots of:
1. Initial Router Settings tab
2. After clicking "Autodetect Router" (notifications visible)
3. Final result (success or failure message)
4. Console tab (any errors or messages)

This will help diagnose any issues!
