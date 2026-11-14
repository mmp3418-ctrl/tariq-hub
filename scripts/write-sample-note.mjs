import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const stream = [
  "0.063 0.725 0.506 rg",
  "0 826 595 16 re f",
  "0.043 0.075 0.169 rg",
  "BT",
  "/F1 11 Tf",
  "48 786 Td",
  "(TARIQ HUB) Tj",
  "/F1 26 Tf",
  "0 -46 Td",
  "(Note preview) Tj",
  "/F2 12 Tf",
  "0 -28 Td",
  "(In-browser reading sheet for the study workspace.) Tj",
  "0 -20 Td",
  "(Download this file from the notes library.) Tj",
  "ET",
  "0.82 0.79 0.70 RG",
  "0.9 w",
  "48 640 m 547 640 l S",
  "48 600 m 547 600 l S",
  "48 560 m 547 560 l S",
  "48 520 m 547 520 l S",
  "48 480 m 547 480 l S",
  "48 440 m 547 440 l S",
  "48 400 m 547 400 l S",
].join("\n");

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
  `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];

let body = "%PDF-1.4\n";
const offsets = [0];

objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(body));
  body += `${index + 1} 0 obj\n${object}\nendobj\n`;
});

const xrefStart = Buffer.byteLength(body);
body += `xref\n0 ${objects.length + 1}\n`;
body += "0000000000 65535 f \n";

for (let index = 1; index < offsets.length; index += 1) {
  body += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
}

body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "notes");
mkdirSync(root, { recursive: true });
writeFileSync(join(root, "sample-note.pdf"), body);
