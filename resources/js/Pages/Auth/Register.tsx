import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            title="Criar nova conta"
            subtitle="Comece a organizar suas tarefas e medir seu tempo em minutos."
        >
            <Head title="Criar Conta" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nome completo" />
                    <TextInput
                        id="name"
                        name="name"
                        placeholder="Ex: Carlos Silva"
                        value={data.name}
                        className="mt-1 block w-full text-xs"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="E-mail profissional ou pessoal" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        placeholder="seu@email.com"
                        value={data.email}
                        className="mt-1 block w-full text-xs"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Senha" />
                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Mínimo 8 caracteres"
                            value={data.password}
                            className="block w-full pr-10 text-xs"
                            autoComplete="new-password"
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

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar senha"
                    />
                    <TextInput
                        id="password_confirmation"
                        type={showPassword ? 'text' : 'password'}
                        name="password_confirmation"
                        placeholder="Repita sua senha"
                        value={data.password_confirmation}
                        className="mt-1 block w-full text-xs"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5"
                    />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center gap-2 py-2.5"
                        disabled={processing}
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        {processing ? 'Criando conta...' : 'Criar minha conta'}
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
                <p className="text-xs text-slate-400">
                    Já possui cadastro?{' '}
                    <Link
                        href={route('login')}
                        className="font-medium text-sky-400 hover:text-sky-300 hover:underline transition-colors"
                    >
                        Fazer login
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
