const fs = require("fs");
const path = require("path");

// Ambil versi dari package.json
const { version } = require("../package.json");

// Buat path tujuan untuk version.json
const outputPath = path.resolve(__dirname, "../public/version.json");

// Buat objek versi
const versionData = {
  version,
  timestamp: new Date().toISOString(),
};

// Tulis ke version.json
fs.writeFileSync(outputPath, JSON.stringify(versionData, null, 2), "utf8");

console.log(`✔️  Generated version.json: v${version}`);
