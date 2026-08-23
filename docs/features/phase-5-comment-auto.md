# Phase 5 — Comment Automation

## Goal

Build LinkNest's Comment Automation platform that enables creators to automatically respond to comments on supported social platforms when users mention a configured keyword.

The initial implementation should focus on a simple and reliable workflow:

> User comments `link` → LinkNest detects the keyword → LinkNest automatically replies with the creator's configured message and URL.

The destination URL can be **any valid external URL**. It does not need to be a LinkNest short link, storefront, or product.

This phase should deliver a production-ready automation foundation while keeping the architecture extensible for future AI-powered automation and additional social platforms.

LinkNest does not own, host, or process the products or services represented by the destination URLs. It acts as the automation layer that distributes creator-configured links.

---

# Objectives

The application must allow users to:

- Connect a supported social media account.
- Create multiple comment automations.
- Define trigger keywords.
- Configure custom reply messages.
- Provide any external URL.
- Automatically detect matching comments.
- Automatically reply to matching comments.
- Enable and disable automations.
- Manage multiple automations.
- Track automation activity.
- View automation analytics.
- Prepare the automation architecture for future AI capabilities.

Everything built in this phase should integrate seamlessly with LinkNest accounts and the existing LinkNest analytics system.

---

# Scope

This phase includes:

- Social account connection
- Authentication and authorization
- Comment automation management
- Keyword triggers
- External URLs
- Custom reply messages
- Comment detection
- Automatic comment replies
- Automation status management
- Automation event tracking
- Automation analytics
- Error handling
- Duplicate prevention
- Rate limiting
- Automation logs
- Extensible automation architecture

The initial social platform integration should be based on the current officially supported API capabilities of the target platform.

For the first implementation, Instagram should be treated as the primary platform.

This phase does NOT include:

- AI-powered comment understanding
- AI-generated replies
- AI product recommendations
- AI agents
- Instagram DM automation
- TikTok automation
- YouTube automation
- Facebook automation
- Multi-platform automation
- Social media content publishing
- Social media scheduling
- Social media management
- CRM
- Lead management
- Automatic affiliate-link generation
- Product scraping
- Automatic product discovery

These belong to future phases.

---

# Feature List

---

## Social Account Connection

Users must be able to connect their supported social media account to LinkNest through the platform's official authentication system.

### Features

- Connect Account
- OAuth authentication
- Account authorization
- View connected account
- Disconnect Account
- Connection status
- Token management
- Permission validation
- Connection error handling

LinkNest must never request or store the user's social media password.

For Instagram, the implementation must follow the current Meta/Instagram API requirements and supported account types.

---

## Comment Automation Management

Users can create multiple comment automations.

### Features

- Create Automation
- Edit Automation
- Delete Automation
- Duplicate Automation
- Enable Automation
- Disable Automation
- View Automation
- Automation status
- Automation activity

Example:

```text
Automation: Reel Product Link

Status: Active

Keyword:
link

Reply:
Here you go 👇

URL:
https://www.myntra.com/example
```

---

## Automation Trigger

Each automation contains one or more keywords that can trigger the automation.

### Features

- Trigger Keyword
- Multiple Keywords
- Case-insensitive Matching
- Keyword Matching
- Keyword Validation

Example:

```text
link
```

The system may recognize simple variations such as:

```text
link
LINK
Link
link please
send link
where is the link
```

The initial implementation should use deterministic keyword matching.

AI-based intent detection is intentionally excluded from Phase 5.

---

## External Links

Creators can provide any valid external URL.

The URL does not need to belong to LinkNest.

### Supported Examples

- Amazon
- Flipkart
- Myntra
- Meesho
- Ajio
- Nykaa
- Shopify
- Etsy
- Gumroad
- YouTube
- Personal Websites
- Blogs
- Landing Pages
- Affiliate Links
- Any Valid HTTPS URL

Example:

```text
https://www.amazon.in/example
```

LinkNest should validate the URL before saving it.

LinkNest does not host, sell, or process the external product or service.

---

## Custom Reply Message

Creators should be able to define the message automatically posted in response to matching comments.

### Features

- Custom Reply Text
- Default Reply Templates
- URL Insertion
- Message Preview
- Character Validation

Example:

```text
Here you go 👇

https://www.myntra.com/example
```

Creators should be able to customize the response for each automation.

---

## Automation Builder

The automation creation flow should remain simple.

### Example

```text
Create Comment Automation

Platform
Instagram

Account
@creator

Keyword
link

Reply Message
Here you go 👇

Link
https://www.myntra.com/example

[ Activate Automation ]
```

The creator should be able to create an automation without configuring complex technical settings.

---

## Comment Detection

