
## Advanced Use Cases

### 4. Multi-Stage Loan Application Processing

A sophisticated financial application system with complex approval workflows.

**vibespec.md:**
```markdown
# VibeSpec for LoanProcessor
Version 1.0.0

Thing LoanApplication {
  id: UUID
  applicantId: UUID @required
  amount: Decimal @required @min(1000) @max(1000000)
  purpose: String @required
  creditScore: Integer
  state: ApplicationState = submitted
  documentationComplete: Boolean @default(false)
  creditCheckPassed: Boolean
  underwriterApproved: Boolean
  finalApproved: Boolean
  disbursedAt: DateTime
  rejectionReason: String
}

Thing Document {
  id: UUID
  applicationId: UUID @relation(LoanApplication)
  type: String @enum([identity, income, collateral])
  status: String @enum([pending, verified, rejected])
  uploadedAt: DateTime
}

Event LoanApplication.submitted { id: UUID, applicantId: UUID, amount: Decimal, purpose: String }
Event Document.uploaded { id: UUID, applicationId: UUID, type: String }
Event Document.verified { id: UUID }
Event CreditCheck.completed { applicationId: UUID, creditScore: Integer, passed: Boolean }
Event Underwriter.reviewed { applicationId: UUID, approved: Boolean, notes: String }
Event Manager.finalApproval { applicationId: UUID, approved: Boolean }
Event Loan.disbursed { applicationId: UUID, disbursedAt: DateTime }
Event Application.rejected { applicationId: UUID, reason: String }

State ApplicationState {
  states: [submitted, documentation_pending, credit_review, underwriting, final_approval, approved, disbursed, rejected]
  transitions:
    [state->documentation_pending] on Document.uploaded;
    [state->credit_review, documentationComplete->true] on Document.verified guard all_docs_verified;
    [state->underwriting, creditScore->creditScore, creditCheckPassed->passed] on CreditCheck.completed guard passed == true;
    [state->rejected, rejectionReason->"Credit check failed"] on CreditCheck.completed guard passed == false;
    [state->final_approval, underwriterApproved->approved] on Underwriter.reviewed guard approved == true;
    [state->rejected, rejectionReason->"Underwriter denied"] on Underwriter.reviewed guard approved == false;
    [state->approved, finalApproved->approved] on Manager.finalApproval guard approved == true;
    [state->rejected, rejectionReason->"Management denied"] on Manager.finalApproval guard approved == false;
    [state->disbursed, disbursedAt->disbursedAt] on Loan.disbursed;
    [state->rejected, rejectionReason->reason] on Application.rejected
}
```

**Use Case:** Financial institutions can track loan applications through multiple approval stages with automated checks and manual reviews.

**Plugin Opportunity:** Create a `CreditCheckPlugin` that integrates with external credit bureaus and automatically emits `CreditCheck.completed` events.

---

### 5. Hospital Patient Flow Management

Track patients through admission, treatment, and discharge with bed allocation.

**vibespec.md:**
```markdown
# VibeSpec for HospitalFlow
Version 1.0.0

Thing Patient {
  id: UUID
  name: String @required
  medicalRecordNumber: String @required @unique
  admissionType: String @enum([emergency, scheduled, transfer])
  state: PatientState = registered
  triagePriority: Integer
  assignedBed: UUID
  assignedDoctor: UUID
  dischargeDate: DateTime
}

Thing Bed {
  id: UUID
  ward: String @required
  bedNumber: String @required
  state: BedState = available
  occupiedBy: UUID
}

Thing Treatment {
  id: UUID
  patientId: UUID @relation(Patient)
  type: String
  status: String @enum([scheduled, in_progress, completed])
  scheduledFor: DateTime
  completedAt: DateTime
}

Event Patient.registered { id: UUID, name: String, medicalRecordNumber: String, admissionType: String }
Event Patient.triaged { id: UUID, priority: Integer, assignedDoctor: UUID }
Event Bed.assigned { patientId: UUID, bedId: UUID }
Event Treatment.scheduled { id: UUID, patientId: UUID, type: String, scheduledFor: DateTime }
Event Treatment.started { id: UUID }
Event Treatment.completed { id: UUID, completedAt: DateTime }
Event Patient.discharged { id: UUID, dischargeDate: DateTime }
Event Bed.released { bedId: UUID }

State PatientState {
  states: [registered, triaged, admitted, in_treatment, ready_for_discharge, discharged]
  transitions:
    [state->triaged, triagePriority->priority, assignedDoctor->assignedDoctor] on Patient.triaged;
    [state->admitted, assignedBed->bedId] on Bed.assigned;
    [state->in_treatment] on Treatment.started;
    [state->ready_for_discharge] on Treatment.completed guard all_treatments_complete;
    [state->discharged, dischargeDate->dischargeDate] on Patient.discharged
}

State BedState {
  states: [available, occupied, cleaning, maintenance]
  transitions:
    [state->occupied, occupiedBy->patientId] on Bed.assigned;
    [state->cleaning] on Bed.released;
    [state->available] on Bed.cleaned
}
```

