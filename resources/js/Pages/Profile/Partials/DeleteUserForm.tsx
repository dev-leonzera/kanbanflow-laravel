import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Trash2, AlertTriangle, KeyRound } from 'lucide-react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <div className="max-w-xl">
                <p className="text-xs text-slate-400 leading-relaxed">
                    Depois que sua conta for excluída, todos os recursos, quadros e dados associados a ela serão apagados permanentemente. Antes de excluir, certifique-se de salvar ou exportar quaisquer informações importantes que deseje manter.
                </p>
            </div>

            <div className="pt-2">
                <DangerButton onClick={confirmUserDeletion} className="gap-2">
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Conta Definitivamente
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <form onSubmit={deleteUser} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-100">
                                Deseja realmente excluir sua conta?
                            </h2>
                            <p className="text-xs text-slate-400">
                                Esta ação é permanente e irreversível.
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                        Todos os seus quadros de tarefas, colunas e configurações serão apagados. Por favor, digite sua senha atual para confirmar a exclusão.
                    </p>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password"
                            value="Sua Senha"
                            className="sr-only"
                        />

                        <div className="relative">
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="w-full pl-9"
                                isFocused
                                placeholder="Digite sua senha para confirmar"
                            />
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <KeyRound className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>

                        <InputError
                            message={errors.password}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
                        <SecondaryButton onClick={closeModal}>
                            Cancelar
                        </SecondaryButton>

                        <DangerButton disabled={processing} className="gap-2">
                            <Trash2 className="w-3.5 h-3.5" />
                            {processing ? 'Excluindo...' : 'Sim, Excluir Minha Conta'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
