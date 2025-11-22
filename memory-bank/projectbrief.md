# Project Brief: Titan 5/3/1

## Project Overview

**Titan 5/3/1** is a Progressive Web Application (PWA) designed to track and manage strength training using Jim Wendler's 5/3/1 methodology. The application provides comprehensive workout tracking, cycle management, AI-powered coaching insights, nutrition logging, and various training tools.

**Version:** 1.2.1  
**Repository:** git@github.com:noobskies/titan-531.git  
**AI Studio Link:** https://ai.studio/apps/drive/1eb1VjVKNv6CMp91c9XnK5dtj79gTv5fQ

## Core Purpose

Enable strength athletes to follow structured 5/3/1 training programs with:

- Precise workout tracking and progression
- Multiple program variants (BBB, FSL, Beginner, BBS, Monolith)
- Real-time coaching feedback using AI
- Comprehensive analytics and progress visualization
- Multi-client coaching capabilities

## Target Users

### Primary Users

1. **Individual Athletes** - Following 5/3/1 programs for strength development
2. **Coaches** - Managing multiple clients' training programs
3. **Beginners** - Learning proper strength training progression

### User Goals

- Track training maxes and progress over cycles
- Follow structured programming without guesswork
- Understand form and technique through AI coaching
- Monitor nutrition and body metrics
- Visualize long-term progress

## Core Requirements

### Functional Requirements

1. **Workout Management**

   - Create and track workouts for 4 main lifts (Squat, Bench, Deadlift, Overhead Press)
   - Support multiple program variants with different supplemental schemes
   - Calculate working weights based on training maxes
   - Track AMRAP (As Many Reps As Possible) sets
   - Log conditioning workouts

2. **Cycle & Progression Management**

   - 4-week cycle structure (3 working weeks + 1 deload)
   - Automatic weight progression between cycles
   - Training max adjustments based on performance
   - Custom progression schemes (Standard vs Performance)

3. **AI Coaching**

   - Form check analysis using Gemini Vision API
   - Workout insights and recommendations
   - Performance analysis based on history

4. **Analytics & Tracking**

   - Workout history with calendar view
   - Body metric tracking (weight, measurements)
   - Progress photos
   - Achievement system
   - Volume/intensity analytics with charts

5. **Nutrition**

   - Macro tracking (calories, protein, carbs, fats)
   - Meal logging with photos
   - Daily nutrition goals

6. **Tools**

   - Plate calculator with custom inventory support
   - One-rep max calculator
   - Warmup generator
   - Interval timer
   - Gym finder

7. **Coach Mode**
   - Manage multiple client profiles
   - Switch between client views
   - Track client progress independently

### Technical Requirements

1. **Platform**: PWA for cross-platform support
2. **Offline**: Full offline functionality with localStorage
3. **Performance**: Fast load times, lazy loading of major views
4. **Accessibility**: Responsive design, clear navigation
5. **Data**: Export/import functionality for backup
6. **Customization**: Themes, units (lbs/kg), language support (en/es/fr)

## Scope Boundaries

### In Scope

- 5/3/1 program variants and core methodology
- Main lifts and standard assistance work
- AI-powered coaching insights
- Comprehensive tracking and analytics
- Multi-user coaching capabilities
- PWA installation and offline support

### Out of Scope

- Social features (sharing, community)
- Payment/subscription management (premium is demo-unlocked)
- Integration with external fitness platforms
- Video recording/storage (uses external YouTube links)
- Backend server/cloud sync (localStorage only)

## Success Criteria

1. **Usability**: Users can complete full workout cycle without external resources
2. **Accuracy**: Weight calculations match 5/3/1 methodology precisely
3. **Performance**: App loads in <2 seconds, instant navigation
4. **Reliability**: No data loss, successful export/import
5. **Coaching**: AI provides actionable feedback on form and programming
6. **Adoption**: PWA installable on all major platforms

## Technical Constraints

1. **No Backend**: All data stored in localStorage
2. **API Keys**: Gemini API key required for AI features (user-provided)
3. **Browser Support**: Modern browsers with ES modules support
4. **Storage Limits**: LocalStorage 5-10MB typical limit
5. **Image Handling**: Base64 encoding for photos (storage impact)

## Key Stakeholders

- **Development**: Solo developer (noobskies)
- **Users**: Strength training athletes, coaches
- **External Services**: Google Gemini AI for coaching features

## Project Constraints

### Time

- Feature-complete at v1.2.1
- Maintenance and enhancement mode

### Budget

- Free tier Gemini API usage
- No hosting costs (static PWA)

### Technical

- Client-side only architecture
- No real-time sync across devices
- Storage limitations for media

## Risk Factors

1. **Data Loss**: LocalStorage can be cleared by users
   - Mitigation: Export/import functionality
2. **API Limits**: Gemini API rate limits or quota
   - Mitigation: Graceful degradation, error handling
3. **Browser Compatibility**: PWA features vary by platform
   - Mitigation: Progressive enhancement approach
4. **Storage Limits**: Many photos/meals could exceed localStorage
   - Mitigation: User education, compression considerations

## Future Considerations

- Cloud sync/backup options
- Advanced analytics with ML insights
- Program builder for custom templates
- Integration with wearables
- Social/community features
- Video analysis capabilities
