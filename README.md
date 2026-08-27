# Noces

Plateforme SaaS de gestion d'invitations de mariage : création du mariage, invités, RSVP, tables et contrôle d'accès par QR code.

## Architecture

- Next.js App Router et TypeScript strict
- composants serveur par défaut ; composants client uniquement pour les interactions
- Prisma comme couche d'accès unique à MySQL
- services serveur par domaine (`guests`, `rsvp`, `check-in`)
- autorisation multi-tenant fondée sur `session.user.id + WeddingMember + weddingId`

## Installation

```bash
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Créer auparavant une base MySQL UTF-8 et adapter `DATABASE_URL`.

### Démarrage avec WampServer sous Windows

1. Démarrer WampServer et vérifier que les services Apache/MySQL sont verts.
2. Ouvrir phpMyAdmin puis exécuter `CREATE DATABASE noces CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`.
3. Copier `.env.example` vers `.env` et adapter l'utilisateur/mot de passe MySQL.
4. Dans PowerShell, à la racine du projet :

```powershell
npm install
npx auth secret
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Ouvrir ensuite http://localhost:3000. Apache n'est pas nécessaire pour Next.js ; WampServer fournit ici principalement MySQL.

## Validation

```bash
npm run lint
npm run typecheck
npm run prisma:validate
npm run build
```

## Routes prévues

- `/`, `/login`, `/register`, `/forgot-password`, `/onboarding`
- `/dashboard`, `/dashboard/guests`, `/dashboard/rsvp`, `/dashboard/tables`
- `/dashboard/checkin`, `/dashboard/settings`
- `/w/[weddingSlug]/invite/[token]`, `/checkin/[token]`

## Sécurité

Les tokens d'invitation et de check-in sont indépendants, aléatoires et indexés. Les identifiants internes ne sont jamais exposés dans les URL publiques. Chaque opération dashboard devra passer par une vérification d'appartenance au mariage côté serveur. Les mots de passe sont stockés uniquement sous forme de hash.
