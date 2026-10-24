import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Mail, CheckCircle2 } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                    <User className="w-5 h-5 text-sky-400" />
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100">
                            Informações Pessoais
                        </h2>
                        <p className="text-xs text-slate-400">
                            Atualize os dados de perfil da sua conta e endereço de e-mail.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={submit} className="space-y-5 max-w-xl">
                <div>
                    <InputLabel htmlFor="name" value="Nome Completo" />

                    <div className="relative mt-1">
                        <TextInput
                            id="name"
                            className="w-full pl-9"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                            placeholder="Seu nome completo"
                        />
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-4 w-4 text-slate-500" />
                        </div>
                    </div>

                    <InputError className="mt-1.5" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Endereço de E-mail" />

                    <div className="relative mt-1">
                        <TextInput
                            id="email"
                            type="email"
                            className="w-full pl-9"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="seu.email@exemplo.com"
                        />
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="h-4 w-4 text-slate-500" />
                        </div>
                    </div>

                    <InputError className="mt-1.5" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                        <p className="text-xs text-amber-200">
                            Seu endereço de e-mail ainda não foi verificado.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline font-medium hover:text-white focus:outline-none"
                            >
                                Clique aqui para reenviar o e-mail de confirmação.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Um novo link de verificação foi enviado para o seu endereço de e-mail.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Salvando...' : 'Salvar Alterações'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-x-1"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Alterações salvas com sucesso!
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
