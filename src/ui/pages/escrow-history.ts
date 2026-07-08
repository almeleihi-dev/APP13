import type {
  EscrowExperienceSource,
  EscrowHistoryPageModel,
  EscrowHistoryView,
  EscrowStatusHistorySnapshot,
  EscrowTimelineEventType,
} from "../escrow/types.js";

function formatMoney(minor: number | undefined, currencyCode: string): string {
  if (minor === undefined) {
    return "—";
  }

  const major = minor / 100;
  return `${major.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;
}

function classifyEventType(entry: EscrowStatusHistorySnapshot): EscrowTimelineEventType {
  if (entry.fromStatus === null && entry.toStatus === "pending_funding") {
    return "escrow_created";
  }

  if (entry.toStatus === "funded") {
    return "funded";
  }

  if (entry.fromStatus === "frozen") {
    return "unfreeze";
  }

  if (entry.toStatus === "held" && entry.fromStatus !== "held") {
    return "held";
  }

  if (entry.toStatus === "released") {
    return "release";
  }

  if (entry.toStatus === "refunded" || entry.toStatus === "partially_refunded") {
    return "refund";
  }

  if (entry.toStatus === "frozen") {
    return "freeze";
  }

  if (entry.fromStatus === "held" && entry.toStatus === "held" && entry.amountMinor !== undefined) {
    return "release";
  }

  return "escrow_created";
}

function formatEventLabel(eventType: EscrowTimelineEventType): string {
  const labels: Record<EscrowTimelineEventType, string> = {
    escrow_created: "Escrow Created",
    funded: "Funded",
    held: "Held",
    release: "Release Event",
    refund: "Refund Event",
    freeze: "Freeze Event",
    unfreeze: "Unfreeze Event",
  };

  return labels[eventType];
}

function formatStatusTransition(entry: EscrowStatusHistorySnapshot): string {
  const from = entry.fromStatus ?? "none";
  return `${from} → ${entry.toStatus}`;
}

export function buildEscrowHistoryView(source: EscrowExperienceSource): EscrowHistoryView {
  const events = source.history.map((entry) => {
    const eventType = classifyEventType(entry);

    return {
      timestamp: new Date(entry.timestamp).toISOString(),
      event_type: eventType,
      amount: formatMoney(entry.amountMinor, source.financial.currencyCode),
      status_transition: formatStatusTransition(entry),
      label: formatEventLabel(eventType),
    };
  });

  return {
    escrow_id: source.escrow.id,
    events,
  };
}

export function createEscrowHistoryPageModel(source: EscrowExperienceSource): EscrowHistoryPageModel {
  return {
    page_id: "escrow-history",
    title: "Escrow History",
    description: "Read-only escrow lifecycle timeline from status history snapshots.",
    view: buildEscrowHistoryView(source),
  };
}

export function renderEscrowHistoryPage(model: EscrowHistoryPageModel): string {
  const events =
    model.view.events.length === 0
      ? `<p>No escrow history events recorded.</p>`
      : model.view.events
          .map(
            (event) =>
              `<article class="escrow-event" data-event-type="${event.event_type}">` +
              `<time datetime="${event.timestamp}">${event.timestamp}</time>` +
              `<h3>${event.label}</h3>` +
              `<dl>` +
              `<dt>Event Type</dt><dd>${event.event_type}</dd>` +
              `<dt>Amount</dt><dd>${event.amount}</dd>` +
              `<dt>Status Transition</dt><dd>${event.status_transition}</dd>` +
              `</dl>` +
              `</article>`
          )
          .join("\n");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<p data-escrow-id="${model.view.escrow_id}">Escrow: ${model.view.escrow_id}</p>`,
    `<section data-section="escrow-timeline">`,
    events,
    `</section>`,
    `</section>`,
  ].join("\n");
}