LinkNest should receive supported comment events through the official platform webhook system.

### Flow

```text
Social Platform
      ↓
New Comment
      ↓
LinkNest Webhook
      ↓
Find Matching Automation
      ↓
Match Keyword
      ↓
Validate Automation
      ↓
Send Reply
```

The system should process events asynchronously where appropriate.

---

## Automatic Comment Reply

When a matching comment is detected, LinkNest should automatically respond to the comment using the configured reply message.

### Example

Viewer:

```text
link please 🔥
```

LinkNest:

```text
Here you go 👇

https://www.myntra.com/example
```

The reply must be sent through the supported official platform API functionality.

---

## Duplicate Prevention

The system must prevent the same comment from being processed multiple times.

Each incoming event should use the platform-provided unique identifier where available.

### Example

```text
Comment ID
Automation ID
Processing Status
Processed At
```

Before processing an event:

```text
Already Processed?
       ↓
     YES → Ignore
       ↓
      NO → Process
```

This prevents duplicate replies caused by webhook retries or duplicate events.

---

## Spam Protection

The system should protect both LinkNest and the creator's social account from excessive automated replies.

### Features

- Per-user cooldown
- Per-post limits
- Automation rate limits
- Duplicate detection
- Abuse protection
- Automatic temporary pause when limits are exceeded

Example rule:

> Do not respond to the same user more than once for the same post within the configured cooldown period.

---

## Automation Status

Each automation should have a clear state.

### States

- Draft
- Active
- Paused
- Error
- Disabled

Creators should be able to activate or pause an automation without deleting it.

---

## Automation Activity

Creators should be able to see what happened with each automation.

### Track

- Comment Received
- Keyword Matched
- Reply Attempted
- Reply Successful
- Reply Failed
- Duplicate Event
- Rate Limit Event
- Error

Example:

```text
Recent Activity

@user123
"link please"
✓ Reply Sent

@user456
"send link"
✓ Reply Sent

@user789
"link"
✗ Reply Failed
```

---

# Analytics

Every automation should collect engagement data.

### Track

- Comments Received
- Keyword Matches
- Replies Attempted
- Successful Replies
- Failed Replies
- Unique Users
- Top Performing Automations
- Automation Activity Over Time
- Error Rate

### Reports

- Last 24 Hours
- Last 7 Days
- Last 30 Days
- All Time

---

## LinkNest Analytics Integration

Where possible, automation analytics should integrate with LinkNest's existing link analytics.

If a creator chooses to use a LinkNest short link:

```text
Instagram Comment
       ↓
Automatic Reply
       ↓
LinkNest Short Link
       ↓
Link Click
       ↓
LinkNest Analytics
```

LinkNest can track the resulting click.

However, using a LinkNest short link is optional.

The automation must also work with ordinary external URLs.

---

# Automation Organization

Creators should be able to manage multiple automations.

### Features

- Search Automations
- Filter by Status
- Sort by Activity
- Sort by Creation Date
- Duplicate Automation
- Bulk Enable
- Bulk Disable
- Delete Automation

Example:

```text
My Automations

┌──────────────────────────────┐
│ Gym Shoes                    │
│ Keyword: link                │
│ Status: Active               │
│ Replies: 428                 │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Camera Setup                 │
│ Keyword: camera              │
│ Status: Active               │
│ Replies: 193                 │
└──────────────────────────────┘
```

---

# Webhook System

The backend must provide secure webhook endpoints for supported social platform events.

### Requirements

- Webhook Verification
- Event Validation
- Event Parsing
- Idempotency
- Retry Handling
- Error Logging
- Event Processing
- Monitoring

The webhook implementation must follow the current official platform API documentation.

---

# Authentication & Security

The system must securely handle social platform authentication credentials and access tokens.

### Requirements

- OAuth Authentication
- Secure Token Storage
- Token Encryption Where Appropriate
- Token Expiration Handling
- Permission Validation
- Account Disconnection
- Unauthorized Request Protection
- Webhook Verification
- API Credential Protection

Social media passwords must never be requested or stored by LinkNest.

---

# Error Handling

The system must gracefully handle failures.

### Possible Errors

- Social account disconnected
- Invalid or expired access token
- Missing permissions
- Platform API unavailable
- Webhook failure
- Comment reply failure
- Rate limit
- Invalid automation configuration
- Invalid URL
- Automation disabled

Creators should receive a clear error state rather than silently failing.

---

# AI-Agent Readiness

Phase 5 should **not implement AI agents**.

However, the automation system must be designed so that future AI capabilities can be added without rewriting the core automation infrastructure.

The initial automation pipeline should be modular:

