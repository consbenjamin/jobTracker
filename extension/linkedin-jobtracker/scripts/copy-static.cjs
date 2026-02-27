const fs = require("fs");
const path = require("path");

const root = __dirname + "/..";
const dist = path.join(root, "dist");

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

// Copiar manifest
fs.copyFileSync(
  path.join(root, "manifest.json"),
  path.join(dist, "manifest.json")
);

// Copiar JS compilados (background y content script)
const filesToCopy = [
  ["src", "background.js"],
  ["src", "content-linkedin.js"],
];

for (const segments of filesToCopy) {
  const srcPath = path.join(root, ...segments);
  if (fs.existsSync(srcPath)) {
    const destPath = path.join(dist, path.basename(srcPath));
    fs.copyFileSync(srcPath, destPath);
  }
}

console.log("Archivos de extensión copiados a dist/");

