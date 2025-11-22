# Product Context: Titan 5/3/1

## Why This Exists

### The Problem

Strength training programs like 5/3/1 are incredibly effective but require careful tracking and calculation:

1. **Complexity Management**: Athletes must calculate percentages, track multiple cycles, manage deload weeks, and adjust training maxes
2. **Consistency Challenge**: Following a structured program for months requires discipline and clear guidance
3. **Progress Blindness**: Hard to visualize progress and understand if training is effective
4. **Form Uncertainty**: Athletes often unsure if their technique is correct, risking injury
5. **Coaching Scalability**: Personal trainers struggle to manage multiple clients' programming efficiently
6. **Fragmented Tools**: Athletes juggle spreadsheets, notes apps, and calculators

### The Solution

Titan 5/3/1 consolidates the entire 5/3/1 training workflow into a single, intelligent application that:

- **Automates Calculations**: All percentages, working weights, and progressions calculated automatically
- **Guides Progression**: Clear indication of what to do each session, when to deload, when to progress
- **Visualizes Progress**: Charts, history, and analytics show long-term trends
- **Provides AI Coaching**: Real-time form feedback and programming insights
- **Enables Coaching**: Manage unlimited clients from one interface
- **Works Offline**: Train anywhere without internet dependency

## How It Works

### User Journey: Individual Athlete

#### 1. Onboarding (First Launch)

```
User opens app → Onboarding flow
↓
Enter basic info (name, gender, weight, unit preference)
↓
Set training maxes for 4 main lifts
↓
Choose program variant (BBB, FSL, etc.)
↓
Configure assistance work and rest timers
↓
Dashboard appears with first workout ready
```

#### 2. Daily Training Session

```
Dashboard shows current cycle/week status
↓
User selects lift to train (Squat, Bench, Deadlift, Overhead)
↓
Warmup sets calculated automatically
↓
Main work: 3 working sets with prescribed reps
↓
AMRAP set: User logs actual reps achieved
↓
Supplemental work (BBB 5x10, FSL 5x5, etc.)
↓
Assistance exercises (pre-configured)
↓
Complete workout → Data saved to history
↓
Achievement notifications if milestones reached
```

#### 3. Cycle Progression

```
Week 1 (5/5/5+) → Week 2 (3/3/3+) → Week 3 (5/3/1+) → Week 4 (Deload)
↓
After Week 4 completion → Cycle Transition Modal
↓
Review performance, adjust training maxes
↓
Start next cycle with increased weights
```

### User Journey: Coach

#### 1. Coach Setup

```
User enables "Coach Mode" in settings
↓
Dashboard transforms to Coach Dashboard
↓
Add clients with individual profiles
```

#### 2. Client Management

```
View all clients in list
↓
Select client → Switch to client view
↓
See client's dashboard, history, and analytics
↓
Monitor progress, achievements, nutrition
↓
Exit client view → Return to coach dashboard
```

### Core Workflows

#### Workflow 1: Starting a Workout

**Trigger**: User clicks "Start Workout" button  
**Path**: Dashboard → Workout Selection → Active Workout

```
1. User on Dashboard sees week/cycle status
2. Clicks "Start Workout" button
3. Workout Start screen shows:
   - Available lifts for the week
   - Already completed lifts (greyed out)
   - Ability to start any remaining lift
4. User selects lift (e.g., "Squat")
5. Active Workout screen loads with:
   - Warmup sets (40%, 50%, 60%)
   - Main work sets (65%, 75%, 85% for Week 1)
   - Supplemental sets (based on program)
   - Assistance exercises (pre-configured)
6. User works through exercises, checking off sets
7. Rest timer auto-starts between sets
8. User completes or abandons workout
9. If completed, saved to history
```

#### Workflow 2: AI Form Check

**Trigger**: User wants technique feedback  
**Path**: AI Coach → Upload Photo/Video → Get Analysis

```
1. User navigates to "AI Coach" tab
2. Chooses "Form Check" feature
3. Uploads photo/video of lift
4. App sends to Gemini Vision API
5. AI analyzes form and provides:
   - Technique assessment
   - Specific cues for improvement
   - Safety concerns if any
6. User can ask follow-up questions
7. Conversation history maintained in session
```

#### Workflow 3: Cycle Transition

**Trigger**: User completes Week 4 (Deload)  
**Path**: Dashboard → Cycle Transition Modal → New Cycle

```
1. User finishes final lift of Week 4
2. Dashboard shows "Finish Cycle" button
3. User clicks → Cycle Transition Modal opens
4. Modal shows:
   - Current training maxes
   - AMRAP performance from cycle
   - Suggested new training maxes
   - Volume/intensity stats
5. User reviews and can adjust TMs
6. Confirms → Profile updated:
   - Cycle increments
   - Week resets to 1
   - Training maxes updated
7. Dashboard refreshes with new cycle
```

#### Workflow 4: Nutrition Tracking

**Trigger**: User logs a meal  
**Path**: Nutrition Tab → Add Meal → Log Macros

```
1. User navigates to "Nutrition" tab
2. Sees daily macro progress bars
3. Clicks "Add Meal" button
4. Enters meal details:
   - Name
   - Macros (calories, protein, carbs, fats)
   - Optional photo
5. Meal added to today's log
6. Progress bars update
7. History shows all meals for date selection
```

