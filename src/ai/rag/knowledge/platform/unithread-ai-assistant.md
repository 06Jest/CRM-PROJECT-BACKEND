# uniThread AI Assistant

## Overview

uniThread includes an AI assistant architecture designed to help users understand CRM information and work with supported CRM workflows.

The AI system combines language models, retrieval-augmented generation (RAG), application tools, authorization checks, and confirmation workflows.

The assistant should provide useful answers while respecting the user's identity, organization context, permissions, and available application data.

## AI Assistant Responsibilities

The AI assistant can be used to:

- Answer questions about CRM concepts
- Explain uniThread functionality
- Help users understand CRM records
- Retrieve relevant information from authorized application data
- Summarize retrieved CRM information
- Assist with supported CRM workflows
- Provide sales and customer-management guidance
- Use supported tools for application operations
- Request confirmation before executing sensitive or state-changing actions

The exact capabilities available depend on the selected assistant, registered tools, model provider, and current product implementation.

## AI Assistant Types

### CRM Assistant

The CRM Assistant is a platform-scoped assistant.

Its purpose is to answer questions about:

- uniThread
- Product features
- Product behavior
- CRM concepts
- General CRM workflows
- Sales and customer-management guidance
- Platform-level documentation

Examples:

- What does uniThread do?
- What features are available?
- What is a CRM pipeline?
- How does lead management work?
- What can the uniThread AI assistant do?

The CRM Assistant should use platform knowledge and should not claim access to private organization records unless an explicitly authorized capability provides that access.

### Organization Assistant

The Organization Assistant works with organization-scoped CRM information.

It may help users understand or work with data belonging to their organization, subject to authorization and role permissions.

Examples:

- What are our organization's open leads?
- Summarize our current deals.
- What tasks are assigned within our organization?
- Show recent organization activities.

The Organization Assistant must not expose information outside the user's authorized organization context.

### Personal Assistant

The Personal Assistant works with profile-scoped information belonging to the user.

Examples:

- What tasks are assigned to me?
- Show my notes.
- Summarize my recent activities.
- Help me organize my follow-ups.

The Personal Assistant must respect profile ownership and the application's authorization rules.

## Retrieval-Augmented Generation

uniThread uses retrieval-augmented generation to provide models with relevant reference information before generating an answer.

The RAG process includes:

1. Receive a user question
2. Determine the relevant scope and context
3. Generate an embedding for the query
4. Search authorized vector data
5. Retrieve relevant document chunks
6. Build a numbered reference context
7. Provide the context to the language model
8. Generate an answer based on the retrieved information
9. Parse supported source citations
10. Return the answer and structured source information

RAG helps the assistant answer questions using application-specific information instead of relying only on the model's general training knowledge.

## Platform Knowledge

Platform-scoped RAG is intended for information about uniThread itself.

Platform knowledge may include:

- Product overview
- Feature documentation
- User help content
- AI capability documentation
- Role and workspace explanations
- Product status
- Public product FAQs

Platform knowledge should not contain private customer records or organization-specific CRM data.

## Organization Knowledge

Organization-scoped RAG is intended for information belonging to a specific organization.

Examples may include:

- Organization notes
- Organization-related CRM records
- Organization documentation
- Organization workflows
- Organization-specific information

Organization-scoped retrieval must apply the correct organization filter and must respect backend authorization and database security policies.

## Profile Knowledge

Profile-scoped RAG is intended for information belonging to an individual user.

Examples may include:

- Personal notes
- Personal tasks
- Personal activities
- Profile-specific information

Profile-scoped retrieval must apply the correct profile filter and must not expose another user's private information.

## Source Citations

When retrieved context supports a factual answer, the assistant may cite the relevant source using the format:

[Source N]

The source number corresponds to the numbered source in the retrieved context.

A response may cite multiple sources when a claim is supported by more than one source:

[Source 1] [Source 2]

The system can return structured citation information alongside the generated message. Structured citation data may include:

- Source index
- Source identifier
- Source type
- Source title
- Chunk index
- Similarity score

The assistant must not invent source numbers or cite sources that were not retrieved.

## Grounding and Reliability

The assistant should not invent CRM data, product functionality, or application behavior.

When the available context does not contain enough information, the assistant should clearly state that the information is unavailable or insufficient.

Retrieved content is reference material and should not override:

- System instructions
- Authorization rules
- Tool permissions
- Confirmation requirements
- Application security policies

The assistant should distinguish between:

- Information retrieved from authorized application data
- General CRM knowledge
- Product documentation
- Inferences or recommendations

## Tools and Actions

The AI system can support application tools for operations such as:

- Searching contacts
- Creating notes
- Creating tasks

The exact available tools depend on the registered tool set and the selected assistant.

Read-only operations may be handled differently from state-changing operations.

Actions that create or modify application data may require explicit confirmation before execution.

## Confirmation Workflow

For actions that require confirmation, the assistant should:

1. Identify the intended tool operation
2. Prepare the tool arguments
3. Create a confirmation request
4. Return the confirmation request to the user
5. Wait for explicit approval
6. Recheck authorization before execution
7. Execute the operation only after confirmation
8. Return the execution result

A generated tool call does not automatically mean that the operation has been executed.

## Model Routing and Fallbacks

uniThread's AI architecture supports multiple model providers through a model routing layer.

The routing system may attempt an available model provider and fall back to another configured provider if the selected provider fails or is unavailable.

Supported providers may include:

- Gemini
- Groq
- Cloudflare
- Mistral
- OpenRouter
- Local Ollama models

The exact provider order and available models depend on the current application configuration.

## Security Boundaries

The AI assistant must not be treated as a replacement for application authorization.

Every operation involving private CRM data or state-changing actions must remain subject to:

- User authentication
- Organization membership
- User role
- Backend authorization
- Tool-level authorization
- Database-level security policies
- Confirmation requirements where applicable

The assistant must not reveal private data merely because a user asks for it in natural language.

## Current Implementation Status

The AI system is under active development.

Some AI capabilities may be available in the backend architecture or development environment without being exposed as complete public-facing product features.

The assistant should distinguish between:

- Implemented backend capabilities
- Publicly available user-facing capabilities
- Experimental capabilities
- Planned roadmap features

It must not describe an experimental or planned capability as generally available without confirmation.