**Use Case:** Hospitals can coordinate patient admissions, bed assignments, and treatment schedules while maintaining real-time bed availability.

**Plugin Opportunity:** Create an `AlertPlugin` that notifies staff when high-priority patients are triaged or when critical resources become available.

---

### 6. Decentralized Voting & Governance System

A transparent voting platform with proposal lifecycle and vote tallying.

**vibespec.md:**
```markdown
# VibeSpec for DAOGovernance
Version 1.0.0

Thing Proposal {
  id: UUID
  title: String @required
  description: Text @required
  proposer: UUID @required
  category: String @enum([treasury, parameter, membership])
  state: ProposalState = draft
  votingStartsAt: DateTime
  votingEndsAt: DateTime
  quorumRequired: Integer @default(100)
  votesFor: Integer @default(0)
  votesAgainst: Integer @default(0)
  votesAbstain: Integer @default(0)
  executedAt: DateTime
}

Thing Vote {
  id: UUID
  proposalId: UUID @relation(Proposal)
  voterId: UUID @required
  choice: String @enum([for, against, abstain])
  weight: Integer @required
  castedAt: DateTime
}

Thing Member {
  id: UUID
  address: String @required @unique
  votingPower: Integer @default(1)
  state: MemberState = active
}

Event Proposal.created { id: UUID, title: String, description: Text, proposer: UUID, category: String }
Event Proposal.submitted { id: UUID, votingStartsAt: DateTime, votingEndsAt: DateTime }
Event Vote.cast { id: UUID, proposalId: UUID, voterId: UUID, choice: String, weight: Integer }
Event Proposal.finalized { id: UUID }
Event Proposal.executed { id: UUID, executedAt: DateTime }
Event Proposal.vetoed { id: UUID, vetoer: UUID }
Event Member.joined { id: UUID, address: String }
Event Member.delegated { memberId: UUID, delegateTo: UUID, votingPower: Integer }

State ProposalState {
  states: [draft, active, passed, rejected, executed, vetoed]
  transitions:
    [state->active, votingStartsAt->votingStartsAt, votingEndsAt->votingEndsAt] on Proposal.submitted;
    [votesFor->votesFor+weight] on Vote.cast guard choice == "for";
    [votesAgainst->votesAgainst+weight] on Vote.cast guard choice == "against";
    [votesAbstain->votesAbstain+weight] on Vote.cast guard choice == "abstain";
    [state->passed] on Proposal.finalized guard votesFor > votesAgainst AND votesFor >= quorumRequired;
    [state->rejected] on Proposal.finalized guard votesFor <= votesAgainst OR votesFor < quorumRequired;
    [state->executed, executedAt->executedAt] on Proposal.executed guard state == passed;
    [state->vetoed] on Proposal.vetoed
}

State MemberState {
  states: [active, delegated, suspended]
  transitions:
    [state->delegated, votingPower->0] on Member.delegated;
    [state->active] on Member.activated
}
```

