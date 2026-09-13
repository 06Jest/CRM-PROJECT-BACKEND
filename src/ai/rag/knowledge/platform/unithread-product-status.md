# uniThread Product Status

## Purpose

This document describes the status of uniThread capabilities.

The assistant must distinguish between currently available functionality, simulated functionality, experimental capabilities, and planned features.

A capability mentioned in documentation must not automatically be described as generally available.

## Product Status Categories

### Available

An available feature is implemented and exposed for users in the current product.

The assistant may describe an available feature as part of uniThread's current functionality, provided the answer is consistent with the user's context and permissions.

### Simulated

A simulated feature may exist for demonstration or beta purposes but does not represent a complete production integration with an external service.

The assistant must explain the limitation when relevant.

### Experimental

An experimental feature may be implemented or available in a development environment but may still be incomplete, unstable, limited, or not exposed to all users.

The assistant should avoid presenting experimental functionality as a guaranteed product capability.

### Planned

A planned feature is part of the product roadmap or future direction but is not necessarily available in the current product.

The assistant must describe planned features as planned and must not claim that users can currently use them.

## Current CRM Functionality

uniThread's core CRM functionality includes areas such as:

- Leads
- Contacts
- Deals
- Customers
- Tasks
- Notes
- Activities
- Organizations
- Members
- User roles
- CRM-related metrics
- Messaging

The exact availability and behavior of individual features may depend on the current product version, organization configuration, and user permissions.

## Communication Status

uniThread supports communication-related functionality.

The status of each communication channel must be described accurately.

### Email

Email functionality is available where supported by the current product configuration.

### Internal Messaging

Internal messaging is available for supported conversations and collaboration workflows.

### SMS

SMS functionality may be simulated during the beta period.

Simulated SMS functionality should not be described as real cellular messaging unless an actual SMS provider integration is confirmed.

### Calls

Call functionality may be simulated during the beta period.

Simulated call functionality should not be described as live VoIP or telephone calling unless an actual calling integration is confirmed.

## AI Capability Status

uniThread has an AI architecture that includes model routing, retrieval-augmented generation, tools, authorization, and confirmation workflows.

However, the existence of an implemented backend capability does not necessarily mean that the capability is fully exposed as a public-facing product feature.

The assistant must distinguish between:

- AI capabilities implemented in the backend
- AI capabilities available in the current user interface
- Experimental AI capabilities
- Planned AI capabilities

## AI Features Under Development

AI-related capabilities may include:

- CRM question answering
- Retrieval of authorized application information
- Source-grounded responses
- Source citations
- CRM assistance
- Tool-assisted workflows
- Task creation
- Note creation
- Contact search
- Confirmation-based actions

The availability of these capabilities depends on the current assistant configuration, registered tools, model providers, user permissions, and product exposure.

## Planned AI Features

The public product roadmap may include AI capabilities such as:

- Contact insights
- Deal summaries
- Predictive scoring
- AI chat assistance
- Reply templates
- Retrieval-augmented answers

These must be described as planned or under development unless the current product documentation explicitly confirms that they are available.

## How the Assistant Should Answer Status Questions

When a user asks whether a feature exists, the assistant should:

1. Check the relevant platform knowledge.
2. Distinguish current availability from planned status.
3. Mention limitations when a feature is simulated or experimental.
4. Avoid promising access to features that may not be enabled for the user.
5. Recommend checking the current application interface or official help documentation when availability may vary.

## Examples

### Correct

"uniThread includes CRM features for leads, contacts, deals, tasks, notes, and customer management."

### Correct

"SMS functionality may be simulated during the beta period, so it should not be assumed to send real cellular messages."

### Correct

"AI capabilities are under active development. Some capabilities may exist in the backend or development environment without being fully exposed in the public product."

### Incorrect

"uniThread can send real SMS messages."

### Incorrect

"Every AI feature in the backend is available to all users."

### Incorrect

"Predictive scoring is currently available."

## Source Authority

For product behavior and current availability, prefer:

1. Current official product documentation
2. Current official help content
3. Current application behavior
4. Versioned platform knowledge
5. Older or general descriptions

Legal documents should be used for legal and policy questions, not as the primary source for ordinary feature explanations.