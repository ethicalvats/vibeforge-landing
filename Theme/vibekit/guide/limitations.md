
# ❌ When Vibekit is NOT a Good Fit

## 1. Real-Time Collaborative Applications

**Examples:** Google Docs, Figma, Multiplayer Games, Live Whiteboards

**Why Vibekit Struggles:**
- **Event Latency**: Every action goes through event emission → state transition → store update. This adds overhead for sub-100ms interaction requirements
- **Operational Transform Complexity**: Vibekit's linear event log doesn't handle concurrent edits well. You'd need complex conflict resolution that the state machine model doesn't provide
- **WebSocket/Real-time Architecture**: Vibekit is built around HTTP APIs. Real-time collaboration needs persistent connections, presence detection, and client-side prediction
- **Storage Overhead**: Storing every keystroke or cursor movement as an event would explode your event log

**Better Alternatives:** Y.js/Yjs, Liveblocks, Socket.io + CRDT libraries, Phoenix LiveView

---

## 2. High-Frequency Trading / Time-Series Analytics

**Examples:** Stock trading platforms, IoT sensor aggregation at scale, Real-time bid systems

**Why Vibekit Struggles:**
- **Write Throughput**: Event-sourced systems have inherent write amplification. Every event is persisted to the log + updates state. Trading systems need 100k+ writes/sec
- **Query Performance**: Vibekit's `ThingStore` is optimized for entity lookup, not time-series aggregation. Queries like "average sensor reading over 24hrs" would be slow
- **Memory Constraints**: In-memory store (`InMemoryStore`) becomes a bottleneck when you have millions of records with high churn
- **No Built-in Sharding**: Vibekit doesn't have horizontal scaling primitives. You can't easily partition data across nodes

**Better Alternatives:** TimescaleDB, InfluxDB, Apache Kafka + ksqlDB, Redis with time-series modules

---

## 3. Social Media / Feed-Based Applications

**Examples:** Twitter/X clones, Instagram-like apps, TikTok-style feeds

**Why Vibekit Struggles:**
- **Fan-out Problem**: When a user posts, you need to update feeds for thousands of followers. Vibekit's event model would emit one event, but materializing feeds efficiently requires specialized infrastructure
- **Graph Queries**: Social networks are inherently graph-based (followers, likes, retweets). Vibekit's relational `@relation` model doesn't optimize for graph traversal
- **Caching Complexity**: Feed generation needs aggressive caching strategies. Vibekit doesn't have built-in cache invalidation beyond state updates
- **Scale Requirements**: Social apps need to scale horizontally from day one. Vibekit's single-node architecture (even with Cloud Run) won't handle viral growth

**Better Alternatives:** Neo4j + REST API, Supabase with PostgreSQL, Firebase/Firestore, Redis-backed feed systems

---

## 4. Machine Learning Pipelines / Data Science Workflows

**Examples:** Model training platforms, Data labeling tools, Feature engineering pipelines

**Why Vibekit Struggles:**
- **Batch Processing**: ML workflows need batch operations (process 1M records at once). Vibekit's event-at-a-time model is inefficient
- **External Integrations**: ML platforms integrate with Python/Jupyter notebooks, model registries (MLflow), compute clusters (Kubernetes). Vibekit's Swift-based plugin system is limiting
- **Data Versioning**: While event sourcing *could* track data lineage, Vibekit lacks built-in dataset versioning, experiment tracking, or model checkpointing
- **Compute Separation**: Training jobs should run on separate infrastructure (GPUs). Vibekit tightly couples compute and storage

**Better Alternatives:** Kubeflow, MLflow + DVC, Weights & Biases, Dagster, Apache Airflow

---

## 5. E-commerce Platforms with Complex Inventory

**Examples:** Amazon-like marketplaces, Multi-warehouse fulfillment, Dynamic pricing systems

**Why Vibekit Struggles:**
- **Distributed Transactions**: E-commerce needs ACID guarantees across inventory, payments, and shipping. Vibekit's eventually consistent event model can lead to overselling
- **Complex Business Logic**: Promotions, dynamic pricing, tax calculations often require external services. While plugins help, you're rebuilding entire pricing engines
- **Payment Integration**: PCI compliance, payment gateways, refunds/chargebacks need specialized infrastructure. Vibekit's event log alone doesn't provide necessary guarantees
- **Search & Filtering**: Product catalogs need faceted search (price ranges, categories, reviews). Vibekit has no built-in search beyond basic ID/field lookup

