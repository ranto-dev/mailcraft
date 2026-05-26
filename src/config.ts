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

const TARGETS_PATH = path.resolve(__dirname, "../data/targets.json");
const TEMPLATES_DIR = path.resolve(__dirname, "../data/templates");
const FOOTERS_DIR = path.resolve(__dirname, "../data/footers");

export function loadTargetsConfig(): FullConfig {
  try {
    if (!fs.existsSync(TARGETS_PATH)) {
      throw new Error(
        `Le fichier de configuration global est introuvable à l'adresse : ${TARGETS_PATH}`,
      );
    }
    const rawData = fs.readFileSync(TARGETS_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("❌ Erreur lors du chargement de targets.json:", error);
    return {};
  }
}

export function loadBodyTemplate(fileName: string): string {
  try {
    const filePath = path.join(TEMPLATES_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return `[Contenu du template "${fileName}" introuvable. Veuillez créer le fichier dans data/templates/]`;
    }
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    return "[Erreur de lecture du template]";
  }
}

export function getAvailableFooters(): string[] {
  try {
    if (!fs.existsSync(FOOTERS_DIR)) return ["default"];
    return fs
      .readdirSync(FOOTERS_DIR)
      .filter((file) => file.endsWith(".txt"))
      .map((file) => file.replace(".txt", ""));
  } catch {
    return ["default"];
  }
}

export function loadFooter(footerName: string): string {
  try {
    const filePath = path.join(FOOTERS_DIR, `${footerName}.txt`);
    if (!fs.existsSync(filePath)) return "---\nCordialement.";
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "---\nCordialement.";
  }
}
