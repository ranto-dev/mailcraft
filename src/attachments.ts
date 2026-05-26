import { group, multiselect } from "@clack/prompts";

export interface AttachmentResult {
  hasAttachments: boolean;
  phrase: string;
}

/**
 * Demande à l'utilisateur de sélectionner ses pièces jointes et génère la phrase adaptée.
 * @param targetType Le type de destinataire pour adapter le ton (pro, étudiant, etc.)
 */
export async function handleAttachmentsPrompt(
  targetType: string,
): Promise<AttachmentResult> {
  // 1. Demander quelles sont les pièces jointes présentes
  const selected = await multiselect({
    message:
      "Sélectionnez les pièces jointes à inclure (Espace pour cocher, Entrée pour valider) :",
    options: [
      { value: "cv", label: "📄 Curriculum Vitae (CV)" },
      { value: "lm", label: "✉️ Lettre de Motivation (LM)" },
      { value: "devoir", label: "📚 Devoir / Projet" },
      { value: "rapport", label: "📊 Rapport / Mémoire" },
      { value: "justificatif", label: "🏥 Justificatif (médical, absence...)" },
    ],
    required: false, // L'utilisateur peut ne rien sélectionner
  });

  // Si l'utilisateur a annulé ou fait Ctrl+C
  if (typeof selected === "symbol") {
    return { hasAttachments: false, phrase: "" };
  }

  const items = selected as string[];

  // 2. Si aucune pièce jointe n'est sélectionnée
  if (items.length === 0) {
    return { hasAttachments: false, phrase: "" };
  }

  // 3. Génération de la phrase selon les éléments cochés
  let phrase = "";

  // Cas spécifiques pour les recruteurs (CV + LM)
  if (items.includes("cv") && items.includes("lm") && items.length === 2) {
    phrase =
      "Vous trouverez en pièces jointes mon Curriculum Vitae ainsi que ma lettre de motivation détaillant mon parcours et mes motivations.";
  } else if (items.includes("cv") && items.length === 1) {
    phrase =
      "Mon Curriculum Vitae est disponible en pièce jointe pour de plus amples détails sur mon parcours.";
  } else if (items.includes("devoir")) {
    phrase =
      "Je vous prie de bien vouloir trouver ci-joint mon rendu de devoir/projet.";
  } else if (items.includes("rapport")) {
    phrase =
      "Vous trouverez ci-joint le document récapitulant mon rapport d'avancement.";
  } else {
    // Remplacement générique intelligent si combinaison rare
    const FrenchLabels: { [key: string]: string } = {
      cv: "mon CV",
      lm: "ma lettre de motivation",
      devoir: "mon projet",
      rapport: "mon rapport",
      justificatif: "mon justificatif",
    };

    const mappedItems = items.map((id) => FrenchLabels[id] || id);

    if (mappedItems.length === 1) {
      phrase = `Vous trouverez ${mappedItems[0]} joint à cet e-mail.`;
    } else {
      const lastItem = mappedItems.pop();
      phrase = `Vous trouverez en pièces jointes ${mappedItems.join(", ")} ainsi que ${lastItem}.`;
    }
  }

  return {
    hasAttachments: true,
    phrase,
  };
}
