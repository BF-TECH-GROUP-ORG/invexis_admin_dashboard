import fs from "fs";
import path from "path";

export function readJson(file) {
  const filePath = path.join(process.cwd(), "src", "db", file);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function writeJson(file, content) {
  const filePath = path.join(process.cwd(), "src", "db", file);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
}
