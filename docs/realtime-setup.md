# Enable Real-time Updates in Supabase

Your app is set up for real-time updates, but you need to enable real-time in your Supabase project.

## Step 1: Enable Real-time in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Scroll down to **"Realtime"** section
4. Make sure **"Enable Realtime"** is turned ON
5. Add `cages` to the **"Realtime enabled tables"** list

## Step 2: Alternative - Enable via SQL

If the UI option doesn't work, run this SQL in your Supabase SQL Editor:

```sql
-- Enable real-time for the cages table
ALTER PUBLICATION supabase_realtime ADD TABLE cages;
```

## Step 3: Test Real-time

1. Open your app in two browser tabs
2. Click the "Test" button in the header (it will change the first cage)
3. Watch the browser console for real-time messages
4. Check if the change appears in both tabs

## Expected Console Output

When real-time is working, you should see:

```
Setting up real-time subscription...
Supabase subscription status: SUBSCRIBED
Dashboard received real-time update: { eventType: 'UPDATE', new: {...}, old: {...} }
Handling UPDATE: {...}
```

## Troubleshooting

### If you see "Offline" status:
- Real-time is not enabled in Supabase settings
- The table `cages` is not added to real-time enabled tables

### If real-time still doesn't work:
1. Check your Supabase plan (real-time might be limited on free tier)
2. Make sure your database has the correct permissions
3. Try refreshing your Supabase API keys

## Alternative: Polling Method

If real-time can't be enabled, I can implement a polling method that checks for updates every few seconds instead.