**Better Alternatives:** Shopify/Medusa.js, Saleor, Spree Commerce, or microservices with dedicated inventory/payment services

---

## 6. Real-Time Chat / Messaging Applications

**Examples:** Slack clones, WhatsApp-like apps, Discord-style communities

**Why Vibekit Struggles:**
- **Message Ordering**: Chat needs guaranteed message ordering and delivery. Vibekit's event log is ordered, but HTTP-based emission can have race conditions
- **Presence & Typing Indicators**: Ephemeral state (who's online, who's typing) doesn't belong in an immutable event log
- **Message History Pagination**: Loading "last 50 messages before timestamp X" requires efficient time-based queries. Vibekit's store isn't optimized for this
- **Push Notifications**: Chat apps need mobile push, which requires integration with APNs/FCM. This is outside Vibekit's scope

**Better Alternatives:** Stream Chat, PubNub, SendBird, Matrix.org, Socket.io + Redis pub/sub

---

## 7. Geospatial Applications

**Examples:** Ride-sharing apps (Uber), Delivery routing, Mapping services, Location-based search

**Why Vibekit Struggles:**
- **Geospatial Queries**: Finding "all drivers within 5km" requires spatial indexing (R-trees, geohashing). Vibekit's store has no geospatial primitives
- **Real-Time Location Updates**: Drivers' locations change every second. Storing each as an event creates massive log bloat
- **Routing Algorithms**: Calculating optimal routes needs graph algorithms (Dijkstra, A*). Vibekit isn't designed for algorithm-heavy computation
- **Map Rendering**: Displaying maps requires tile servers and vector rendering. Vibekit's theme system isn't built for this

**Better Alternatives:** PostGIS (PostgreSQL extension), MongoDB with geospatial indexes, Google Maps Platform, Mapbox

---

## 8. Low-Latency APIs with High Read/Write Ratios

**Examples:** API gateways, Caching layers, URL shorteners at scale

**Why Vibekit Struggles:**
- **Write Overhead**: Event sourcing is write-heavy. URL shorteners that serve 1000 reads per write waste resources persisting events
- **Read Optimization**: Vibekit rebuilds state from events. For read-heavy workloads, this adds unnecessary latency
- **Caching Strategy**: While you could add Redis via a plugin, Vibekit doesn't have built-in cache-aside or write-through patterns

**Better Alternatives:** Redis, Cloudflare Workers KV, Fastly edge compute, Vercel Edge Functions

---

## 9. Enterprise Resource Planning (ERP) Systems

**Examples:** SAP-like systems, Complex accounting software, Supply chain management suites

**Why Vibekit Struggles:**
- **Schema Evolution**: ERPs need to evolve schemas constantly (new tax rules, regulations). Vibekit's `vibespec.md` requires app restarts for schema changes
- **Complex Reporting**: ERPs need pivot tables, custom reports, OLAP cubes. Vibekit's simple REST API can't handle complex analytical queries
- **Multi-Tenancy**: Enterprise apps need tenant isolation, row-level security, and per-tenant customization. Vibekit has no built-in multi-tenancy
- **Legacy Integration**: ERPs integrate with mainframes, SOAP APIs, EDI systems. Vibekit's modern Swift/HTTP stack doesn't play well with legacy protocols

**Better Alternatives:** Odoo, ERPNext, Microsoft Dynamics, or custom microservices with dedicated reporting databases

---

## The Sweet Spot: Where Vibekit Excels

Vibekit is **perfect** for:
- ✅ Business process automation with clear state transitions
- ✅ Compliance-heavy domains needing full audit trails
- ✅ Workflow orchestration (approvals, reviews, multi-step processes)
- ✅ Domain-driven design applications with explicit bounded contexts
- ✅ Prototypes needing quick API generation from business rules
- ✅ Systems where "what happened" is as important as "what is"

Vibekit is **problematic** for:
- ❌ Real-time collaboration requiring sub-second synchronization
- ❌ High-frequency data ingestion (IoT at scale, financial ticks)
- ❌ Applications needing complex queries or analytics
- ❌ Systems requiring horizontal scaling from the start
- ❌ Rich media/binary data management
- ❌ Graph-based data models (social networks)

Choose Vibekit when your domain naturally thinks in **events and state transitions**. Avoid it when you need **high throughput, complex queries, or real-time bidirectional communication**.