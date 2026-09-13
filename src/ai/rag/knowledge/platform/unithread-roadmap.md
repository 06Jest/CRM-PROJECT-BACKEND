# uniThread Roadmap

## Document Status

This document is based on the published uniThread roadmap.

The roadmap describes product direction rather than a fixed release contract.
Features may change in scope, priority, design, or implementation. They may
also be delayed, released incrementally, or removed.

Roadmap phases may overlap in practice. No roadmap item should be presented
as currently available unless its status or another authoritative product
source confirms that it has been released.

## Current Product Stage

uniThread is currently in Beta.

The roadmap focuses on expanding the CRM foundation, improving collaboration
and usability, introducing intelligent AI capabilities, improving
performance, and making the overall experience more polished.

## Roadmap Phases

### Foundation

Core data improvements and platform infrastructure.

### Experience

Collaboration, communication, and usability improvements.

### Intelligence

AI-powered insights, summaries, assistants, and retrieval.

### Scale

Performance, realtime infrastructure, caching, search, and administration.

## Feature Status Definitions

### Planned

Part of the roadmap, but development has not started.

### In Development

Implementation has actively started.

### Beta

Available for testing, but may still change.

### Released

Has reached a stable release.

### Future

A longer-term direction without a committed release timeline.

None of these statuses imply a fixed delivery date.

---

# Core Data

The Core Data roadmap focuses on expanding the types of information uniThread
can manage and improving how organizations organize, retain, and analyze
their CRM data.

## Company Records

**Status:** Planned  
**Phase:** Foundation

Dedicated company records that contacts and customers can be associated with,
instead of storing company information only as fields on individual contacts.

Potential capabilities:

- Create and manage companies
- Associate multiple contacts with one company
- Company-level activity history
- Company-associated deals and customers
- Search and filtering by company

## Address Fields

**Status:** Planned  
**Phase:** Foundation

Structured address fields such as street, city, province or state, postal
code, and country instead of a single free-text field.

Potential capabilities:

- Street, city, province or state, postal code, and country
- Consistent formatting across records
- Foundation for future location-based reporting

## Archiving

**Status:** Planned  
**Phase:** Foundation

The ability to remove inactive records from active workflows without
permanently deleting them.

Potentially supported record types include:

- Leads
- Contacts
- Deals
- Customers
- Activities
- Other supported record types

## Notifications

**Status:** Planned  
**Phase:** Foundation

A centralized notification system for events that require a user's attention.

Potential notification events include:

- Assignments
- Task deadlines
- Deal changes
- Invitations
- Mentions
- Activity updates
- System events

## Time Zone Support

**Status:** Planned  
**Phase:** Foundation

Organization-level and user-level time zone handling so timestamps and
deadlines are shown correctly for the person viewing them.

Potential capabilities:

- Organization default time zone
- Per-user time zone preference
- Correct timestamps across the application
- Correct deadlines
- Time-zone-aware scheduling

## Multi-Currency Support

**Status:** Future  
**Phase:** Foundation

Support for organizations that manage deals and customers across more than
one currency.

Potential capabilities:

- Organization default currency
- Per-deal currency
- Currency-aware totals
- Currency formatting
- Multi-currency reporting

## International Phone Numbers

**Status:** Future  
**Phase:** Foundation

Proper support for phone numbers from any country, rather than relying on a
single regional format.

Potential capabilities:

- Country selection
- Dialing codes
- Standardized formatting
- Validation
- Compatibility with future SMS or calling providers

## Leaderboard

**Status:** Future  
**Phase:** Foundation

A team performance view that ranks members across a set of CRM metrics.

Potential metrics include:

- Deals won
- Deal value
- Leads converted
- Customers acquired
- Tasks completed
- Activity volume

The scoring model is expected to change over time so that it rewards real
outcomes rather than raw activity volume.

## Advanced Analytics

**Status:** Future  
**Phase:** Foundation

Analytics that go beyond current dashboard totals into pipeline and
team-level trends.

