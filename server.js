// Fichier de démarrage pour Passenger (Hostinger Cloud / CloudLinux Node.js Selector).
// Passenger exige un fichier .js comme point d'entrée : il ne peut pas lancer `next start`.
// Ce fichier n'est PAS compilé par Next : rester en CommonJS et compatible avec le Node du serveur.
const { createServer } = require("node:http");
const next = require("next");

// Passenger fournit le port via process.env.PORT. dev:false = build de production déjà généré.
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Noces prêt sur le port ${port}`);
  });
});
