import { intro, outro, select, text } from "@clack/prompts";
import pc from "picocolors";
import ncp from "copy-paste";
import {
  loadTargetsConfig,
  loadBodyTemplate,
  getAvailableFooters,
  loadFooter,
} from "./config";
import { handleAttachmentsPrompt } from "./attachments";

async function main() {
  // Un bel en-tête moderne aux couleurs de MailCraft
  intro(
    pc.bgCyan(pc.black(" ✉️  MAILCRAFT - Générateur de structure d'emails ")),
  );

  // 1. Chargement de la configuration globale depuis targets.json
  const config = loadTargetsConfig();
  const targetKeys = Object.keys(config);

  if (targetKeys.length === 0) {
    outro(
      pc.red(
        "❌ Aucune cible configurée dans data/targets.json. Veuillez vérifier le fichier.",
      ),
    );
    return;
  }

  // 2. Sélection de la cible (Type de destinataire)
  const targetSelection = await select({
    message: "À quel type de destinataire écrivez-vous ?",
    options: targetKeys.map((key) => ({
      value: key,
      label: config[key].label,
    })),
  });

  // Sécurité en cas d'annulation (Ctrl+C)
  if (typeof targetSelection === "symbol") {
    outro(pc.yellow("Opération annulée. À la prochaine !"));
    return;
  }

  const selectedTarget = config[targetSelection];

  // 3. Sélection ou personnalisation de l'Objet de l'e-mail
  const subjectOptions = selectedTarget.subjects.map((subj) => ({
    value: subj,
    label: subj,
  }));
  subjectOptions.push({
    value: "custom",
    label: "➕ [Écrire un objet personnalisé]",
  });

  let chosenSubject = await select({
    message: "Choisissez l'objet de votre e-mail :",
    options: subjectOptions,
  });

  if (typeof chosenSubject === "symbol") {
    outro(pc.yellow("Opération annulée. À la prochaine !"));
    return;
  }

  if (chosenSubject === "custom") {
    const customText = await text({
      message: "Saisissez votre objet personnalisé :",
      placeholder: "Ex: Demande de stage / Suivi de projet...",
    });

    if (typeof customText === "symbol") {
      outro(pc.yellow("Opération annulée. À la prochaine !"));
      return;
    }
    chosenSubject = customText;
  }

  // 4. Sélection du Modèle de corps de texte
  const bodyTemplateSelection = await select({
    message: "Choisissez un modèle pour le corps du texte :",
    options: selectedTarget.bodyTemplates.map((t) => ({
      value: t.file,
      label: t.label,
    })),
  });

  if (typeof bodyTemplateSelection === "symbol") {
    outro(pc.yellow("Opération annulée. À la prochaine !"));
    return;
  }

  let emailBody = loadBodyTemplate(bodyTemplateSelection);

  // 5. Gestion adaptative des pièces jointes
  const attachmentResult = await handleAttachmentsPrompt(targetSelection);

  // Insertion de la phrase de pièces jointes à la place de la balise dédiée
  if (emailBody.includes("{{attachments_phrase}}")) {
    emailBody = emailBody.replace(
      "{{attachments_phrase}}",
      attachmentResult.phrase,
    );
  } else if (attachmentResult.hasAttachments) {
    // Sécurité : s'il y a des pièces jointes mais pas de balise, on injecte proprement la phrase à la fin
    emailBody += `\n\n${attachmentResult.phrase}`;
  }

  // 6. Sélection du Signature / Footer
  const footers = getAvailableFooters();
  const footerSelection = await select({
    message: "Choisissez votre signature / footer :",
    options: footers.map((f) => ({ value: f, label: `📝 ${f}` })),
  });

  if (typeof footerSelection === "symbol") {
    outro(pc.yellow("Opération annulée. À la prochaine !"));
    return;
  }

  const emailFooter = loadFooter(footerSelection);

  // 7. Assemblage final du contenu pour le presse-papiers
  const fullEmailContent = `${emailBody}\n\n${emailFooter}`;

  // Rendu visuel propre dans le terminal pour contrôle
  console.log(
    "\n" + pc.bold(pc.underline(pc.cyan("--- APERÇU DE VOTRE EMAIL ---"))),
  );
  console.log(pc.bold("Objet : ") + pc.green(chosenSubject));
  console.log(pc.gray("----------------------------------------------"));
  console.log(emailBody);
  console.log("\n" + emailFooter);
  console.log(pc.gray("----------------------------------------------\n"));

  // 8. Copie asynchrone sécurisée dans le presse-papiers du système
  ncp.copy(fullEmailContent, (err) => {
    if (err) {
      outro(
        pc.yellow(
          "⚠️ Structure générée, mais impossible d'accéder au presse-papiers automatiquement.",
        ),
      );
    } else {
      outro(
        pc.green(
          "🎉 Structure copiée avec succès ! Fais simplement un Ctrl+V (ou Cmd+V) dans ton application de mail.",
        ),
      );
    }
  });
}

main().catch((error) => {
  console.error(pc.red("Une erreur inattendue est survenue :"), error);
});
    