Potential capabilities:

- Conversion rates
- Sales velocity
- Average deal size
- Win/loss ratio
- Pipeline performance
- Customer acquisition trends
- Team performance
- Historical comparisons

## Bulk Data Migration

**Status:** Planned  
**Phase:** Foundation

Tools to import existing CRM data from other systems or spreadsheets.

Potential capabilities:

- Import from CSV
- Import from spreadsheet exports
- Import from existing CRM systems
- Import from other structured datasets
- Validation and import error reporting

## Calendar View

**Status:** Planned  
**Phase:** Foundation

A calendar-based view of tasks, deadlines, activities, follow-ups, and
scheduled events.

Potential views:

- Daily view
- Weekly view
- Monthly view

## Avatar Uploads

**Status:** In Development  
**Phase:** Foundation

Direct media uploads for user avatars, organization logos, contact images,
and other profile imagery.

Potential capabilities:

- User avatars
- Organization logos
- Contact images
- Other supported profile imagery

---

# Experience

The Experience roadmap focuses on making uniThread feel faster, more
interactive, and more natural for teams using it every day.

## Mute Conversations

**Status:** Planned  
**Phase:** Experience

The ability to mute a conversation without leaving it.

Potential use cases include:

- Completed discussions
- Large group conversations
- Low-priority conversations
- Reference-only conversations

## Typing Indicators

**Status:** Planned  
**Phase:** Experience

A realtime indicator that shows when a teammate is currently typing, such as
"Jest is typing...".

Potential capability:

- Realtime typing indicators in chat threads

## Online Presence

**Status:** Planned  
**Phase:** Experience

Visibility into whether a teammate is currently online, away, offline, or
recently active.

Potential statuses:

- Online
- Away
- Offline
- Recently active

## Email Templates

**Status:** Planned  
**Phase:** Experience

Reusable, editable templates for common outbound emails.

Potential use cases:

- Follow-ups
- Welcome emails
- Meeting confirmations
- Sales outreach
- Customer updates
- Thank-you messages

Templates are expected to remain editable before sending.

## Unread Counts

**Status:** Planned  
**Phase:** Experience

Unread indicators across chat messages, conversations, notifications, and
activity updates.

Potential areas:

- Chat messages
- Conversations
- Notifications
- Activity updates

---

# AI

The AI roadmap focuses on using CRM data to help users understand
customers, make better decisions, and reduce repetitive work.

Every AI feature is expected to respect organization boundaries, user
permissions, privacy, and tenant isolation. An AI feature must not surface
data that a user could not already see.

## Contact Insights

**Status:** Future  
**Phase:** Intelligence

AI-generated summaries and observations about a contact, drawn from existing
CRM activity.

Potential capabilities:

- Recent communication
- Important interaction patterns
- Customer interests
- Follow-up recommendations
- Relationship history

## Deal Summaries

**Status:** Future  
**Phase:** Intelligence

A concise, generated summary of where an active deal stands.

Potential capabilities:

- Current stage
- Deal value
- Recent activity
- Important notes
- Previous interactions
- Potential blockers
- Recommended next action

## Predictive Scoring

**Status:** Future  
**Phase:** Intelligence

Estimated probabilities and risk signals based on historical CRM data.

Potential capabilities:

- Lead conversion probability
- Deal win probability
- Customer risk signals
- Sales prioritization

Meaningful scoring requires enough historical data to train against, so this
capability depends on organizations accumulating usage over time.

## AI Chat Assistant

**Status:** Future  
**Phase:** Intelligence

A natural-language assistant for asking questions about a user's own CRM
data.

Example questions include:

- "Which deals are currently in negotiation?"
- "Summarize this customer's recent activity."
- "Which leads haven't been contacted recently?"

The assistant is expected to access only information that the requesting
user is already authorized to see.

## Reply Templates

**Status:** Future  
**Phase:** Intelligence

AI-assisted drafts for outbound messages, generated from CRM context.

