export type FulfillmentRating = "FUL" | "SUF" | "PAR" | "UNF" | "PEN" | "N/A";

const LINKED_EVIDENCE_EXEMPT: ReadonlySet<FulfillmentRating> = new Set(["PEN", "N/A"]);

/** CK-3 / Law 13 — non-exempt ratings require ≥1 attestation_evidence row at commit. */
export function requiresLinkedEvidence(rating: string): boolean {
  return !LINKED_EVIDENCE_EXEMPT.has(rating as FulfillmentRating);
}

export function isValidFulfillmentRating(rating: string): rating is FulfillmentRating {
  return ["FUL", "SUF", "PAR", "UNF", "PEN", "N/A"].includes(rating);
}
