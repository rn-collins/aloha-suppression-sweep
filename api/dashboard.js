import { RECORDS, CLASSES, READING_RULES, RETRIEVED_ON, NEXT_REVIEW } from "../lib/records.js";

export const config = { runtime: "edge" };

export default function handler(request) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json; charset=utf-8", allow: "GET" },
    });
  }
  return new Response(JSON.stringify({
    schemaVersion: 2,
    retrievedOn: RETRIEVED_ON,
    nextReview: NEXT_REVIEW,
    assessmentDefinition: "Priority follow-up is browser-local operational triage, not a verified fact or legal conclusion.",
    evidenceClasses: CLASSES,
    readingRules: READING_RULES,
    records: RECORDS,
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
