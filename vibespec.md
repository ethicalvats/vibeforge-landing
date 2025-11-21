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


Thing User {
  id: UUID @identity
  email: String @required @unique @type(email)
  displayName: String @required @max(80)
  role: String @enum(Editor,Author,Moderator)
}

Thing Page @themePage(directory: pages, slugField: slug, titleField: title) {
  id: UUID @identity
  slug: String @required @unique @type(slug) @max(80)
  title: String @required @max(140)
  summary: String @max(240)
  body: Editor @required
  menuLabel: String? @default("Main")
}

Event Post.created { id: UUID, slug: String, title: String, body: Text, authorId: UUID, category: String }
Event Post.updated { id: UUID, title: String, body: Text, category: String }
Event Post.published { id: UUID, authorId: UUID }
Event Post.unpublished { id: UUID, reason: String? }
Event Post.flagged { id: UUID, moderatorId: UUID, reason: String }
Event Post.deleted { id: UUID, reason: String? }

State PostLifecycle { states: [draft, reviewing, published, archived];
  transitions:
    [state->reviewing] on Post.updated;
    [state->published, publishedAt->now] on Post.published guard { user.role == "Editor" };
    [state->draft, publishedAt->null] on Post.unpublished guard { reason != null };
    [state->archived, flagged->true] on Post.flagged guard { moderator.role == "Moderator" };
    [state->archived] on Post.deleted
}
