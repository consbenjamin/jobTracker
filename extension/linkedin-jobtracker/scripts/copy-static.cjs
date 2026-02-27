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

// Copiar JS compilados (background y content script) y options
const filesToCopy = [
  ["src", "background.js"],
  ["src", "content-linkedin.js"],
  ["", "options.html"],
  ["", "options.js"],
];

for (const segments of filesToCopy) {
  const srcPath = path.join(root, ...segments);
  if (fs.existsSync(srcPath)) {
    const destPath = path.join(dist, path.basename(srcPath));
    fs.copyFileSync(srcPath, destPath);
  }
}

// Copiar icons (reutilizamos el mismo PNG en varios tamaños por simplicidad)
const iconsDir = path.join(dist, "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const publicIcon = path.join(root, "..", "..", "public", "icon-light.png");
if (fs.existsSync(publicIcon)) {
  const iconNames = ["icon16.png", "icon32.png", "icon48.png", "icon128.png"];
  for (const name of iconNames) {
    fs.copyFileSync(publicIcon, path.join(iconsDir, name));
  }
}

console.log("Archivos de extensión copiados a dist/");