Potential styles or use cases include:

- Professional
- Short
- Follow-up
- Customer response
- Sales response

The user is expected to review and control the final message before it is
sent.

## Retrieval-Augmented Answers

**Status:** Future  
**Phase:** Intelligence

A way for AI to retrieve relevant, organization-specific CRM information
before generating an answer, rather than relying only on general knowledge.

Potential capabilities:

- Answers grounded in actual CRM data
- Questions about CRM records and activity
- Respect for tenant isolation and permissions

Example question:

- "Which customers haven't been contacted in the last 30 days?"

---

# Performance

The Performance roadmap focuses on making uniThread faster and more scalable
as organizations accumulate larger amounts of CRM data.

## Realtime Updates Over WebSocket

**Status:** Planned  
**Phase:** Scale

Expanding realtime behavior across more of the application.

Potential areas:

- Messages
- Deals
- Leads
- Tasks
- Members
- Notifications

## Response Caching

**Status:** Planned  
**Phase:** Scale

Caching for frequently requested, slower-changing data.

Potential areas:

- Organization configuration
- Subscription information
- Static metadata
- Frequently requested dashboard data

Caching must preserve data freshness and strict tenant isolation.

## Paginated Data Tables

**Status:** In Development  
**Phase:** Scale

Loading large datasets in smaller portions instead of loading everything at
once.

Expected benefits:

- Faster initial loading
- Lower memory usage
- Better database performance
- Smoother interaction with large lists

## Search Optimization

**Status:** Planned  
**Phase:** Scale

Improving the speed and relevance of search results across the CRM.

Potential improvements:

- Database indexes
- Better query strategies
- Full-text search
- Search ranking
- Faster filtering

---

# Polish

The Polish roadmap focuses on the small details that make uniThread feel
complete, professional, and enjoyable to use.

## Loading States

**Status:** In Development  
**Phase:** Experience

Consistent loading indicators, skeleton screens, and button and form
loading states throughout the application.

Potential areas:

- Loading indicators
- Skeleton screens
- Button loading states
- Table loading states
- Form submission states

## Micro Animations

**Status:** Planned  
**Phase:** Experience

Subtle motion for cards, buttons, modals, list updates, and navigation.

Potential areas:

- Card transitions
- Buttons
- Modals
- List updates
- Navigation

Motion is intended to remain restrained and respect
`prefers-reduced-motion`.

## Sample Data

**Status:** Planned  
**Phase:** Experience

Automatically adding realistic fictional CRM records when a new organization
is created.

Potential sample data:

- Leads
- Contacts
- Deals
- Customers
- Activities
- Tasks
- Notes
- Dashboard data

The purpose is to help users understand the complete CRM lifecycle before
adding their own data.

## Guided Tutorials

**Status:** Planned  
**Phase:** Experience

Optional onboarding guidance that walks through the core CRM workflow.

The intended workflow is:

Lead → Contact → Deal → Customer

---

# Administration

The Administration roadmap focuses on managing the uniThread platform
itself, rather than managing an individual organization's CRM.

## Super Admin Console

**Status:** Future  
**Phase:** Scale

A separate, platform-level administration environment.

Potential capabilities:

- View organizations
- Manage platform users
- Monitor system health
- Review subscriptions
- Manage platform configuration
- Monitor usage
- Investigate system issues
- Review platform analytics
- Manage reported problems

This is intended to be separate from organization-level Owner, Manager, and
Agent permissions.

---

# Roadmap Philosophy

The roadmap is intentionally flexible. A roadmap item may:

- Change in scope
- Change in priority
- Be redesigned
- Be delayed
- Be released incrementally
- Depend on infrastructure or third-party integrations
- Change based on user feedback

Feature priorities may shift based on:

- User feedback
- Bugs
- Product usage
- Technical constraints
- Security requirements
- Infrastructure maturity
- Business needs

The roadmap describes direction, not a fixed contract or guaranteed release
schedule.