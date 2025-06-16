# ProxScr Repli - Social Media Automation Platform

## Overview

ProxScr Repli is a sophisticated social media automation platform designed to discover trending cryptocurrency topics, find high-engagement posts, and generate follower-attracting replies. The system leverages live data from CoinGecko and Reddit to identify profitable opportunities in the crypto social media space.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and bundling

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Socket.io for WebSocket connections
- **AI Integration**: OpenAI API for content generation
- **Proxy Management**: GitHub-integrated proxy rotation system

## Key Components

### Data Collection System
- **Trending Keyword Finder**: Discovers trending crypto keywords from CoinGecko API
- **Reddit Scraper**: Collects high-engagement posts from crypto subreddits
- **Twitter Post Finder**: Identifies viral tweets with 20+ replies threshold
- **Real Data Scraper**: Processes authentic cryptocurrency discussions

### AI Content Generation
- **Follower-Focused Replies**: Generates witty, engaging responses designed to attract followers
- **Quality Analysis**: Scores content based on relevance, engagement potential, safety, and creativity
- **Content Approval Queue**: Manual review system for AI-generated content
- **Multiple Content Types**: Supports replies, memes, and standalone posts

### Proxy Management
- **GitHub Integration**: Syncs proxies from `marline777/proxscr_repli` repository
- **Rotation System**: Automatic proxy rotation to avoid rate limits
- **Health Monitoring**: Tracks proxy performance and success rates
- **Replit Validator**: Validates proxies using external validation service

### Workflow Automation
- **Complete Workflow**: Reddit trends → Twitter posts → AI replies pipeline
- **Engagement Filtering**: Targets posts with minimum 20 replies for maximum reach
- **Safety Controls**: Built-in emergency stop and content moderation
- **Real-time Monitoring**: Live activity feeds and performance metrics

## Data Flow

1. **Discovery Phase**: System fetches trending crypto keywords from CoinGecko
2. **Collection Phase**: Scrapes Reddit crypto communities for high-engagement discussions
3. **Analysis Phase**: Filters posts based on engagement thresholds (20+ replies)
4. **Generation Phase**: AI creates follower-attracting replies using OpenAI API
5. **Review Phase**: Content enters approval queue for manual review
6. **Execution Phase**: Approved content is posted to social media platforms

## External Dependencies

### APIs and Services
- **CoinGecko API**: Live cryptocurrency data and trending tokens
- **OpenAI API**: AI content generation (GPT-4o model)
- **GitHub API**: Proxy repository synchronization
- **CodeValidator**: Proxy validation service

### Database and Infrastructure
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Replit Environment**: Development and deployment platform
- **Node.js Modules**: Express, Drizzle ORM, Socket.io

### UI Components
- **Radix UI**: Accessible component primitives
- **Recharts**: Data visualization and analytics
- **Lucide Icons**: Modern icon library

## Deployment Strategy

- **Development**: Hot-reload with Vite and tsx
- **Build Process**: TypeScript compilation + Vite bundling
- **Production**: Node.js server with static file serving
- **Database**: Automated migrations with Drizzle Kit
- **Environment**: Replit autoscale deployment

## Changelog

- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.