import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            title="Acessar sua conta"
            subtitle="Entre com suas credenciais para gerenciar seus fluxos e quadros."
        >
            <Head title="Entrar" />

            {status && (
                <div className="mb-4 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="E-mail" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        placeholder="seu@email.com"
                        value={data.email}
                        className="mt-1 block w-full text-xs"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Senha" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
                            >
                                Esqueceu a senha?
                            </Link>
                        )}
                    </div>

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="••••••••"
                            value={data.password}
                            className="block w-full pr-10 text-xs"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-xs text-slate-400 hover:text-slate-300">
                            Lembrar neste navegador
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center gap-2 py-2.5"
                        disabled={processing}
                    >
                        <LogIn className="w-3.5 h-3.5" />
                        {processing ? 'Entrando...' : 'Entrar no Kanban'}
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
                <p className="text-xs text-slate-400">
                    Não tem uma conta ainda?{' '}
                    <Link
                        href={route('register')}
                        className="font-medium text-sky-400 hover:text-sky-300 hover:underline transition-colors"
                    >
                        Crie sua conta gratuitamente
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
