import "dotenv/config";
import { keywordTrigger, buildReplyMessage } from "@/server/automation-engine";

const results: { name: string; ok: boolean }[] = [];

function expect(name: string, actual: unknown, expected: unknown) {
  const matches = actual === expected;
  results.push({ name, ok: matches });
  if (!matches) {
    console.error(`  ✗ ${name}: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`);
  }
}

// Keywords are stored normalized (lowercased) by the server layer, and the
// matcher lowercases the comment text as well, so all documented variations
// below must match case-insensitively.
const keywords = ["link"];

expect("plain", keywordTrigger({ commentText: "link", keywords }), true);
expect("uppercase", keywordTrigger({ commentText: "LINK", keywords }), true);
expect("mixed case", keywordTrigger({ commentText: "Link", keywords }), true);
expect("phrase after", keywordTrigger({ commentText: "link please", keywords }), true);
expect("phrase before", keywordTrigger({ commentText: "send link", keywords }), true);
expect("question", keywordTrigger({ commentText: "where is the link", keywords }), true);
expect("substring no false positive gap", keywordTrigger({ commentText: "blink", keywords }), true);
expect("no keyword", keywordTrigger({ commentText: "nice video", keywords }), false);
expect("null text", keywordTrigger({ commentText: null, keywords }), false);
expect("empty keyword skipped", keywordTrigger({ commentText: "hi", keywords: ["  "] }), false);
expect("multiple keywords", keywordTrigger({ commentText: "seen this", keywords: ["link", "seen"] }), true);

expect(
  "reply message joins url",
  buildReplyMessage("Here you go 👇", "https://x.com/a"),
  "Here you go 👇\n\nhttps://x.com/a",
);
expect(
  "reply message empty falls back to url",
  buildReplyMessage("   ", "https://x.com/a"),
  "https://x.com/a",
);

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);