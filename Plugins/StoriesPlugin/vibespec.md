Thing Story {
  id: UUID @identity
  slug: String @required @unique @type(slug) @max(80)
  title: String @required @max(140)
  intro: Text?
  blurTint: String?
}

Thing StorySlide {
  id: UUID @identity
  storyId: UUID @relation(Story)
  sequence: Int @default(0)
  headline: String @required @max(160)
  body: Text
  backgroundAsset: String @required
}
