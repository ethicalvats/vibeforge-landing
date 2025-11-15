Version 1.2.0

Thing Post {
  id: UUID @identity
  slug: String @required @unique @type(slug) @max(60)
  title: String @required @max(120)
  body: Text @required
  category: String @enum(Article,News,Update)
  featured: Boolean @default(false)
  state: PostLifecycle = draft
  publishedAt: Date?
  authorId: UUID @relation(User)
}

Thing Comment {
  id: UUID @identity
  postId: UUID @relation(Post, inverse: comments) @required
  body: Text @required @min(3)
  authorId: UUID @relation(User) @required
  state: CommentLifecycle = pending
  flagged: Boolean @default(false)
}

Thing User {
  id: UUID @identity
  email: String @required @unique @type(email)
  displayName: String @required @max(80)
  role: String @enum(Editor,Author,Moderator)
}

Event Post.created { id: UUID, slug: String, title: String, body: Text, authorId: UUID, category: String }
Event Post.updated { id: UUID, title: String, body: Text, category: String }
Event Post.published { id: UUID, authorId: UUID }
Event Post.unpublished { id: UUID, reason: String? }
Event Post.flagged { id: UUID, moderatorId: UUID, reason: String }
Event Post.deleted { id: UUID, reason: String? }
Event Comment.created { id: UUID, postId: UUID, body: Text, authorId: UUID }
Event Comment.moderated { id: UUID, state: String, moderatorId: UUID }
Event Comment.deleted { id: UUID, reason: String? }

State PostLifecycle { states: [draft, reviewing, published, archived];
  transitions:
    [state->reviewing] on Post.updated;
    [state->published, publishedAt->now] on Post.published guard { user.role == "Editor" };
    [state->draft, publishedAt->null] on Post.unpublished guard { reason != null };
    [state->archived, flagged->true] on Post.flagged guard { moderator.role == "Moderator" };
    [state->archived] on Post.deleted
}

State CommentLifecycle { states: [pending, approved, rejected, removed];
  transitions:
    [state->approved] on Comment.moderated guard { state == "approved" };
    [state->rejected] on Comment.moderated guard { state == "rejected" };
    [state->removed, flagged->false] on Comment.deleted
}

# Notes
- Update routes at `http://localhost:8080` when running `vibekit dev`.
- Change the admin branding by editing files under `Theme/`.