# Debug Steps for Blank Page Issue

## Check Browser Console

1. Open your browser at http://localhost:3000
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Try to login
5. Look for any errors

## Expected Console Output

You should see:
- Network requests to `/auth/login` → 200 OK
- Network request to `/auth/me` → 200 OK
- Network request to `/polls/` → 200 OK

## Check React DevTools

1. Install React DevTools extension
2. Check if components are rendering
3. Look at the Auth Store state

## Manual Debug

Open browser console and type:
```javascript
localStorage.getItem('auth-storage')
```

This should show your auth state.

## Possible Issues

1. **Auth state not updating** - Check if `setUser` is being called
2. **Protected route redirecting** - Check if `isAuthenticated` is true
3. **Component not rendering** - Check if Dashboard component mounts
4. **Data not loading** - Check if `usePolls` hook returns data

## Quick Fix to Try

1. Clear localStorage:
```javascript
localStorage.clear()
```

2. Refresh page
3. Register a new account
4. See if dashboard loads


