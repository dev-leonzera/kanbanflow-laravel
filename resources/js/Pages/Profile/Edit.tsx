import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Board } from '@/types/kanban';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Shield, AlertTriangle } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
    boards = [],
}: PageProps<{ mustVerifyEmail: boolean; status?: string; boards?: Board[] }>) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            boards={boards}
            header={
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">
                            Perfil do Usuário
                        </h2>
                        <p className="text-xs text-slate-400">
                            Gerencie seus dados pessoais, credenciais de acesso e segurança da conta
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Perfil do Usuário" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Resumo do Perfil / Cartão de Boas-vindas */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-sky-400 font-bold text-xl">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-100">{user.name}</h3>
                                <p className="text-xs text-slate-400">{user.email}</p>
                                <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                    Membro Ativo
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Informações do Perfil */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    {/* Atualização de Senha */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
                        <div className="mb-6 flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
                            <Shield className="w-5 h-5 text-sky-400" />
                            <div>
                                <h3 className="text-sm font-semibold text-slate-100">Segurança da Conta</h3>
                                <p className="text-xs text-slate-400">Proteja seu acesso mantendo uma senha forte e atualizada</p>
                            </div>
                        </div>
                        <UpdatePasswordForm />
                    </div>

                    {/* Área de Perigo / Excluir Conta */}
                    <div className="rounded-xl border border-rose-950/40 bg-slate-900/60 p-6 sm:p-8">
                        <div className="mb-6 flex items-center gap-2.5 pb-4 border-b border-rose-950/40">
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                            <div>
                                <h3 className="text-sm font-semibold text-rose-300">Zona de Perigo</h3>
                                <p className="text-xs text-slate-400">Ações irreversíveis relacionadas à sua conta e dados</p>
                            </div>
                        </div>
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
