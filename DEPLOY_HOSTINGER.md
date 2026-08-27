# Déploiement Hostinger — Noces

## Offre nécessaire

Utiliser une offre Hostinger **Business Web Hosting**, **Cloud** ou un VPS avec prise en charge des applications Node.js. Sélectionner **Node.js 20.x** et le framework **Next.js**.

## Déploiement recommandé

1. Envoyer le projet dans un dépôt GitHub privé.
2. Dans hPanel : `Ajouter un site` → `Node.js Web App` → connecter GitHub.
3. Choisir la racine du dépôt (celle qui contient `package.json`).
4. Commande de build : `npm run build`.
5. Commande de démarrage : `npm start`.
6. Ne pas envoyer `node_modules`, `.next`, `.env`, `coverage` ni le dossier de référence `HTML`.

Le build génère Prisma, applique les migrations MySQL, vérifie le compte super-admin puis compile Next.js.

## Variables d’environnement obligatoires

```env
NODE_ENV=production
DATABASE_URL=mysql://UTILISATEUR:MOT_DE_PASSE@localhost:3306/NOM_BASE
AUTH_SECRET=UNE_CLE_ALEATOIRE_D_AU_MOINS_32_OCTETS
AUTH_URL=https://votre-domaine.com
AUTH_TRUST_HOST=true
ADMIN_EMAIL=dromaric58@gmail.com
ADMIN_PASSWORD=VOTRE_MOT_DE_PASSE_ADMIN
ADMIN_FIRST_NAME=Romaric
ADMIN_LAST_NAME=BOMBADE
```

Générer `AUTH_SECRET` localement avec `openssl rand -base64 32`. Ne jamais publier le fichier `.env` dans GitHub.

## MySQL

Créer la base et son utilisateur dans `hPanel → Bases de données → MySQL`. Sur l’hébergement Hostinger, l’hôte est généralement `localhost` et le port `3306`. Encoder les caractères spéciaux du mot de passe dans l’URL MySQL.

## Vérification après déploiement

1. Ouvrir `https://votre-domaine.com/api/health` : la réponse doit contenir `status: ok` et `database: connected`.
2. Tester la connexion super-admin, puis la déconnexion.
3. Créer un compte client et un mariage de test.
4. Ajouter un invité, ouvrir son invitation, répondre au RSVP et copier le lien.
5. Tester l’envoi d’une photo, le QR et le check-in.
6. Vérifier le cadenas HTTPS et les journaux de déploiement.

## Important pour les photos

Les photos sont actuellement écrites dans `public/uploads`. Elles fonctionnent sur un serveur Node persistant, mais peuvent être perdues si Hostinger remplace le répertoire de build lors d’un redéploiement. Avant une exploitation commerciale, prévoir soit une sauvegarde persistante de ce dossier, soit un stockage objet externe (Cloudinary, S3 ou équivalent).
