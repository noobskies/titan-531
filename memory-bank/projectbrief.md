# Project Brief - Titan 531

## Project Identity

**Name:** Titan 531  
**Type:** Cross-platform mobile-first workout tracking application  
**Primary Platform:** Android (with iOS and Web/PWA capability)  
**Core Methodology:** 5/3/1 strength training program by Jim Wendler

## Mission

Build a comprehensive, gym-optimized workout tracking app that makes following the 5/3/1 methodology effortless, accessible, and motivating. Provide both free and premium experiences that cater to beginners and advanced lifters alike.

## Core Problems Solved

1. **Complexity Barrier:** 5/3/1 requires percentage calculations, cycle planning, and progression tracking - manual tracking is error-prone
2. **Gym Usability:** Existing apps aren't optimized for gym environments (small text, difficult to use with sweaty hands, poor one-handed operation)
3. **Fragmented Tools:** Users juggle multiple apps/spreadsheets for program planning, workout logging, and progress tracking
4. **Lack of Guidance:** New lifters struggle to understand 5/3/1 variations and when to apply them

## Target Users

### Primary: Intermediate Lifters (60% of users)

- 1-3 years lifting experience
- Familiar with basic 5/3/1 concepts
- Want structured progression without overthinking
- Need reliable tracking and clear next steps

### Secondary: Advanced Lifters (25% of users)

- 3+ years experience
- Want program customization and detailed analytics
- Premium feature adopters
- May become coaches using the app

### Tertiary: Beginners (15% of users)

- New to structured programs or 5/3/1
- Need extensive guidance and education
- High onboarding needs
- Convert to intermediate users over time

## Core Requirements

### Must-Have (MVP - Free Tier)

1. User authentication and profiles
2. Training Max (TM) setup and management
3. Original 5/3/1 program implementation
4. Workout logging with set tracking
5. AMRAP set recording with rep counter
6. Rest timer with notifications
7. Plate calculator
8. Last 30 days of workout history
9. Mobile-optimized, gym-friendly UI

### Premium Features (Paid Tier)

1. All 5/3/1 variations (BBB, FSL, Triumvirate, etc.)
2. Custom program builder
3. Unlimited workout history
4. Advanced analytics and progress graphs
5. RPE/RIR tracking
6. Body measurements and progress photos
7. Cloud sync across devices
8. Custom exercises with video uploads
9. Export capabilities (CSV, PDF, JSON)

### Coach/Pro Tier

1. Client management (up to 10 clients)
2. Program assignment tools
3. Client progress monitoring
4. In-app messaging
5. Custom branding options

## Technical Constraints

### Performance Targets

- App launch: <2 seconds cold start
- Workout logging: <100ms response time
- Works fully offline for core features
- Battery efficient during workouts
- <100MB RAM usage
- <50MB app size

### Platform Requirements

- Android 8.0+ (API 26+)
- iOS 13+ (future)
- Modern web browsers for PWA
- Responsive design: 320px (mobile) to 1024px+ (desktop)

### Development Constraints

- Single codebase for all platforms
- TypeScript for type safety
- No native mobile development (use Capacitor)
- Rapid iteration capability

## Success Metrics

### User Engagement

- Daily Active Users (DAU) / Monthly Active Users (MAU) ratio
- Workout completion rate
- Average workouts per week per user
- User retention (Day 1, Week 1, Month 1, Month 3)

### Conversion

- Free to Premium conversion rate (target: 5-10%)
- Trial to paid conversion
- Premium user retention

### Quality

- App store rating (target: 4.5+)
- Crash-free sessions (target: 99.5%+)
- Average workout logging time
- User support ticket volume

## Competitive Landscape

### Direct Competitors

- **Strong:** Free, but limited features and poor UX
- **531 Training Log:** Good functionality, outdated UI
- **Personal Training Coach:** Feature-rich but complex

### Differentiation

1. **Gym-Optimized UX:** Extra-large touch targets, high contrast, one-handed operation
2. **Modern Tech Stack:** Fast, reliable, beautiful Material Design
3. **Smart Defaults:** Intelligent suggestions reduce decision fatigue
4. **Comprehensive Free Tier:** Original 5/3/1 is completely free forever
5. **Fair Premium:** Unlock all variations and analytics for reasonable monthly fee

## Monetization Strategy

### Free Tier

- Original 5/3/1 program (unlimited use)
- Basic workout logging
- 30-day history
- Plate calculator and rest timer
- Local device storage only

### Premium ($4.99-7.99/month or $39.99-49.99/year)

- All program variations
- Custom program builder
- Unlimited history
- Advanced analytics
- Cloud sync
- Custom exercises
- Export capabilities
- Priority support

### Coach/Pro ($14.99/month)

- All Premium features
- Up to 10 client profiles
- Client management dashboard
- Program assignment
- Progress monitoring

## Project Phases

### Phase 1: Foundation (Weeks 1-3) ✅

Project setup, authentication, theme, basic routing

### Phase 2: Core Features (Weeks 4-8)

Onboarding, TM setup, Original 5/3/1, workout interface, logging

### Phase 3: Premium Features (Weeks 9-12)

Program variations, customization, analytics, cloud sync, IAP

### Phase 4: Polish & Testing (Weeks 13-15)

UI/UX refinement, performance optimization, beta testing

### Phase 5: Launch (Week 16)

Google Play submission, marketing, support systems

## Design Philosophy

### Gym-First Design Principles

1. **Large Touch Targets:** Minimum 48px, prefer 64px for primary actions
2. **High Visibility:** Bold typography, high contrast, clear hierarchy
3. **One-Handed Operation:** Bottom navigation, strategic FAB placement
4. **Minimal Distractions:** Clean interface during active workouts
5. **Immediate Feedback:** Visual and haptic responses to all actions
6. **Sweat-Proof:** Extra spacing, large inputs, obvious affordances

### Development Principles

1. **Mobile-First:** Design for 320-768px screens primarily
2. **Progressive Enhancement:** Add tablet/desktop features progressively
3. **Offline-First:** Core features work without internet
4. **Data Integrity:** Never lose user data, robust backup systems
5. **Performance:** Fast interactions, efficient rendering, minimal battery drain

## Out of Scope (Post-MVP)

- AI form checking via camera
- Fitness tracker integration (Fitbit, Garmin)
- Nutrition tracking
- Other training methodologies (Westside, GZCL)
- Wear OS app (Phase 2 feature)
- Social/community features (evaluate post-launch)
- iOS polish (basic Capacitor support only initially)

## Key Stakeholders

- **Product Owner:** Project lead defining vision and priorities
- **Development Team:** Building the application
- **Beta Testers:** 5/3/1 practitioners providing feedback
- **End Users:** Lifters of all experience levels

## Success Definition

**MVP Success:**

- 1,000+ downloads in first month
- 4.0+ app store rating
- 70%+ Day 1 retention
- 40%+ Week 1 retention
- <5% crash rate
- Core workout flow working smoothly

**Long-term Success:**

- 50,000+ active users
- 5-10% premium conversion
- 4.5+ app store rating
- Self-sustaining revenue covering costs
- Active community of engaged users
- Recognized as top 5/3/1 app
