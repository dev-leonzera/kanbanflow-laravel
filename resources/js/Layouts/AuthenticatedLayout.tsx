import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import {
    LayoutDashboard,
    Clock,
    User,
    LogOut,
    Menu,
    X,
    FolderKanban,
    ChevronDown,
    Plus,
    Flame,
    BarChart3
} from 'lucide-react';
import { Board } from '@/types/kanban';

interface AuthenticatedLayoutProps extends PropsWithChildren {
    header?: ReactNode;
    boards?: Board[];
    currentBoard?: Board;
}

export default function Authenticated({
    header,
    boards = [],
    currentBoard,
    children,
}: AuthenticatedLayoutProps) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');
    const APP_VERSION = 'v1.2.0';

    const handleCreateBoard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBoardTitle.trim()) return;

        router.post('/boards', {
            title: newBoardTitle.trim(),
            description: newBoardDescription.trim() || null,
        }, {
            onSuccess: () => {
                setNewBoardTitle('');
                setNewBoardDescription('');
                setIsNewBoardModalOpen(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
            {/* Top Navigation Bar: Estilo KanbanFlow Original */}
            <nav className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40 backdrop-blur-xs">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex h-12 items-center justify-between">
                        {/* Lado Esquerdo: Logo + Seletor de Quadros/Projetos */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-sm">
                                <ApplicationLogo className="h-7 w-auto text-white" />
                            </Link>

                            {/* Seletor Rápido de Quadros/Projetos (Boards Dropdown) */}
                            <div className="hidden md:flex items-center gap-2">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-md border border-slate-700/80 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 transition duration-150 hover:bg-slate-700 hover:text-white hover:border-slate-600 focus:outline-none"
                                        >
                                            <FolderKanban className="w-3.5 h-3.5 text-sky-400" />
                                            <span className="max-w-[140px] truncate">
                                                {currentBoard?.title || 'Selecionar Projeto / Quadro'}
                                            </span>
                                            <ChevronDown className="w-3 h-3 text-slate-400" />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="left" width="48" contentClasses="py-1 bg-slate-900 border border-slate-800 rounded-md shadow-2xl min-w-[220px]">
                                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                                            <span>Projetos & Quadros</span>
                                            <span className="text-[9px] text-slate-500 font-mono">{boards.length}</span>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {boards.map((b) => (
                                                <Dropdown.Link
                                                    key={b.id}
                                                    href={`/board?board_id=${b.id}`}
                                                    className={`flex items-center justify-between text-xs py-1.5 ${
                                                        currentBoard?.id === b.id
                                                            ? 'bg-sky-500/10 text-sky-400 font-semibold'
                                                            : 'text-slate-300 hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <span className="truncate">{b.title}</span>
                                                    {currentBoard?.id === b.id && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 ml-2" />
                                                    )}
                                                </Dropdown.Link>
                                            ))}
                                        </div>
                                        <div className="border-t border-slate-800 p-1">
                                            <button
                                                type="button"
                                                onClick={() => setIsNewBoardModalOpen(true)}
                                                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-sky-400 hover:bg-slate-800 rounded transition-colors text-left font-medium"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Novo Projeto / Quadro
                                            </button>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>

                                <button
                                    onClick={() => setIsNewBoardModalOpen(true)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                                    title="Novo Projeto / Quadro"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Lado Direito: Links de Acesso, Perfil do Usuário */}
                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            {/* Versão do App Desktop */}
                            <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800/60 border border-slate-700/50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    KanbanFlow
                                    <span className="text-slate-500">{APP_VERSION}</span>
                                </span>
                            </div>

                            {/* Dropdown do Usuário */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-200 transition duration-150 hover:bg-slate-800 hover:text-white focus:outline-none"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="max-w-[120px] truncate">{user.name}</span>
                                            <ChevronDown className="w-3 h-3 text-slate-400" />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-slate-900 border border-slate-800 rounded-md shadow-2xl min-w-[180px]">
                                        <div className="px-3 py-1.5 border-b border-slate-800 text-[11px]">
                                            <p className="font-medium text-slate-200 truncate">{user.name}</p>
                                            <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
                                        </div>

                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                            className="flex items-center gap-2 text-xs py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
                                        >
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            Meu Perfil
                                        </Dropdown.Link>

                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center gap-2 text-xs py-1.5 text-rose-400 hover:bg-slate-800 hover:text-rose-300"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            Sair da Conta
                                        </Dropdown.Link>

                                        <div className="px-3 py-1.5 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-right">
                                            KanbanFlow {APP_VERSION}
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Botão Menu Mobile */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:outline-none"
                            >
                                {showingNavigationDropdown ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menu Expansível Mobile */}
                {showingNavigationDropdown && (
                    <div className="sm:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-3 space-y-3">
                        <div>
                            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                <span>Projetos & Quadros</span>
                                <button
                                    onClick={() => {
                                        setIsNewBoardModalOpen(true);
                                        setShowingNavigationDropdown(false);
                                    }}
                                    className="text-sky-400 flex items-center gap-0.5 text-xs font-medium lowercase"
                                >
                                    <Plus className="w-3.5 h-3.5" /> novo
                                </button>
                            </div>
                            <div className="space-y-1">
                                {boards.map((b) => (
                                    <Link
                                        key={b.id}
                                        href={`/board?board_id=${b.id}`}
                                        className={`block px-2.5 py-1.5 rounded text-xs ${
                                            currentBoard?.id === b.id
                                                ? 'bg-sky-500/20 text-sky-400 font-medium'
                                                : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        {b.title}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-2 space-y-1">
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded"
                            >
                                <User className="w-4 h-4 text-slate-400" />
                                Meu Perfil
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-slate-800 rounded"
                            >
                                <LogOut className="w-4 h-4" />
                                Sair da Conta
                            </Link>
                        </div>

                        {/* Versão do App Mobile */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span>KanbanFlow Laravel</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{APP_VERSION}</span>
                        </div>
                    </div>
                )}
            </nav>

            {/* Modal de Criação de Novo Projeto / Quadro */}
            {isNewBoardModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
                    <div className="flex flex-col w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 p-3.5">
                            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                                <FolderKanban className="w-4 h-4 text-sky-400" />
                                Novo Projeto / Quadro
                            </h3>
                            <button
                                onClick={() => setIsNewBoardModalOpen(false)}
                                className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBoard} className="p-4 space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Nome do Projeto / Quadro *
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={newBoardTitle}
                                    onChange={(e) => setNewBoardTitle(e.target.value)}
                                    placeholder="Ex: Lançamento Q3, App Mobile..."
                                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Descrição (opcional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={newBoardDescription}
                                    onChange={(e) => setNewBoardDescription(e.target.value)}
                                    placeholder="Objetivo deste fluxo de trabalho..."
                                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div className="border-t border-slate-800 pt-3 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsNewBoardModalOpen(false)}
                                    className="rounded-md px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 transition-colors"
                                >
                                    Criar Quadro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sub-Header / ToolBar Funcional: Integrado com o mesmo tom do App */}
            {header && (
                <div className="relative z-20 border-b border-slate-800/90 bg-slate-900/60 px-4 py-2 sm:px-6 lg:px-8">
                    {header}
                </div>
            )}

            {/* Conteúdo Principal */}
            <main className="flex-1 bg-slate-950 flex flex-col">{children}</main>
        </div>
    );
}
