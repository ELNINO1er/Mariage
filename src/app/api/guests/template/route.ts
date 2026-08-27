export function GET() {
  const csv = "prenom;nom;email;telephone;groupe;places;notes\nJean;Konan;jean@example.com;+2250102030405;Famille mariée;2;Cousin de la mariée\n";
  return new Response(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=modele-invites-noces.csv" } });
}
