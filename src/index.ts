import { intro, outro, select, text } from "@clack/prompts";
import pc from "picocolors";
import {
  loadTargetsConfig,
  loadBodyTemplate,
  getAvailableFooters,
  loadFooter,
} from "./config";
import { handleAttachmentsPrompt } from "./attachments"; // 1. Import du nouveau module

async function main() {
  intro(
    pc.bgCyan(pc.black(" ✉️  MAILCRAFT - Générateur de structure d'emails ")),
  );

  const config = loadTargetsConfig();
  const targetKeys = Object.keys(config);

  // Sélection de la cible
  const targetSelection = (await select({
    message: "À quel type de destinataire écrivez-vous ?",
    options: targetKeys.map((key) => ({
      value: key,
      label: config[key].label,
    })),
  })) as string;

  const selectedTarget = config[targetSelection];

  // Sélection de l'Objet
  const subjectOptions = selectedTarget.subjects.map((subj) => ({
    value: subj,
    label: subj,
  }));
  subjectOptions.push({
    value: "custom",
    label: "➕ [Écrire un objet personnalisé]",
  });

  let chosenSubject = (await select({
    message: "Choisissez l'objet de votre e-mail :",
    options: subjectOptions,
  })) as string;

  if (chosenSubject === "custom") {
    chosenSubject = (await text({
      message: "Saisissez votre objet personnalisé :",
      placeholder: "Ex: Demande de stage...",
    })) as string;
  }

  // Sélection du Corps de texte
  const bodyTemplateSelection = (await select({
    message: "Choisissez un modèle pour le corps du texte :",
    options: selectedTarget.bodyTemplates.map((t) => ({
      value: t.file,
      label: t.label,
    })),
  })) as string;

  let emailBody = loadBodyTemplate(bodyTemplateSelection);

  // 2. Gestion dynamique des pièces jointes
  const attachmentResult = await handleAttachmentsPrompt(targetSelection);

  // Remplacement de la balise dans le texte
  if (emailBody.includes("{{attachments_phrase}}")) {
    emailBody = emailBody.replace(
      "{{attachments_phrase}}",
      attachmentResult.phrase,
    );
  } else if (attachmentResult.hasAttachments) {
    // Sécurité : si le template n'a pas la balise mais qu'il y a des PJ, on l'ajoute à la fin du corps
    emailBody += `\n\n${attachmentResult.phrase}`;
  }

  // Sélection du Footer
  const footers = getAvailableFooters();
  const footerSelection = (await select({
    message: "Choisissez votre signature / footer :",
    options: footers.map((f) => ({ value: f, label: `📝 ${f}` })),
  })) as string;

  const emailFooter = loadFooter(footerSelection);

  // Rendu final
  console.log("\n" + pc.bold(pc.underline("--- APPERÇU DE VOTRE EMAIL ---")));
  console.log(pc.cyan(`Objet : `) + chosenSubject);
  console.log(pc.gray("----------------------------------------------"));
  console.log(emailBody);
  console.log("\n" + emailFooter);
  console.log(pc.gray("----------------------------------------------\n"));

  outro(pc.green("🎉 Structure générée avec succès !"));
}

main().catch(console.error);
