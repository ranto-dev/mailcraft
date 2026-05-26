import fs from "fs";
import path from "path";

export interface BodyTemplate {
  id: string;
  label: string;
  file: string;
}

export interface TargetConfig {
  label: string;
  subjects: string[];
  bodyTemplates: BodyTemplate[];
}

export interface FullConfig {
  [key: string]: TargetConfig;
}

const TARGETS_PATH = path.join(__dirname, "../data/targets.json");
const TEMPLATES_DIR = path.join(__dirname, "../data/templates");
const FOOTERS_DIR = path.join(__dirname, "../data/footers");

export function loadTargetsConfig(): FullConfig {
  const rawData = fs.readFileSync(TARGETS_PATH, "utf-8");
  return JSON.parse(rawData);
}

export function loadBodyTemplate(fileName: string): string {
  const filePath = path.join(TEMPLATES_DIR, fileName);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

export function getAvailableFooters(): string[] {
  return fs.readdirSync(FOOTERS_DIR).map((file) => file.replace(".txt", ""));
}

export function loadFooter(footerName: string): string {
  const filePath = path.join(FOOTERS_DIR, `${footerName}.txt`);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}
