import { AuthForm } from "@/components/auth/auth-form";
import { requestPasswordResetAction } from "../actions";
export default function ForgotPasswordPage(){return <div className="w-full max-w-md"><p className="eyebrow">Sécurité du compte</p><h1 className="serif mt-3 text-5xl">Mot de passe oublié</h1><p className="mt-4 text-sm text-[var(--caramel)]">Nous vous enverrons un lien valable pendant une heure.</p><AuthForm action={requestPasswordResetAction} submitLabel="Envoyer le lien" fields={[{name:"email",label:"Adresse e-mail",type:"email",autoComplete:"email"}]}/></div>}
