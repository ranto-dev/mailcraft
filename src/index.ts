import { intro, outro, select } from '@clack/prompts';
import pc from 'picocolors';

async function main() {
  intro(pc.cyan(' Welcome to MailCraft ✉️ '));
  
  const target = await select({
    message: 'À qui s’adresse cet e-mail ?',
    options: [
      { value: 'recruteur', label: '💼 Recruteur' },
      { value: 'pdg', label: '👑 PDG / Supérieur' },
      { value: 'prof', label: '🎓 Enseignant' },
      { value: 'ami', label: '👋 Ami / Famille' },
    ],
  });

  outro(pc.green(`Option sélectionnée : ${target}. Prêt pour le premier commit !`));
}

main();