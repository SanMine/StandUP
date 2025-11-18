# Candidate Dashboard Live Updates Implementation

## Overview
Enhanced the Candidates Page dashboard to provide real-time statistics updates with automatic refresh capabilities.

## Key Features Implemented

### 1. **Auto-Refresh Mechanism**
- Stats automatically refresh every 30 seconds
- Provides continuous live updates without manual intervention
- Interval clears on component unmount to prevent memory leaks

### 2. **Manual Refresh Button**
- Added a refresh button in the header with a spinning icon animation
- Allows users to manually trigger data refresh on demand
- Button disables during loading to prevent multiple simultaneous requests

### 3. **Real-Time Stats Updates**
The dashboard now updates stats immediately after any action:
- **Status Changes**: When candidate status is updated (interview_scheduled, hired, rejected, etc.)
- **Rating Updates**: When employer rates a candidate
- **Interview Scheduling**: When interview link and date/time are saved
- **Candidate Deletion**: When a candidate is removed

### 4. **Visual Feedback**
- Stats cards show opacity animation during refresh (fade effect)
- Refresh icon spins during data loading
- Smooth transitions for better UX

## Stats Cards

### Total Candidates
- Shows the total number of candidates across all jobs
- Updates immediately when candidates are added or deleted

### Reviewing
- Displays candidates currently under review
- Auto-increments when status changes from "new" to "reviewing"

### Interviews
- Combines "interview_scheduled" + "interviewed" statuses
- Updates when interview links are saved or status changes

### Avg Match Score
- Calculates and displays the average AI match score across all candidates
- Provides insight into candidate quality

## Technical Implementation

### State Management
```javascript
const [stats, setStats] = useState(null);
const [statsLoading, setStatsLoading] = useState(false);
```

### Auto-Refresh Hook
```javascript
useEffect(() => {
  const statsInterval = setInterval(() => {
    fetchStats();
  }, 30000); // 30 seconds

  return () => clearInterval(statsInterval);
}, []);
```

### Unified Refresh Function
```javascript
const refreshData = async () => {
  await Promise.all([fetchCandidates(), fetchStats()]);
};
```

## API Endpoint Used
- **GET** `/api/candidates/stats`
- Returns:
  ```json
  {
    "success": true,
    "data": {
      "total": 45,
      "byStatus": {
        "new": 10,
        "reviewing": 15,
        "interview_scheduled": 8,
        "interviewed": 5,
        "hired": 3,
        "rejected": 4
      },
      "avgMatchScore": 78.5
    }
  }
  ```

## Benefits

1. **Real-Time Awareness**: Employers always see current candidate pipeline status
2. **Better Decision Making**: Up-to-date stats help with resource planning
3. **Improved UX**: No need to manually refresh the page
4. **Performance**: Efficient polling with 30-second intervals balances freshness and server load
5. **Immediate Feedback**: Actions reflect instantly in dashboard stats

## Usage

The live stats work automatically. Users can:
1. Watch stats update automatically every 30 seconds
2. Click the "Refresh" button for immediate updates
3. Perform any candidate action (status change, rating, etc.) and see stats update instantly

## Future Enhancements

Consider implementing:
- WebSocket connection for true real-time updates (server push)
- Configurable refresh intervals
- Stats history/trends visualization
- Export stats functionality
- Compare stats across time periods
