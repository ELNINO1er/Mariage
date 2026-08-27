import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "../actions";

export default function LoginPage() {
  return <div className="w-full max-w-md"><a href="/" className="serif text-3xl lg:hidden">Noces.</a><p className="eyebrow mt-10 lg:mt-0">Heureux de vous revoir</p><h1 className="serif mt-3 text-5xl">Connexion</h1><p className="mt-3 text-sm text-[var(--caramel)]">Retrouvez votre mariage et vos invités.</p><AuthForm action={loginAction} submitLabel="Se connecter" fields={[{name:"email",label:"Adresse e-mail",type:"email",autoComplete:"email"},{name:"password",label:"Mot de passe",type:"password",autoComplete:"current-password"}]}/><p className="mt-7 text-center text-sm">Pas encore de compte ? <a className="underline" href="/register">Créer mon mariage</a></p></div>;
}
