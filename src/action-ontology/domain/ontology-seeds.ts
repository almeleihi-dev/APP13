import type { CanonicalAction } from "./canonical-action.js";

function action(partial: CanonicalAction): CanonicalAction {
  return partial;
}

export const CANONICAL_ACTIONS: CanonicalAction[] = [
  action({
    id: "act.move.room_contents",
    name: "Move Room Contents",
    category: "moving",
    actionType: "physical_execution",
    description: "Relocate furniture and belongings between rooms with safe handling.",
    requiredSkills: [
      { skillId: "sk.manual_handling", name: "Manual handling", level: "entry" },
      { skillId: "sk.spatial_planning", name: "Spatial planning", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.dolly", name: "Furniture dolly", type: "tool", required: true },
      { resourceId: "res.pads", name: "Moving pads", type: "material", required: true },
      { resourceId: "res.helper", name: "Second handler", type: "personnel", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.access",
        label: "Property access confirmed",
        description: "Customer grants access to source and destination rooms.",
        mandatory: true,
      },
      {
        preconditionId: "pre.pathway",
        label: "Pathway cleared",
        description: "Hallways and doorways are unobstructed.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.before_photos",
        label: "Before photos",
        description: "Photos of item condition before move.",
        minimumCount: 1,
      },
      {
        evidenceId: "ev.after_photos",
        label: "After photos",
        description: "Photos confirming placement after move.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      {
        signalId: "risk.back_injury",
        severity: "medium",
        description: "Heavy lifting without assistance.",
      },
    ],
    contractHints: ["Include item inventory and damage liability clause."],
    executionHints: ["Move boxes before heavy furniture.", "Use two-person lift for items over 25 kg."],
    trustSignals: ["Verify handler identity before property access.", "Document item condition at intake."],
    relatedActionIds: ["act.schedule.appointment", "act.inspect.site_readiness"],
  }),
  action({
    id: "act.clean.apartment_full",
    name: "Clean Apartment (Full)",
    category: "cleaning",
    actionType: "service_delivery",
    description: "Perform structured full-apartment cleaning including kitchen and bathroom.",
    requiredSkills: [
      { skillId: "sk.sanitation", name: "Sanitation procedures", level: "professional" },
      { skillId: "sk.surface_care", name: "Surface-safe cleaning", level: "entry" },
    ],
    requiredResources: [
      { resourceId: "res.vacuum", name: "Vacuum cleaner", type: "tool", required: true },
      { resourceId: "res.cleaning_agents", name: "Approved cleaning agents", type: "material", required: true },
      { resourceId: "res.apartment", name: "Apartment access", type: "space", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.supplies",
        label: "Cleaning supplies available",
        description: "All required supplies confirmed on site or provided.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.room_checklist",
        label: "Room checklist",
        description: "Completed checklist per room.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.chemical", severity: "low", description: "Improper chemical use." },
    ],
    contractHints: ["Define included rooms and deep-clean exclusions."],
    executionHints: ["Work top-down: dust before floors.", "Finish with mopping toward exit."],
    trustSignals: ["Capture before/after photos for quality assurance."],
    relatedActionIds: ["act.inspect.quality_check", "act.doc.service_report"],
  }),
  action({
    id: "act.deliver.document_secure",
    name: "Deliver Document Securely",
    category: "delivery",
    actionType: "physical_execution",
    description: "Transport a document with chain-of-custody and proof of delivery.",
    requiredSkills: [
      { skillId: "sk.custody", name: "Chain-of-custody handling", level: "professional" },
      { skillId: "sk.navigation", name: "Local navigation", level: "entry" },
    ],
    requiredResources: [
      { resourceId: "res.envelope", name: "Tamper-evident envelope", type: "material", required: true },
      { resourceId: "res.document", name: "Document packet", type: "document", required: true },
      { resourceId: "res.transport", name: "Courier transport", type: "vehicle", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.recipient",
        label: "Recipient verified",
        description: "Recipient name and address confirmed.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.proof_delivery",
        label: "Proof of delivery",
        description: "Signature or timestamp confirmation.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.loss", severity: "high", description: "Document loss or misdelivery." },
    ],
    contractHints: ["Specify delivery window and proof requirements."],
    executionHints: ["Seal document before departure.", "Verify recipient ID on arrival."],
    trustSignals: ["Maintain custody log from pickup to delivery."],
    relatedActionIds: ["act.doc.custody_log", "act.schedule.delivery_window"],
  }),
  action({
    id: "act.maint.fix_minor_issue",
    name: "Fix Minor Home Issue",
    category: "maintenance",
    actionType: "physical_execution",
    description: "Diagnose and repair a minor household maintenance issue.",
    requiredSkills: [
      { skillId: "sk.diagnostics", name: "Basic diagnostics", level: "professional" },
      { skillId: "sk.utility_safety", name: "Utility safety", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.toolkit", name: "Hand tool kit", type: "tool", required: true },
      { resourceId: "res.shutoff", name: "Utility shutoff access", type: "space", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.scope",
        label: "Minor scope confirmed",
        description: "Issue confirmed as minor and not requiring licensed trade.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.test_result",
        label: "Test result",
        description: "Verification test after repair.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.scope_creep", severity: "medium", description: "Issue exceeds minor repair scope." },
    ],
    contractHints: ["Clarify licensed-trade escalation boundary."],
    executionHints: ["Shut off utilities before work when applicable."],
    trustSignals: ["Record parts used and test results."],
    relatedActionIds: ["act.inspect.pre_work", "act.price.estimate_repair"],
  }),
  action({
    id: "act.pro.prepare_service_request",
    name: "Prepare Professional Service Request",
    category: "professional_service_request",
    actionType: "coordination",
    description: "Structure a match-ready professional service request with scope and criteria.",
    requiredSkills: [
      { skillId: "sk.scoping", name: "Service scoping", level: "professional" },
      { skillId: "sk.requirements", name: "Requirements communication", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.brief", name: "Service brief template", type: "document", required: true },
      { resourceId: "res.site_info", name: "Site access details", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.intent",
        label: "Service intent captured",
        description: "Customer outcome and constraints documented.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.request_package",
        label: "Request package",
        description: "Structured request with scope and success criteria.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.ambiguous_scope", severity: "high", description: "Vague scope causes mismatch." },
    ],
    contractHints: ["Defer contract creation until provider match is confirmed."],
    executionHints: ["Include inclusions, exclusions, and evidence expectations."],
    trustSignals: ["Set milestone evidence requirements upfront."],
    relatedActionIds: [
      "act.contract.prepare_draft",
      "act.price.estimate_service",
      "act.schedule.coordination",
    ],
  }),
  action({
    id: "act.doc.custody_log",
    name: "Document Custody Log",
    category: "documentation_evidence",
    actionType: "documentation",
    description: "Record chain-of-custody events for sensitive documents or assets.",
    requiredSkills: [
      { skillId: "sk.recordkeeping", name: "Record keeping", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.log_template", name: "Custody log template", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.asset_id",
        label: "Asset identified",
        description: "Document or asset has unique identifier.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.custody_entries",
        label: "Custody entries",
        description: "Timestamped custody transfer records.",
        minimumCount: 2,
      },
    ],
    riskSignals: [
      { signalId: "risk.gap", severity: "medium", description: "Gap in custody timeline." },
    ],
    contractHints: ["Reference custody log in delivery contract exhibits."],
    executionHints: ["Log every handoff with timestamp and party identity."],
    trustSignals: ["Immutable custody timeline supports dispute resolution."],
    relatedActionIds: ["act.deliver.document_secure"],
  }),
  action({
    id: "act.doc.service_report",
    name: "Create Service Report",
    category: "documentation_evidence",
    actionType: "documentation",
    description: "Produce a structured report documenting service performed and outcomes.",
    requiredSkills: [
      { skillId: "sk.reporting", name: "Technical reporting", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.report_template", name: "Service report template", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.work_complete",
        label: "Work completed",
        description: "Primary service action has been executed.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.report",
        label: "Signed service report",
        description: "Completed report with findings and photos.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.incomplete_report", severity: "low", description: "Missing required report sections." },
    ],
    contractHints: ["Attach report as milestone acceptance evidence."],
    executionHints: ["Include photos, timestamps, and provider attestation."],
    trustSignals: ["Report supports reputation timeline entries."],
    relatedActionIds: ["act.clean.apartment_full", "act.inspect.quality_check"],
  }),
  action({
    id: "act.inspect.site_readiness",
    name: "Inspect Site Readiness",
    category: "inspection_verification",
    actionType: "assessment",
    description: "Verify site is ready for planned physical or service execution.",
    requiredSkills: [
      { skillId: "sk.site_assessment", name: "Site assessment", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.checklist", name: "Inspection checklist", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.access_scheduled",
        label: "Access scheduled",
        description: "Site access window confirmed with customer.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.inspection_record",
        label: "Inspection record",
        description: "Completed checklist with pass/fail items.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.unsafe_site", severity: "high", description: "Site hazards block safe execution." },
    ],
    contractHints: ["Gate execution milestone on inspection pass."],
    executionHints: ["Document hazards and required remediation before proceed."],
    trustSignals: ["Inspection attestation reduces dispute risk."],
    relatedActionIds: ["act.move.room_contents", "act.maint.fix_minor_issue"],
  }),
  action({
    id: "act.inspect.quality_check",
    name: "Quality Check Inspection",
    category: "inspection_verification",
    actionType: "assessment",
    description: "Verify service output meets defined quality criteria.",
    requiredSkills: [
      { skillId: "sk.quality_assurance", name: "Quality assurance", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.qa_rubric", name: "Quality rubric", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.criteria",
        label: "Quality criteria defined",
        description: "Acceptance criteria documented in request or contract.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.qa_signoff",
        label: "QA sign-off",
        description: "Inspector sign-off with rubric scores.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.substandard", severity: "medium", description: "Output fails quality rubric." },
    ],
    contractHints: ["Link QA pass to milestone release conditions."],
    executionHints: ["Use rubric consistently across all rooms or deliverables."],
    trustSignals: ["QA records feed trust reputation timeline."],
    relatedActionIds: ["act.clean.apartment_full", "act.doc.service_report"],
  }),
  action({
    id: "act.schedule.appointment",
    name: "Schedule Service Appointment",
    category: "scheduling_coordination",
    actionType: "coordination",
    description: "Coordinate appointment window between customer and provider.",
    requiredSkills: [
      { skillId: "sk.scheduling", name: "Appointment scheduling", level: "entry" },
    ],
    requiredResources: [
      { resourceId: "res.calendar", name: "Shared calendar access", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.availability",
        label: "Availability confirmed",
        description: "Both parties confirm proposed window.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.appointment_confirm",
        label: "Appointment confirmation",
        description: "Written confirmation of date and time.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.no_show", severity: "medium", description: "Missed appointment window." },
    ],
    contractHints: ["Include rescheduling policy in service terms."],
    executionHints: ["Send reminder 24 hours before appointment."],
    trustSignals: ["Confirmed appointments reduce cancellation disputes."],
    relatedActionIds: ["act.move.room_contents", "act.schedule.delivery_window"],
  }),
  action({
    id: "act.schedule.delivery_window",
    name: "Coordinate Delivery Window",
    category: "scheduling_coordination",
    actionType: "coordination",
    description: "Align delivery timing with recipient availability.",
    requiredSkills: [
      { skillId: "sk.logistics_coord", name: "Logistics coordination", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.recipient_contact", name: "Recipient contact details", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.window",
        label: "Delivery window agreed",
        description: "Recipient confirms acceptable delivery window.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.window_confirm",
        label: "Window confirmation",
        description: "Confirmed delivery window record.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.late_delivery", severity: "medium", description: "Delivery misses agreed window." },
    ],
    contractHints: ["Specify SLA for delivery window adherence."],
    executionHints: ["Buffer travel time for traffic variability."],
    trustSignals: ["On-time delivery improves provider trust score."],
    relatedActionIds: ["act.deliver.document_secure"],
  }),
  action({
    id: "act.price.estimate_service",
    name: "Estimate Service Price",
    category: "pricing_estimation",
    actionType: "commercial",
    description: "Produce read-only price band estimate for a scoped service action.",
    requiredSkills: [
      { skillId: "sk.pricing", name: "Service pricing", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.rate_card", name: "Reference rate card", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.scope_defined",
        label: "Scope defined",
        description: "Service scope documented for estimation.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.estimate_record",
        label: "Estimate record",
        description: "Documented estimate with assumptions.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.underquote", severity: "medium", description: "Estimate below required skill cost." },
    ],
    contractHints: ["Estimate is non-binding until contract acceptance."],
    executionHints: ["Include labor, materials, and travel in estimate basis."],
    trustSignals: ["Transparent estimates reduce pricing disputes."],
    relatedActionIds: ["act.pro.prepare_service_request", "act.contract.prepare_draft"],
  }),
  action({
    id: "act.price.estimate_repair",
    name: "Estimate Repair Price",
    category: "pricing_estimation",
    actionType: "commercial",
    description: "Estimate price band for minor maintenance repair work.",
    requiredSkills: [
      { skillId: "sk.repair_pricing", name: "Repair pricing", level: "professional" },
    ],
    requiredResources: [
      { resourceId: "res.parts_catalog", name: "Parts catalog", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.diagnosis",
        label: "Issue diagnosed",
        description: "Root cause identified before pricing.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.repair_estimate",
        label: "Repair estimate",
        description: "Line-item estimate with parts and labor.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.hidden_damage", severity: "medium", description: "Hidden damage increases final cost." },
    ],
    contractHints: ["Cap estimate variance with change-order clause."],
    executionHints: ["Separate parts cost from labor hours."],
    trustSignals: ["Itemized estimates build customer confidence."],
    relatedActionIds: ["act.maint.fix_minor_issue"],
  }),
  action({
    id: "act.contract.prepare_draft",
    name: "Prepare Contract Draft",
    category: "contract_preparation",
    actionType: "legal_preparation",
    description: "Assemble read-only contract draft hints from scoped action ontology.",
    requiredSkills: [
      { skillId: "sk.contract_scoping", name: "Contract scoping", level: "expert" },
    ],
    requiredResources: [
      { resourceId: "res.contract_template", name: "Contract template", type: "document", required: true },
    ],
    preconditions: [
      {
        preconditionId: "pre.scope_locked",
        label: "Scope locked",
        description: "Service scope and estimate approved by customer.",
        mandatory: true,
      },
    ],
    evidenceRequirements: [
      {
        evidenceId: "ev.draft_contract",
        label: "Draft contract package",
        description: "Draft with milestones and evidence requirements.",
        minimumCount: 1,
      },
    ],
    riskSignals: [
      { signalId: "risk.incomplete_terms", severity: "high", description: "Missing milestone or liability terms." },
    ],
    contractHints: ["No contract executed — draft preparation only.", "Include escrow milestone mapping."],
    executionHints: ["Map each milestone to ontology evidence requirements."],
    trustSignals: ["Explicit evidence gates protect both parties."],
    relatedActionIds: [
      "act.pro.prepare_service_request",
      "act.price.estimate_service",
      "act.doc.service_report",
    ],
  }),
];

export function listCanonicalActions(): CanonicalAction[] {
  return CANONICAL_ACTIONS.map((entry) => ({
    ...entry,
    requiredSkills: [...entry.requiredSkills],
    requiredResources: [...entry.requiredResources],
    preconditions: [...entry.preconditions],
    evidenceRequirements: [...entry.evidenceRequirements],
    riskSignals: [...entry.riskSignals],
    contractHints: [...entry.contractHints],
    executionHints: [...entry.executionHints],
    trustSignals: [...entry.trustSignals],
    relatedActionIds: [...entry.relatedActionIds],
  }));
}

export function getCanonicalActionById(actionId: string): CanonicalAction | undefined {
  return listCanonicalActions().find((action) => action.id === actionId);
}

export function getPrimaryActionForFamily(
  familyId: CanonicalAction["category"]
): CanonicalAction | undefined {
  const familyActions = listCanonicalActions().filter((action) => action.category === familyId);
  return familyActions[0];
}