```text
Incoming Event
      ↓
Event Normalization
      ↓
Trigger Evaluation
      ↓
Automation Decision
      ↓
Action Execution
      ↓
Result Tracking
      ↓
Analytics
```

The trigger evaluation layer should be replaceable or extensible.

### Phase 5

```text
Comment
   ↓
Keyword Matcher
   ↓
Match / No Match
   ↓
Reply
```

### Future AI Automation

```text
Comment
   ↓
Comment Understanding Agent
   ↓
Intent Detection
   ↓
Automation Decision
   ↓
Context / Knowledge
   ↓
Action
   ↓
Reply
```

This means future AI functionality can be introduced as an additional decision layer rather than tightly coupling an LLM to the existing webhook system.

---

## Future AI Capabilities

The following are intentionally reserved for future AI-agent phases:

### AI Intent Detection

Understand comments such as:

```text
"where can I get this?"

"send me this"

"how much is it?"

"where is the link?"

"can you send this to me?"
```

and determine whether the user is requesting a configured link.

### AI Reply Generation

Generate natural responses based on creator-configured rules.

### AI Automation Agent

A future agent could:

```text
Receive Comment
      ↓
Understand Intent
      ↓
Identify Relevant Automation
      ↓
Select Link
      ↓
Generate Response
      ↓
Execute Reply
      ↓
Verify Result
```

### Important Rule

AI should not bypass the existing safety, permissions, rate limits, validation, or platform API constraints.

AI should operate **inside** the existing automation infrastructure.

---

# Functional Requirements

Users must be able to:

- Connect a supported social media account.
- Disconnect a connected account.
- Create multiple comment automations.
- Configure keywords.
- Configure custom reply messages.
- Add any valid external URL.
- Enable and disable automations.
- Receive supported comment events.
- Automatically reply to matching comments.
- Prevent duplicate replies.
- Apply rate limits and cooldowns.
- View automation activity.
- View automation analytics.
- Edit automations.
- Duplicate automations.
- Delete automations.

---

# Non-Functional Requirements

The application should be:

- Fast
- Responsive
- Mobile Friendly
- Secure
- Reliable
- Scalable
- Maintainable
- Production Ready

The automation system should also be:

- Idempotent
- Fault Tolerant
- Rate Limited
- Observable
- API Compliant
- Extensible
- AI-Agent Ready

---

# Phase Rules

While building Phase 5:

- Use only official platform APIs.
- Never request or store social media passwords.
- Follow current platform policies.
- Verify API capabilities before implementing dependent functionality.
- Build one feature completely before starting another.
- Keep automation logic modular.
- Keep webhook processing separate from business logic.
- Validate every input.
- Validate every external URL.
- Prevent duplicate processing.
- Implement rate limiting.
- Handle API failures gracefully.
- Secure all access tokens and credentials.
- Log automation events without storing unnecessary personal data.
- Never send an automated response without a valid configured trigger.
- Never assume a platform API capability without verifying current official documentation.
- Do not introduce AI agents into Phase 5.
- Keep the automation engine extensible for future AI integration.
- Follow the project rules document.
- Follow the tech stack document.
- Follow the database document.

---

# Development Order

1. Social Platform Integration

2. Account Authentication

3. Automation Management

4. Automation Configuration

5. Webhook System

6. Automation Engine

7. Automatic Replies

8. Duplicate Prevention & Rate Limiting

9. Activity & Logs

10. Analytics

11. Testing

12. Polish

---

# Completion Criteria

Phase 5 is complete when:

- Users can connect their supported social accounts.
- Users can create multiple comment automations.
- Users can configure keywords.
- Users can configure custom reply messages.
- Users can provide any valid external URL.
- Supported comments are received through webhooks.
- Matching comments trigger automatic replies.
- Duplicate events cannot produce duplicate replies.
- Rate limits and cooldowns are implemented.
- Automation failures are handled correctly.
- Automation activity is visible.
- Automation analytics are available.
- Automations can be enabled and disabled.
- Social platform credentials and tokens are securely handled.
- Current platform API requirements are satisfied.
- The automation engine is modular and extensible.
- The system is ready for future AI-agent integration.
- No major bugs remain.
- Documentation is updated.

---

# Out of Scope

The following features are intentionally excluded from Phase 5:

- AI Comment Understanding
- AI Intent Detection
- AI-Generated Replies
- AI Product Recommendations
- AI Automation Agents
- Instagram DM Automation
- TikTok Automation
- YouTube Automation
- Facebook Automation
- Multi-Platform Automation
- Social Media Scheduling
- Social Media Publishing
- Social Media Inbox
- CRM
- Lead Management
- Automatic Affiliate-Link Generation
- Product Scraping
- Automatic Product Discovery
- Autonomous AI Agents

These can be implemented in future phases if required.
