# Vibekit Use Cases: From Basic to Advanced

## Basic Use Cases

### 1. Task Management System

A simple todo list with task states and lifecycle management.

**vibespec.md:**
```markdown
# VibeSpec for TaskManager
Version 1.0.0

Thing Task {
  id: UUID
  title: String @required
  description: Text
  priority: String @enum([low, medium, high]) @default(medium)
  assignee: String
  state: TaskState = pending
  createdAt: DateTime
  completedAt: DateTime
}

Event Task.created { id: UUID, title: String, description: Text, priority: String, assignee: String }
Event Task.started { id: UUID, assignee: String }
Event Task.completed { id: UUID, completedAt: DateTime }
Event Task.reopened { id: UUID }
Event Task.archived { id: UUID }

State TaskState {
  states: [pending, in_progress, completed, archived]
  transitions: 
    [state->in_progress] on Task.started;
    [state->completed, completedAt->completedAt] on Task.completed;
    [state->pending] on Task.reopened guard state == completed;
    [state->archived] on Task.archived
}
```

**Use Case:** Teams can track work items with clear state transitions, ensuring tasks follow a proper workflow.

---

### 2. Event RSVP System

Manage event registrations with capacity limits and waitlists.

**vibespec.md:**
```markdown
# VibeSpec for EventRSVP
Version 1.0.0

Thing Event {
  id: UUID
  name: String @required
  date: DateTime @required
  capacity: Integer @required
  registered: Integer @default(0)
  waitlist: Integer @default(0)
  state: EventState = open
}

Thing Registration {
  id: UUID
  eventId: UUID @relation(Event)
  attendeeName: String @required
  attendeeEmail: String @required
  status: RegistrationStatus = pending
}

Event Event.created { id: UUID, name: String, date: DateTime, capacity: Integer }
Event Registration.submitted { id: UUID, eventId: UUID, attendeeName: String, attendeeEmail: String }
Event Registration.confirmed { id: UUID }
Event Registration.cancelled { id: UUID, eventId: UUID }
Event Event.closed { id: UUID }

State EventState {
  states: [open, full, closed]
  transitions:
    [state->full] on Registration.confirmed guard registered >= capacity;
    [state->closed] on Event.closed
}

State RegistrationStatus {
  states: [pending, confirmed, waitlisted, cancelled]
  transitions:
    [status->confirmed] on Registration.confirmed guard event.registered < event.capacity;
    [status->waitlisted] on Registration.confirmed guard event.registered >= event.capacity;
    [status->cancelled] on Registration.cancelled
}
```

**Use Case:** Conference organizers can manage attendee registrations with automatic waitlist handling when events reach capacity.

---

### 3. Content Moderation Queue

A moderation system for user-generated content with review workflows.

**vibespec.md:**
```markdown
# VibeSpec for ContentModeration
Version 1.0.0

Thing Submission {
  id: UUID
  content: Text @required
  authorId: UUID @required
  category: String @enum([comment, post, review])
  flagCount: Integer @default(0)
  state: ModerationState = pending
  reviewedBy: UUID
  reviewedAt: DateTime
}

Event Submission.created { id: UUID, content: Text, authorId: UUID, category: String }
Event Submission.flagged { id: UUID }
Event Submission.approved { id: UUID, reviewedBy: UUID, reviewedAt: DateTime }
Event Submission.rejected { id: UUID, reviewedBy: UUID, reviewedAt: DateTime, reason: String }
Event Submission.auto_escalated { id: UUID }

State ModerationState {
  states: [pending, under_review, approved, rejected, escalated]
  transitions:
    [state->under_review] on Submission.flagged;
    [state->escalated, flagCount->flagCount+1] on Submission.auto_escalated guard flagCount >= 3;
    [state->approved, reviewedBy->reviewedBy, reviewedAt->reviewedAt] on Submission.approved;
    [state->rejected, reviewedBy->reviewedBy, reviewedAt->reviewedAt] on Submission.rejected
}
```

**Use Case:** Community platforms can automatically route flagged content to moderators and track review decisions.

---
