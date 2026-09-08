# Job Hunt Agent — AI Career Operating System

**Built for:** Neeraj Prakash  
**Target Role:** AI Product Manager, GenAI PM, ML Product Manager  
**Status:** V1 MVP in development

## Product Vision

An intelligent job-search platform that continuously finds relevant jobs, evaluates them against your profile, creates tailored CVs, prepares applications, tracks outcomes, and learns from every interaction.

**Core Loop:**  
Discover → Understand → Score → Tailor → Validate → Apply → Track → Learn → Improve

## Architecture

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** Postgres + Drizzle ORM
- **AI:** Anthropic Claude (via Vercel AI SDK)
- **UI:** React 19, Tailwind CSS, Framer Motion
- **Deployment:** Vercel

### Agents
- `JobDiscoveryAgent` — Finds jobs across platforms
- `JobParsingAgent` — Extracts structured data from JDs
- `JobScoringAgent` — Scores fit 0-100
- `CompanyResearchAgent` — Gathers company intelligence
- `CVTailoringAgent` — Creates role-specific CVs
- `ATSAgent` — Optimizes for ATS systems
- `ApplicationAgent` — Assists with applications
- `AnalyticsAgent` — Tracks performance
- `LearningAgent` — Improves over time

### Database Schema
```
Candidate → CandidateEvidence → Experience → Achievement
Job → Company → JobScore → CompanyResearch
CV → CVVersion → Application → ApplicationEvent
Interview → Outreach → AgentRun
```

## MVP Roadmap

### V1 (Current)
✅ Project setup  
✅ Database schema  
🔄 Candidate DNA engine  
🔄 Job discovery  
🔄 Job scoring  
🔄 CV tailoring  
🔄 Application tracker  

### V2
⏳ Browser automation  
⏳ Application answers  
⏳ Human approval flow  

### V3
⏳ Company research  
⏳ Outreach generation  
⏳ Interview prep  

### V4
⏳ Analytics dashboard  
⏳ Learning engine  
⏳ Autonomous optimization  

## Non-Negotiables

1. **Never fabricate candidate experience**
2. **Never fabricate metrics**
3. **Optimize for interviews, not applications**
4. **Explain every recommendation**
5. **Keep user in control of high-impact actions**

## North Star Metric

> **Qualified Interview Rate**

Track: Jobs → Applications → Responses → Interviews → Offers

Goal: Get hired into the best AI PM role with minimum high-quality applications.

## Development

```bash
# Install
npm install

# Setup database
npm run db:push

# Dev server
npm run dev

# Open http://localhost:3001
```

## License

Private — Built for Neeraj Prakash
