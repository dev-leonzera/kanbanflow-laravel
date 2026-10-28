import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { ChangelogData, ReleaseNote } from '@/types';
import {
    Sparkles,
    Zap,
    Wrench,
    X,
    Calendar,
    ChevronRight,
    Check,
    PartyPopper,
    History
} from 'lucide-react';

interface ChangelogModalProps {
    isOpen: boolean;
    onClose: () => void;
    changelogData?: ChangelogData;
    isAutomaticPrompt?: boolean;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
    isOpen,
    onClose,
    changelogData,
    isAutomaticPrompt = false,
}) => {
    if (!isOpen || !changelogData) return null;

    const releases = changelogData.all_releases || [];
    const latestRelease = changelogData.latest_release || releases[0];
    const [selectedVersion, setSelectedVersion] = useState<string>(
        latestRelease?.version || changelogData.current_version
    );

    const activeRelease: ReleaseNote | undefined =
        releases.find((r) => r.version === selectedVersion) || latestRelease;

    const handleAcknowledge = () => {
        router.post('/changelog/acknowledge', {}, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
            onError: () => {
                onClose();
            },
        });
    };

    const getItemBadge = (type: string) => {
        switch (type) {
            case 'feature':
                return (
                    <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400 border border-sky-500/20">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        Nova Funcionalidade
                    </span>
                );
            case 'improvement':
                return (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        Melhoria
                    </span>
                );
            case 'fix':
                return (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                        <Wrench className="w-3 h-3 text-amber-400" />
                        Correção
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        Atualização
                    </span>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4">
            <div className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-lg border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5 bg-slate-900/90">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400">
                            {isAutomaticPrompt ? (
                                <PartyPopper className="w-4 h-4 text-sky-400" />
                            ) : (
                                <History className="w-4 h-4 text-sky-400" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                                    {isAutomaticPrompt ? 'O que há de novo no KanbanFlow' : 'Notas de Atualização & Histórico'}
                                </h3>
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                                    {changelogData.current_version}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                {isAutomaticPrompt
                                    ? 'Confira os novos recursos disponíveis nesta atualização.'
                                    : 'Acompanhe as melhorias e novidades de cada versão.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleAcknowledge}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Fechar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Seletor de Versões (Abas) quando houver múltiplos releases */}
                {releases.length > 1 && (
                    <div className="border-b border-slate-800 bg-slate-950/70 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1 shrink-0">
                            Versões:
                        </span>
                        {releases.map((rel) => {
                            const isSelected = rel.version === activeRelease?.version;
                            const isLatest = rel.version === latestRelease?.version;
                            return (
                                <button
                                    key={rel.version}
                                    type="button"
                                    onClick={() => setSelectedVersion(rel.version)}
                                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
                                        isSelected
                                            ? 'bg-slate-800 border border-slate-700 text-sky-400 font-semibold shadow-xs'
                                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                    }`}
                                >
                                    <span>{rel.version}</span>
                                    {isLatest && (
                                        <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold uppercase">
                                            Mais Recente
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Conteúdo da Versão Selecionada */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                    {activeRelease ? (
                        <>
                            {/* Destaque da Versão */}
                            <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3.5 space-y-1.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                                        <span>{activeRelease.title}</span>
                                    </h4>
                                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        {activeRelease.date}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    {activeRelease.summary}
                                </p>
                            </div>

                            {/* Itens detalhados */}
                            <div className="space-y-2.5">
                                <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Detalhes das Mudanças
                                </h5>
                                <div className="space-y-2">
                                    {activeRelease.items?.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-md border border-slate-800/90 bg-slate-950/40 hover:border-slate-700/80 transition-colors space-y-1"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                {getItemBadge(item.type)}
                                                <h6 className="text-xs font-semibold text-slate-200">
                                                    {item.title}
                                                </h6>
                                            </div>
                                            <p className="text-xs text-slate-400 pl-0.5 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-xs text-slate-500 italic py-4 text-center">
                            Nenhum registro de changelog encontrado para esta versão.
                        </p>
                    )}
                </div>

                {/* Footer com Botão de Ação */}
                <div className="border-t border-slate-800 bg-slate-900/90 px-4 py-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Você pode rever este histórico a qualquer momento pelo menu de perfil.
                    </span>
                    <button
                        type="button"
                        onClick={handleAcknowledge}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-colors w-full sm:w-auto ml-auto"
                    >
                        <Check className="w-3.5 h-3.5" />
                        <span>Entendido, continuar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