**Use Case:** DAOs and community organizations can manage transparent governance with weighted voting, quorum requirements, and full audit trails through the event log.

**Plugin Opportunity:** Create a `BlockchainSyncPlugin` that mirrors votes and proposals to a blockchain for immutable record-keeping.

---

### 7. Smart Manufacturing Work Order System

Complex manufacturing workflow with dependencies, quality gates, and inventory tracking.

**vibespec.md:**
```markdown
# VibeSpec for ManufacturingMES
Version 1.0.0

Thing WorkOrder {
  id: UUID
  productId: UUID @required
  quantity: Integer @required
  priority: String @enum([low, normal, high, urgent]) @default(normal)
  state: WorkOrderState = scheduled
  scheduledStart: DateTime
  actualStart: DateTime
  estimatedCompletion: DateTime
  actualCompletion: DateTime
  dependsOn: Array<UUID>
}

Thing ProductionRun {
  id: UUID
  workOrderId: UUID @relation(WorkOrder)
  stationId: UUID @required
  operatorId: UUID
  state: RunState = queued
  startedAt: DateTime
  completedAt: DateTime
  yieldRate: Decimal
  defectCount: Integer @default(0)
}

Thing QualityCheck {
  id: UUID
  productionRunId: UUID @relation(ProductionRun)
  inspector: UUID @required
  result: String @enum([pass, fail, conditional])
  notes: Text
  performedAt: DateTime
}

Thing InventoryItem {
  id: UUID
  materialType: String @required
  quantity: Decimal @required
  unit: String @required
  location: String
  state: String @enum([available, reserved, depleted])
}

Event WorkOrder.created { id: UUID, productId: UUID, quantity: Integer, priority: String }
Event WorkOrder.released { id: UUID, scheduledStart: DateTime }
Event ProductionRun.started { id: UUID, workOrderId: UUID, stationId: UUID, operatorId: UUID }
Event QualityCheck.performed { id: UUID, productionRunId: UUID, inspector: UUID, result: String }
Event ProductionRun.completed { id: UUID, yieldRate: Decimal, defectCount: Integer }
Event WorkOrder.completed { id: UUID, actualCompletion: DateTime }
Event Inventory.consumed { itemId: UUID, quantity: Decimal, workOrderId: UUID }
Event Inventory.replenished { itemId: UUID, quantity: Decimal }

State WorkOrderState {
  states: [scheduled, released, in_progress, quality_hold, completed, cancelled]
  transitions:
    [state->released, scheduledStart->scheduledStart] on WorkOrder.released;
    [state->in_progress, actualStart->startedAt] on ProductionRun.started;
    [state->quality_hold] on QualityCheck.performed guard result == "fail";
    [state->completed, actualCompletion->actualCompletion] on WorkOrder.completed;
    [state->cancelled] on WorkOrder.cancelled
}

State RunState {
  states: [queued, in_progress, quality_inspection, completed, rejected]
  transitions:
    [state->in_progress, startedAt->startedAt] on ProductionRun.started;
    [state->quality_inspection] on ProductionRun.paused;
    [state->completed, completedAt->completedAt, yieldRate->yieldRate, defectCount->defectCount] on ProductionRun.completed guard quality_passed;
    [state->rejected] on QualityCheck.performed guard result == "fail"
}
```

**Use Case:** Manufacturers can orchestrate complex production workflows with real-time tracking, quality gates, and dependency management across multiple production lines.

**Plugin Opportunity:** Create an `IOTSensorPlugin` that automatically captures machine data and emits production events based on sensor readings.

---

## Why These Use Cases Shine with Vibekit

1. **Event Sourcing by Default**: Every action is recorded, providing complete audit trails
2. **State Machines**: Complex workflows are explicitly defined, preventing invalid state transitions
3. **Declarative Schema**: Business logic is clear and maintainable in `vibespec.md`
4. **Plugin Extensibility**: Each use case can be enhanced with domain-specific plugins
5. **API-First**: All use cases automatically get RESTful APIs for integration
6. **Snapshot/Restore**: Critical for compliance, disaster recovery, and testing

---