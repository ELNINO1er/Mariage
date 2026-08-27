import { AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "../actions";

export default function RegisterPage() {
  return <div className="w-full max-w-md"><a href="/" className="serif text-3xl lg:hidden">Noces.</a><p className="eyebrow mt-10 lg:mt-0">Votre histoire commence ici</p><h1 className="serif mt-3 text-5xl">Créer votre compte</h1><AuthForm action={registerAction} submitLabel="Continuer" fields={[{name:"firstName",label:"Prénom",autoComplete:"given-name"},{name:"lastName",label:"Nom",autoComplete:"family-name"},{name:"email",label:"Adresse e-mail",type:"email",autoComplete:"email"},{name:"password",label:"Mot de passe",type:"password",autoComplete:"new-password"},{name:"passwordConfirmation",label:"Confirmer le mot de passe",type:"password",autoComplete:"new-password"}]}/><p className="mt-7 text-center text-sm">Déjà inscrit ? <a className="underline" href="/login">Se connecter</a></p></div>;
}