#### Workflow 5: Tools Usage

**Trigger**: User needs calculation or timer  
**Path**: Tools Tab → Select Tool → Use Feature

```
Tools Available:
- Plate Calculator: Enter weight → See plate configuration
- 1RM Calculator: Enter weight/reps → Get estimated 1RM
- Warmup Generator: Enter TM → Get warmup sets
- Interval Timer: Set work/rest periods → Run timer
- Gym Finder: Shows nearby gyms (maps integration)
```

## User Experience Goals

### Simplicity

- **Zero Learning Curve**: Onboarding guides through entire setup
- **Clear Navigation**: Bottom tab bar with icon + label
- **Contextual Actions**: Only relevant options shown per screen
- **Smart Defaults**: Sensible presets for all configurations

### Confidence

- **Visual Feedback**: Progress bars, checkmarks, animations
- **Validation**: Prevents errors (can't skip deload, must complete main work)
- **Transparency**: Shows calculation formulas, explains percentages
- **Achievement System**: Positive reinforcement for milestones

### Speed

- **Instant Navigation**: Lazy loading, sub-100ms transitions
- **Quick Actions**: Large touch targets, minimal taps to common actions
- **Auto-calculations**: No manual math ever needed
- **Smart Timers**: Auto-start, voice announcements, background operation

### Motivation

- **Daily Tip System**: Training wisdom on dashboard
- **Achievement Unlocks**: Gamification of progress
- **Visual Progress**: Charts showing strength gains over time
- **Streak Tracking**: Encourages consistency

### Flexibility

- **Customization**: Themes, units, languages, rest timers
- **Program Variants**: Support for different training methodologies
- **Custom Exercises**: Add personal assistance movements
- **Manual Overrides**: Can adjust any weight or rep scheme

## Design Principles

### 1. Workout-First Design

The app exists to facilitate training. Every screen should either:

- Help user prepare for workout
- Track the workout in progress
- Analyze completed workouts
- Plan future training

### 2. Progressive Disclosure

- Show essential info first (weights, reps, rest time)
- Hide advanced options (custom percentages, exercise manager)
- Reveal complexity only when needed (analytics, cycle stats)

### 3. Offline-First Architecture

- All features work without internet
- No loading spinners for core functionality
- Optional cloud features clearly marked (AI Coach)

### 4. Data Ownership

- Users own their data completely
- Export anytime, no vendor lock-in
- Import to migrate or backup
- No account required, no tracking

### 5. Coaching Empowerment

- Coach features don't complicate athlete view
- Clean separation of roles
- Easy client switching
- All athlete features available in client view

## Key Interactions

### Touch Targets

- Minimum 44px × 44px for all interactive elements
- Large buttons for workout actions
- Swipe gestures for history navigation

### Feedback

- Instant visual response to taps
- Haptic feedback for completions (if supported)
- Toast notifications for actions
- Modal confirmations for destructive actions

### Timer Experience

- Large, readable countdown
- Play/pause/reset controls
- Voice announcements at intervals
- Background operation with notifications
- Different timers per exercise type

### Form Inputs

- Number pads for weights/reps
- Steppers for fine adjustments
- Quick presets for common values
- Units shown inline

## Success Metrics

### Engagement

- Daily Active Users (DAU)
- Workouts logged per user per week
- Cycle completion rate
- Feature adoption (tools, nutrition, AI coach)

### Retention

- Week 1 retention (after first workout)
- Month 1 retention (after first cycle)
- Long-term retention (6+ months)

### Value Delivery

- Average strength gains per cycle
- User-reported PRs achieved
- Export/backup usage (data trust)
- PWA install rate

### Quality

- Error rate (localStorage failures, calculation errors)
- Load time (p50, p95)
- Crash rate
- User-reported bugs

## Target Scenarios

### Scenario 1: Beginner Starting 5/3/1

**Context**: New to program, wants guidance  
**App Solves**: Onboarding explains methodology, sets conservative TMs, guides through first workout with clear instructions

### Scenario 2: Experienced Lifter Switching from Spreadsheet

**Context**: Knows program, wants better UX  
**App Solves**: Quick setup, import existing TMs, immediately ready to train with superior tracking

### Scenario 3: Coach with 5+ Clients

**Context**: Managing multiple programs simultaneously  
**App Solves**: Single dashboard to monitor all clients, easy switching, independent histories

### Scenario 4: Traveling Athlete

**Context**: Limited equipment, different gym  
**App Solves**: Plate calculator adapts to available equipment, offline functionality, conditioning alternatives

### Scenario 5: Plateau Breaking

**Context**: Stuck at same weights for cycles  
**App Solves**: AI coach analyzes history, suggests programming adjustments, form checks identify technique issues

## Content Strategy

### Onboarding Content

- Clear explanation of what Titan does
- Brief 5/3/1 methodology overview
- Importance of conservative training maxes
- Program variant explanations

### In-App Guidance

- Daily tips from 5/3/1 philosophy
- Exercise instructions in exercise manager
- YouTube links for video demonstrations
- Tooltips on advanced features

### Error Messages

- Friendly, actionable language
- Explain why action prevented
- Suggest remedy
- Never blame user

### Empty States

- Encouraging first-time messaging
- Clear next steps
- Visual illustration
- Call-to-action button
