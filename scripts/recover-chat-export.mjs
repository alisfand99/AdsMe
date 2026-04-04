import fs from "fs";

const p =
  "C:/Users/Alisf/.cursor/projects/c-Users-Alisf-Desktop-Projects-AdsMe/agent-transcripts/3906d9fc-3fd4-4b28-ac39-356eb0bf0c2b/3906d9fc-3fd4-4b28-ac39-356eb0bf0c2b.jsonl";

const text = fs.readFileSync(p, "utf8");
const lines = text.split("\n");
const row = lines.find(
  (l) =>
    l.includes("cursor_local_repository_not_a_git_direc.md") &&
    l.includes("code_selection")
);

if (!row) {
  console.error("Row not found");
  process.exit(1);
}

const o = JSON.parse(row);
const full = o.message.content[0].text;
const re = /<code_selection[^>]*>([\s\S]*?)<\/code_selection>/;
const m = full.match(re);

if (!m) {
  console.error("code_selection block not found");
  process.exit(1);
}

const out = "C:/Users/Alisf/Desktop/_recovered_export_raw.md";
fs.writeFileSync(out, m[1].trim(), "utf8");
console.log("Wrote", out, "chars:", m[1].length);
