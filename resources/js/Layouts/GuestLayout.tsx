import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import { Clock, LayoutDashboard, CheckCircle2, ShieldCheck } from 'lucide-react';

interface GuestLayoutProps extends PropsWithChildren {
    title?: string;
    subtitle?: string;
}

export default function Guest({ children, title, subtitle }: GuestLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
            {/* Painel Esquerdo: Identidade Visual e Recursos (Showcase) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 border-r border-slate-800 p-12 flex-col justify-between relative overflow-hidden">
                {/* Linhas de grade sutis de fundo */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm">
                        <ApplicationLogo className="h-9 w-auto text-white" />
                    </Link>

                    <div className="mt-14 max-w-lg">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium tracking-wide uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4">
                            Fluxo Ágil & Produtividade
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
                            Controle total sobre seu tempo e suas entregas.
                        </h1>
                        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                            Um Kanban enxuto e poderoso, com Pomodoro integrado, limites de trabalho em progresso (WIP) e estimativas precisas para você e sua equipe.
                        </p>
                    </div>
                </div>

                {/* Lista de destaques ergonômicos */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="p-4 rounded-md border border-slate-800/80 bg-slate-950/60">
                        <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-xs mb-1">
                            <Clock className="w-4 h-4" />
                            <span>Timer Pomodoro & Stopwatch</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Acompanhe o tempo real gasto em cada cartão sem distrações.
                        </p>
                    </div>

                    <div className="p-4 rounded-md border border-slate-800/80 bg-slate-950/60">
                        <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-xs mb-1">
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Limites de WIP Estritos</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Previna gargalos e sobrecarga limitando cartões em andamento.
                        </p>
                    </div>

                    <div className="p-4 rounded-md border border-slate-800/80 bg-slate-950/60">
                        <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-xs mb-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Subtarefas Diretas</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Quebre itens complexos em etapas claras com progresso visual.
                        </p>
                    </div>

                    <div className="p-4 rounded-md border border-slate-800/80 bg-slate-950/60">
                        <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-xs mb-1">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Controle e Simplicidade</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Arquitetura rápida sem excesso de peso ou telas infladas.
                        </p>
                    </div>
                </div>

                {/* Rodapé do painel */}
                <div className="relative z-10 text-xs text-slate-500 pt-6 border-t border-slate-800/60 flex items-center justify-between">
                    <span>KanbanFlow Laravel</span>
                    <span>Produtividade focada</span>
                </div>
            </div>

            {/* Painel Direito: Formulário de Autenticação */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
                <div className="w-full max-w-md">
                    {/* Header para telas menores (mobile/tablet) */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-auto text-white mx-auto" />
                        </Link>
                    </div>

                    {/* Títulos do formulário */}
                    {(title || subtitle) && (
                        <div className="mb-6">
                            {title && (
                                <h2 className="text-2xl font-bold tracking-tight text-white">
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className="mt-1 text-xs text-slate-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Container do formulário com bordas nítidas e fundo sóbrio */}
                    <div className="rounded-md border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
