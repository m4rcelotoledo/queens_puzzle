# 🏆 Queens Puzzle - Intelligent Ranking System

> **Falantes de português:** Você pode ler este README em português [aqui](./README.md)

[![Netlify Status](https://api.netlify.com/api/v1/badges/89cdb707-cd0c-411d-9701-fa89476e5633/deploy-status)](https://app.netlify.com/projects/queens-puzzle/deploys)

An intelligent ranking system for the Queens Puzzle game with smart sorting logic based on victory points, number of games played, and total time.

## 🎯 **New Implemented Features**

### **1. Intelligent Sorting System**

#### **Weekly and Monthly Podiums:**
- **1st Criterion:** Points (highest first)
- **2nd Criterion:** Number of games played (highest first)
- **3rd Criterion:** Total time from **ALL days** (lowest first)
- **4th Criterion:** Alphabetical order

#### **Daily Podium:**
- **1st Criterion:** Players with time > 0 come first
- **2nd Criterion:** Among players with time > 0, sort by time (lowest first)
- **3rd Criterion:** Among players with time = 0, sort alphabetically

### **2. New Feature: Games Played Counter**

The system now considers the **number of games played** as a tiebreaker criterion, prioritizing players who participated more times during the period (week/month). This ensures that:

- Players who played more times have priority over those who played less
- Only games with time > 0 are counted as "played"
- Players who didn't participate (time = 0) are not counted in games played

### **3. Scenario Examples**

#### **Scenario 1: Tiebreaker by Number of Games Played**
```
Marcelo: 1 victory, 2 games played, total time: 44+95 = 139s
James: 1 victory, 1 game played, total time: 75+50 = 125s

Result: 1st Marcelo (more games), 2nd James (fewer games)
```

#### **Scenario 2: Sunday with 3 Points**
```
Maria: 3 points (Sunday), 2 games played, total time: 120+110 = 230s
João: 1 point (Monday), 1 game played, total time: 100s
Pedro: 0 points, 1 game played, total time: 130s

Result: 1st Maria, 2nd João, 3rd Pedro
```

#### **Scenario 3: Players with Zero Time**
```
João: 100s (participated - 1 game)
Ana: 0s (didn't participate - 0 games)
Bruno: 0s (didn't participate - 0 games)
Carlos: 0s (didn't participate - 0 games)

Result: 1st João, 2nd Ana, 3rd Bruno, 4th Carlos
```

#### **Scenario 4: Real User Example**
```
Monday:
- Jhonny: 15s (1 point, 1 game)
- Marcelo: 19s (0 points, 1 game)
- James: 31s (0 points, 1 game)

Tuesday:
- Jhonny: 59s (0 points, 1 game)
- Marcelo: 44s (1 point, 1 game)
- James: 75s (0 points, 1 game)

Wednesday:
- Jhonny: 60s (0 points, 1 game)
- Marcelo: 65s (0 points, 1 game)
- James: 5s (1 point, 1 game)

Final weekly ranking:
1. James (1 point, 3 games, total time: 31+75+5 = 111s)
2. Marcelo (1 point, 3 games, total time: 19+44+65 = 128s)
3. Jhonny (1 point, 3 games, total time: 15+59+60 = 134s)
```

#### **Scenario 5: Prioritization by Number of Games**
```
Marcelo: 1 victory, 2 games played, total time: 139s
James: 1 victory, 1 game played, total time: 125s

Result: 1st Marcelo (more games), 2nd James (fewer games)
Even with worse time, Marcelo comes first for having played more times.
```

## 🚀 **How to Use**

### **Installation and Setup:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Create .env.local file
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Run in development:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

### **Available Scripts:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Build preview
- `npm test` - Run tests
- `npm run test:coverage` - Tests with coverage

## 🧪 **Implemented Tests**

### **Sorting Tests:**
- ✅ Daily podium with zero-time players
- ✅ Tiebreaker by total time in weekly podium
- ✅ Complex scenario with multiple victories
- ✅ Monthly podium with time tiebreaker
- ✅ Alphabetical sorting as last criterion
- ✅ New rule for total time from all days
- ✅ Specific user scenario (Jhonny, Marcelo, James)

### **Robustness Tests:**
- ✅ Parameter validation
- ✅ Invalid data handling
- ✅ Edge cases (end of year, leap year)
- ✅ Different timezones
- ✅ Defense against calls without parameters
- ✅ Null/empty data handling

### **Component Tests:**
- ✅ PlayerStatsPage - Detailed statistics
- ✅ DarkModeToggle - Theme switching
- ✅ TimeInputForm - Input form
- ✅ App - General integration
- ✅ Accessibility (aria-labels, roles)

### **Integration Tests:**
- ✅ Calculation functions with valid parameters
- ✅ Real application scenario simulation
- ✅ Prevention of parameterless call errors

## 📊 **Test Coverage**

- **186 tests** passing ✅
- **9 test suites**
- **96.24%** statement coverage
- **91.53%** branch coverage
- **98.55%** function coverage
- **96.93%** line coverage
- **100%** critical functionality coverage

## 🔧 **Architecture**

### **Main Functions:**
- `calculateDailyPodium()` - Daily podium with special rules
- `calculateWeeklyPodium()` - Weekly podium with time tiebreaker
- `calculateMonthlyPodium()` - Monthly podium with time tiebreaker
- `calculatePlayerStats()` - Detailed statistics per player
- `validateTimes()` - Time input validation
- `getWeekRange()` - Weekly range calculation
- `getMonthName()` - Month name formatting

### **Sorting Logic:**
```javascript
// 1. Points (highest first)
if (b.wins !== a.wins) return b.wins - a.wins;

// 2. Number of games played (highest first)
if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;

// 3. Total time from ALL days (lowest first)
if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime;

// 4. Alphabetical order
return a.name.localeCompare(b.name);
```

### **📅 Period Calculation (Technical Implementation):**

#### **Weekly Ranking:**
```javascript
// Calculate week start (Monday)
const dayOfWeek = startOfWeek.getDay();
const diffToMonday = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
startOfWeek.setDate(diffToMonday);

// Iterate through 7 days (Monday to Sunday)
for (let i = 0; i < 7; i++) {
  const currentDate = new Date(startOfWeek);
  currentDate.setDate(startOfWeek.getDate() + i);
  // Process each day of the week
}
```

#### **Monthly Ranking:**
```javascript
// Filter scores from selected month
const year = selectedDate.getFullYear();
const month = selectedDate.getMonth();

Object.values(scores).forEach(score => {
  const scoreDate = new Date(score.date + 'T12:00:00Z');
  if (scoreDate.getFullYear() === year && scoreDate.getMonth() === month) {
    // Process only scores from this month
  }
});
```

### **📋 Practical Period Examples:**

#### **Example 1: Weekly Ranking**
```
Selected date: January 15, 2024 (Monday)
Considered period: 01/15/2024 (Monday) to 01/21/2024 (Sunday)

Included scores:
- 01/15/2024 (Monday): João wins
- 01/16/2024 (Tuesday): Maria wins
- 01/17/2024 (Wednesday): João wins
- 01/18/2024 (Thursday): Pedro wins
- 01/19/2024 (Friday): Maria wins
- 01/20/2024 (Saturday): João wins
- 01/21/2024 (Sunday): Pedro wins (3 points)
```

#### **Example 2: Monthly Ranking**
```
Selected date: January 15, 2024
Considered period: 01/01/2024 to 01/31/2024

Included scores:
- 01/01/2024: João wins
- 01/07/2024: Maria wins (Sunday = 3 points)
- 01/15/2024: Pedro wins
- 01/22/2024: João wins
- 01/28/2024: Maria wins (Sunday = 3 points)

NOT included scores:
- 12/31/2023: December score (previous month)
- 02/01/2024: February score (next month)
```

### **Data Structure:**
```javascript
// Daily score structure
{
  date: '2024-01-15',
  dayOfWeek: 1, // 0 = Sunday, 1 = Monday, etc.
  results: [
    {
      name: 'João',
      time: 100,
      bonusTime: 0,
      totalTime: 100
    }
  ]
}
```

### **Technologies Used:**
- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Tests:** Jest + React Testing Library
- **Deploy:** Netlify
- **Authentication:** Firebase
- **State:** React Hooks (useState, useEffect)

### **Project Structure:**
```
queens_puzzle/
├── src/
│   ├── components/          # React components
│   │   ├── App.jsx         # Main component
│   │   ├── PlayerStatsPage.jsx
│   │   ├── TimeInputForm.jsx
│   │   └── DarkModeToggle.jsx
│   ├── utils/
│   │   └── calculations.js  # Calculation logic
│   └── main.jsx            # Entry point
├── tests/
│   └── unit/               # Unit tests
├── public/                 # Static assets
└── package.json
```

## 🎮 **Game Rules**

### **📅 Period Definitions:**

#### **Weekly Ranking:**
- **Period:** Monday (00:00) to Sunday (23:59)
- **Calculation:** From any date, calculates the week containing that date
- **Example:** If today is Wednesday, considers Monday to Sunday of the same week

#### **Monthly Ranking:**
- **Period:** Day 1 (00:00) to last day of the month (23:59)
- **Calculation:** Considers all scores from the selected date's month
- **Example:** If today is January 15th, considers all scores from 1st to 31st January

### **Scoring System:**
- **Normal days:** 1 point per victory
- **Sunday:** 3 points per victory (triple weight)

### **Tiebreaker Criteria:**
- **Daily Podium:** Lowest time first, zero-time players last
- **Weekly/Monthly Podium:** Total time from **ALL days** (lowest first)
- **Last criterion:** Alphabetical order

### **Validations:**
- **Minimum time:** 1 second
- **Maximum time:** 999 seconds
- **Sunday bonus:** Maximum 300 seconds
- **Required players:** Minimum 2, maximum 10

### **Features:**
- **Dark/light mode:** Automatic switching
- **Detailed statistics:** Per player and period
- **Persistence:** Data saved in Firebase
- **Responsiveness:** Works on mobile and desktop

## 📝 **Changelog**

### **v2.1.0 - New Total Time Tiebreaker Rule**
- ✨ Implemented tiebreaker by total time from **ALL days** (not just victories)
- ✨ New fairer rule that encourages participation
- ✨ Maintained special sorting for zero-time players
- 🧪 Updated all tests for the new rule
- 📚 Documentation updated with practical examples

### **v2.0.0 - Intelligent Sorting System**
- ✨ Implemented tiebreaker by total victory time
- ✨ Added special sorting for zero-time players
- ✨ Improved sorting logic in all podiums
- 🧪 Added robust tests for all scenarios
- 📚 Complete documentation of new features

### **v1.0.0 - Initial Version**
- 🎯 Basic scoring system
- 📊 Daily, weekly, and monthly podiums
- 🔐 Firebase authentication
- 📱 Responsive interface
- 🌙 Dark/light mode
- 📈 Detailed statistics
- 🧪 Unit tests
- 📱 Responsive design
