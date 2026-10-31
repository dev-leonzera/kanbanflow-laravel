import React, { useState, useEffect, useRef } from 'react';
import { Card, Label } from '@/types/kanban';
import {
    X,
    Trash2,
    Plus,
    Tag,
    Pencil,
    Calendar,
    Clock,
    Flame,
    CheckCircle2,
    CheckSquare,
    ArrowRightLeft,
    Play,
    Pause,
    ListPlus,
    ListCheck,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { DatePicker } from '@/Components/DatePicker';
import { usePomodoro } from './PomodoroContext';

interface CardModalProps {
    card: Card | null;
    columnId?: number;
    columns?: Array<{ id: number; title: string; color?: string | null }>;
    boardId?: number;
    availableLabels: Label[];
    isOpen: boolean;
    onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({
    card,
    columnId,
    columns = [],
    boardId,
    availableLabels,
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null;

    const isExistingCard = !!card;
    // Se for um card existente, abre no modo visualização; se for novo card, abre em edição/criação
    const [isEditing, setIsEditing] = useState(!isExistingCard);

    // Pomodoro Context
    const {
        activeCardId,
        isRunning,
        queueIds,
        startCard,
        togglePlay,
        addToQueue,
        removeFromQueue,
        completeActiveCard,
    } = usePomodoro();

    const isActiveInTimer = isExistingCard && activeCardId === card.id;
    const isTimerTicking = isActiveInTimer && isRunning;
    const isInQueue = isExistingCard && queueIds.includes(card.id);

    // Campos do formulário
    const [title, setTitle] = useState(card?.title || '');
    const [selectedColumnId, setSelectedColumnId] = useState<number>(
        card?.column_id || columnId || (columns[0]?.id ?? 0)
    );
    const [description, setDescription] = useState(card?.description || '');
    const [priority, setPriority] = useState<Card['priority']>(card?.priority || 'medium');
    const [color, setColor] = useState<string | null>(card?.color || null);
    const [dueDate, setDueDate] = useState(card?.due_date || '');
    const [estimateMinutes, setEstimateMinutes] = useState(
        card?.estimate_minutes ? String(card.estimate_minutes) : ''
    );
    const [selectedLabels, setSelectedLabels] = useState<number[]>(
        card?.labels?.map((l) => l.id) || []
    );
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [pendingSubtasks, setPendingSubtasks] = useState<
        Array<{ id: number; title: string; is_completed: boolean }>
    >([]);

    const subtaskInputRef = useRef<HTMLInputElement>(null);
    const prevCardIdRef = useRef<number | null | undefined>(undefined);
    const prevIsOpenRef = useRef<boolean>(false);

    // Criação de nova etiqueta
    const [isCreatingLabel, setIsCreatingLabel] = useState(false);
    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#3b82f6');

    useEffect(() => {
        const isNewlyOpened = isOpen && !prevIsOpenRef.current;
        const isCardChanged = card?.id !== prevCardIdRef.current;

        if (isNewlyOpened || isCardChanged) {
            setIsEditing(!card);
            setTitle(card?.title || '');
            setSelectedColumnId(card?.column_id || columnId || (columns[0]?.id ?? 0));
            setDescription(card?.description || '');
            setPriority(card?.priority || 'medium');
            setColor(card?.color || null);
            setDueDate(card?.due_date || '');
            setEstimateMinutes(card?.estimate_minutes ? String(card.estimate_minutes) : '');
            setSelectedLabels(card?.labels?.map((l) => l.id) || []);
            setPendingSubtasks([]);
            setNewSubtaskTitle('');
            setIsCreatingLabel(false);
            setNewLabelName('');
            setNewLabelColor('#3b82f6');
        }

        prevCardIdRef.current = card?.id;
        prevIsOpenRef.current = isOpen;
    }, [isOpen, card?.id, columnId]);

    // Fecha o modal ao pressionar Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isEditing && isExistingCard) {
                    setIsEditing(false);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isEditing, isExistingCard, onClose]);

    const KANBAN_COLORS = [
        { label: 'Padrão', hex: '' },
        { label: 'Vermelho', hex: '#ef4444' },
        { label: 'Âmbar', hex: '#f59e0b' },
        { label: 'Esmeralda', hex: '#10b981' },
        { label: 'Azul Celeste', hex: '#0ea5e9' },
        { label: 'Índigo', hex: '#6366f1' },
        { label: 'Rosa', hex: '#ec4899' },
    ];

    const LABEL_COLORS = [
        { label: 'Azul', hex: '#3b82f6' },
        { label: 'Esmeralda', hex: '#10b981' },
        { label: 'Âmbar', hex: '#f59e0b' },
        { label: 'Vermelho', hex: '#ef4444' },
        { label: 'Roxo', hex: '#8b5cf6' },
        { label: 'Rosa', hex: '#ec4899' },
        { label: 'Ciano', hex: '#06b6d4' },
        { label: 'Slate', hex: '#64748b' },
    ];

    const priorityBadge = {
        urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        medium: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    }[priority];

    const priorityLabels: Record<string, string> = {
        urgent: 'Urgente',
        high: 'Alta',
        medium: 'Média',
        low: 'Baixa',
    };

    const formatDate = (dateStr: string): string => {
        if (!dateStr) return '';
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [, year, month, day] = match;
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    const currentColumn = columns.find((c) => c.id === (card?.column_id || selectedColumnId));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: Record<string, any> = {
            column_id: selectedColumnId,
            title,
            description,
            priority,
            color: color || null,
            due_date: dueDate || null,
            estimate_minutes: estimateMinutes ? parseInt(estimateMinutes, 10) : null,
            label_ids: selectedLabels,
        };

        if (isExistingCard && card) {
            router.put(`/cards/${card.id}`, payload, {
                onSuccess: () => {
                    setIsEditing(false);
                },
            });
        } else {
            if (pendingSubtasks.length > 0) {
                payload.subtasks = pendingSubtasks.map((s) => s.title);
            }
            router.post('/cards', payload, {
                onSuccess: () => onClose(),
            });
        }
    };

    const handleDeleteCard = () => {
        if (!card) return;
        if (confirm('Tem certeza de que deseja remover este cartão?')) {
            router.delete(`/cards/${card.id}`, {
                onSuccess: () => onClose(),
            });
        }
    };

    const handleAddSubtask = (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const trimmed = newSubtaskTitle.trim();
        if (!trimmed) return;

        if (isExistingCard && card) {
            router.post(
                `/cards/${card.id}/subtasks`,
                { title: trimmed },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setNewSubtaskTitle('');
                        setTimeout(() => {
                            subtaskInputRef.current?.focus();
                        }, 50);
                    },
                }
            );
        } else {
            setPendingSubtasks((prev) => [
                ...prev,
                { id: Date.now(), title: trimmed, is_completed: false },
            ]);
            setNewSubtaskTitle('');
            setTimeout(() => {
                subtaskInputRef.current?.focus();
            }, 50);
        }
    };

    const handleDeleteSubtask = (subtaskId: number) => {
        if (isExistingCard && card) {
            router.delete(`/subtasks/${subtaskId}`, {
                preserveScroll: true,
            });
        } else {
            setPendingSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
        }
    };

    const handleToggleSubtask = (subtaskId: number) => {
        if (isExistingCard && card) {
            router.patch(`/subtasks/${subtaskId}/toggle`, {}, {
                preserveScroll: true,
            });
        } else {
            setPendingSubtasks((prev) =>
                prev.map((s) => (s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s))
            );
        }
    };

    const toggleLabel = (labelId: number) => {
        setSelectedLabels((prev) =>
            prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
        );
    };

    const handleCreateLabel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!boardId || !newLabelName.trim()) return;

        router.post(
            `/boards/${boardId}/labels`,
            {
                name: newLabelName.trim(),
                color_hex: newLabelColor,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewLabelName('');
                    setIsCreatingLabel(false);
                },
            }
        );
    };

    const handleDeleteLabel = (e: React.MouseEvent, label: Label) => {
        e.stopPropagation();
        if (confirm(`Tem certeza de que deseja excluir a etiqueta "${label.name}"?`)) {
            router.delete(`/labels/${label.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedLabels((prev) => prev.filter((id) => id !== label.id));
                },
            });
        }
    };

    const handleMoveColumnQuick = (targetColId: number) => {
        if (!card) return;
        router.patch(
            `/cards/${card.id}/move`,
            { column_id: targetColId },
            { preserveScroll: true }
        );
    };

    // Subtarefas calculadas
    const currentSubtasks = isExistingCard && card ? card.subtasks || [] : pendingSubtasks;
    const completedSubtasks = currentSubtasks.filter((s) => s.is_completed).length;
    const totalSubtasks = currentSubtasks.length;
    const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // Tempo gasto
    const spentMinutes = Math.round((card?.time_spent_seconds || 0) / 60);
    const estMinutes = card?.estimate_minutes || (estimateMinutes ? parseInt(estimateMinutes, 10) : 0);
    const timeProgress = estMinutes > 0 ? Math.min(100, Math.round((spentMinutes / estMinutes) * 100)) : 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="flex flex-col w-full sm:max-w-2xl rounded-t-xl sm:rounded-lg border border-slate-800 bg-slate-900 shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Superior com Status e Ações */}
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/90">
                    <div className="flex items-center gap-2 flex-wrap">
                        {currentColumn && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: currentColumn.color || '#64748b' }}
                                />
                                {currentColumn.title}
                            </span>
                        )}

                        <span
                            className={`text-[11px] uppercase font-semibold px-2 py-0.5 rounded border ${priorityBadge}`}
                        >
                            {priorityLabels[priority] || priority}
                        </span>

                        {isExistingCard && card?.color && (
                            <span
                                className="w-3 h-3 rounded-full border border-slate-700"
                                style={{ backgroundColor: card.color }}
                                title="Cor de destaque"
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Botão de Alternar Modo: Editar / Visualizar */}
                        {isExistingCard && !isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                                title="Editar dados do cartão"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Editar</span>
                            </button>
                        )}

                        {isExistingCard && isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-2.5 py-1 rounded text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                        )}

                        {isExistingCard && (
                            <button
                                type="button"
                                onClick={handleDeleteCard}
                                className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Excluir Cartão"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                            title="Fechar modal"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* MODO VISUALIZAÇÃO DE DADOS (READ-ONLY ESTRUTURADO E ERGONÔMICO) */}
                {/* ============================================================ */}
                {isExistingCard && !isEditing && card ? (
                    <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
                        {/* Título Principal */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                                {card.title}
                            </h2>

                            {/* Etiquetas */}
                            {card.labels && card.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    {card.labels.map((lbl) => (
                                        <span
                                            key={lbl.id}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border text-slate-200"
                                            style={{
                                                backgroundColor: `${lbl.color_hex}15`,
                                                borderColor: `${lbl.color_hex}40`,
                                            }}
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: lbl.color_hex }}
                                            />
                                            {lbl.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Barra de Ação Rápida de Pomodoro para esta tarefa */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`p-2 rounded-md ${
                                        isActiveInTimer
                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                            : 'bg-slate-800 text-slate-400'
                                    }`}
                                >
                                    <Flame className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-slate-200">
                                        {isActiveInTimer
                                            ? isTimerTicking
                                                ? 'Pomodoro em Andamento nesta Tarefa'
                                                : 'Tarefa Ativa no Pomodoro (Pausada)'
                                            : isInQueue
                                            ? 'Tarefa Enfileirada no Pomodoro'
                                            : 'Focar nesta Tarefa com Pomodoro'}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {isActiveInTimer
                                            ? 'O tempo de foco está sendo contabilizado para este card.'
                                            : 'Inicie uma sessão de foco agora ou adicione à sua fila de tarefas.'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {!isInQueue && !isActiveInTimer && (
                                    <button
                                        type="button"
                                        onClick={() => addToQueue(card)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                        <ListPlus className="w-3.5 h-3.5" />
                                        <span>+ Fila</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isActiveInTimer) {
                                            togglePlay();
                                        } else {
                                            startCard(card);
                                        }
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors ${
                                        isActiveInTimer
                                            ? isTimerTicking
                                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                            : 'bg-rose-600 text-white hover:bg-rose-500'
                                    }`}
                                >
                                    {isActiveInTimer ? (
                                        isTimerTicking ? (
                                            <>
                                                <Pause className="w-3.5 h-3.5" />
                                                <span>Pausar Foco</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-3.5 h-3.5" />
                                                <span>Retomar Foco</span>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <Flame className="w-3.5 h-3.5" />
                                            <span>Iniciar Pomodoro</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Metadados Utilitários: Data, Estimativa e Tempo Gasto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Data de Entrega */}
                            <div className="p-3 rounded-md border border-slate-800 bg-slate-950/40">
                                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Prazo de Entrega</span>
                                </div>
                                <div className="text-slate-200 font-medium">
                                    {card.due_date ? (
                                        <span className="font-mono">{formatDate(card.due_date)}</span>
                                    ) : (
                                        <span className="text-slate-500 italic">Nenhum prazo definido</span>
                                    )}
                                </div>
                            </div>

                            {/* Tempo e Estimativa */}
                            <div className="p-3 rounded-md border border-slate-800 bg-slate-950/40">
                                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        Tempo Investido
                                    </span>
                                    <span className="font-mono text-slate-300">
                                        {spentMinutes}m {estMinutes > 0 ? `/ ${estMinutes}m` : ''}
                                    </span>
                                </div>
                                {estMinutes > 0 ? (
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1.5">
                                        <div
                                            className={`h-full transition-all duration-300 ${
                                                spentMinutes > estMinutes ? 'bg-rose-500' : 'bg-sky-500'
                                            }`}
                                            style={{ width: `${Math.min(100, (spentMinutes / estMinutes) * 100)}%` }}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-slate-500 italic">
                                        {spentMinutes > 0 ? `${spentMinutes} minutos registrados` : 'Nenhum tempo registrado'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="space-y-1.5">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Descrição
                            </h4>
                            {card.description && card.description.trim() ? (
                                <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed p-3 rounded-md bg-slate-950/40 border border-slate-800/80">
                                    {card.description}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic p-3 rounded-md bg-slate-950/20 border border-slate-800/40">
                                    Nenhuma descrição informada para este cartão.
                                </p>
                            )}
                        </div>

                        {/* Checklist de Subtarefas com Toggle Direto */}
                        <div className="space-y-2 border-t border-slate-800 pt-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                                    Subtarefas ({completedSubtasks}/{totalSubtasks})
                                </h4>
                                {totalSubtasks > 0 && (
                                    <span className="font-mono text-[11px] text-slate-400">
                                        {subtaskProgress}% concluído
                                    </span>
                                )}
                            </div>

                            {totalSubtasks > 0 && (
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-300"
                                        style={{ width: `${subtaskProgress}%` }}
                                    />
                                </div>
                            )}

                            {/* Lista Interativa */}
                            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                {currentSubtasks.map((st) => (
                                    <div
                                        key={st.id}
                                        className="flex items-center justify-between gap-2.5 p-2 rounded bg-slate-950/60 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                                    >
                                        <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={st.is_completed}
                                                onChange={() => handleToggleSubtask(st.id)}
                                                className="rounded-xs border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                                            />
                                            <span
                                                className={`text-slate-200 truncate ${
                                                    st.is_completed ? 'line-through text-slate-500' : ''
                                                }`}
                                            >
                                                {st.title}
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSubtask(st.id)}
                                            className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                                            title="Excluir subtarefa"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Adicionar subtarefa rápida sem precisar entrar no modo de edição */}
                            <div className="flex gap-2 pt-1">
                                <input
                                    ref={subtaskInputRef}
                                    type="text"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAddSubtask(e);
                                        }
                                    }}
                                    placeholder="Adicionar subtarefa rápida..."
                                    className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSubtask}
                                    disabled={!newSubtaskTitle.trim()}
                                    className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40 transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>

                        {/* Rodapé com Mover Rápido de Coluna */}
                        <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 flex items-center gap-1">
                                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                                    Mover para:
                                </span>
                                <select
                                    value={card.column_id}
                                    onChange={(e) => handleMoveColumnQuick(Number(e.target.value))}
                                    className="rounded bg-slate-950 border border-slate-700 text-slate-200 py-1 px-2 text-xs focus:border-slate-500 focus:outline-none"
                                >
                                    {columns.map((col) => (
                                        <option key={col.id} value={col.id}>
                                            {col.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 hover:text-white transition-colors"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Editar Detalhes</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ============================================================ */
                    /* MODO EDIÇÃO / CRIAÇÃO DE DADOS (FORMULÁRIO COMPLETO)          */
                    /* ============================================================ */
                    <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4 flex-1">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Título *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="O que precisa ser feito?"
                                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                            />
                        </div>

                        {columns && columns.length > 0 && (
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Coluna / Status</label>
                                <select
                                    value={selectedColumnId}
                                    onChange={(e) => setSelectedColumnId(Number(e.target.value))}
                                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
                                >
                                    {columns.map((col) => (
                                        <option key={col.id} value={col.id}>
                                            {col.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
                            <textarea
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Adicione detalhes, links ou especificações..."
                                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none resize-y min-h-[110px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Prioridade</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as Card['priority'])}
                                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
                                >
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Data de Entrega</label>
                                <DatePicker
                                    value={dueDate}
                                    onChange={(val) => setDueDate(val)}
                                    placeholder="DD/MM/AAAA"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Estimativa (min)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="15"
                                    value={estimateMinutes}
                                    onChange={(e) => setEstimateMinutes(e.target.value)}
                                    placeholder="ex: 60"
                                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none font-mono"
                                />
                            </div>
                        </div>

                        {/* Cor de Destaque no estilo KanbanFlow */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Cor do Cartão</label>
                            <div className="flex items-center gap-2">
                                {KANBAN_COLORS.map((c) => (
                                    <button
                                        key={c.label}
                                        type="button"
                                        onClick={() => setColor(c.hex || null)}
                                        className={`w-6 h-6 rounded-xs border transition-all ${
                                            color === c.hex || (!color && !c.hex)
                                                ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 border-white scale-110'
                                                : 'border-slate-700 hover:scale-105'
                                        }`}
                                        style={{
                                            backgroundColor: c.hex || '#334155',
                                        }}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Etiquetas (Tags) */}
                        <div className="border-t border-slate-800 pt-3">
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                                    Etiquetas / Tags
                                </label>
                                {boardId && (
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingLabel(!isCreatingLabel)}
                                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        {isCreatingLabel ? 'Fechar' : 'Nova Etiqueta'}
                                    </button>
                                )}
                            </div>

                            {/* Formulário inline para nova etiqueta */}
                            {isCreatingLabel && boardId && (
                                <div className="mb-3 p-2.5 rounded-md border border-slate-700/80 bg-slate-950/70 space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newLabelName}
                                            onChange={(e) => setNewLabelName(e.target.value)}
                                            placeholder="Nome da etiqueta (ex: Bug, Feature)..."
                                            className="flex-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateLabel}
                                            disabled={!newLabelName.trim()}
                                            className="rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-50 transition-colors"
                                        >
                                            Criar
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <span className="text-[11px] text-slate-400 mr-1">Cor:</span>
                                        {LABEL_COLORS.map((lc) => (
                                            <button
                                                key={lc.hex}
                                                type="button"
                                                onClick={() => setNewLabelColor(lc.hex)}
                                                className={`w-5 h-5 rounded-full border transition-all ${
                                                    newLabelColor === lc.hex
                                                        ? 'ring-2 ring-white scale-110'
                                                        : 'border-transparent hover:scale-105'
                                                }`}
                                                style={{ backgroundColor: lc.hex }}
                                                title={lc.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {availableLabels && availableLabels.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {availableLabels.map((lbl) => {
                                        const isSelected = selectedLabels.includes(lbl.id);
                                        return (
                                            <div
                                                key={lbl.id}
                                                className={`group inline-flex items-center text-xs rounded border transition-colors ${
                                                    isSelected
                                                        ? 'border-slate-400 bg-slate-800 text-white font-medium'
                                                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                                                }`}
                                                style={{
                                                    borderColor: isSelected ? lbl.color_hex : undefined,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleLabel(lbl.id)}
                                                    className="px-2 py-1 flex items-center"
                                                >
                                                    <span
                                                        className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
                                                        style={{ backgroundColor: lbl.color_hex }}
                                                    />
                                                    {lbl.name}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteLabel(e, lbl)}
                                                    className="p-1 pr-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                                                    title="Excluir esta etiqueta do quadro"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic">
                                    Nenhuma etiqueta criada ainda. Clique em "+ Nova Etiqueta" acima para adicionar.
                                </p>
                            )}
                        </div>

                        {/* Subtarefas */}
                        <div className="border-t border-slate-800 pt-3">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-medium text-slate-300">
                                    Checklist de Subtarefas
                                    {currentSubtasks.length > 0 && (
                                        <span className="ml-1 text-slate-400 font-normal">
                                            ({completedSubtasks}/{totalSubtasks})
                                        </span>
                                    )}
                                </label>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    Pressione Enter para salvar
                                </span>
                            </div>

                            {currentSubtasks.length > 0 && (
                                <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto pr-1">
                                    {currentSubtasks.map((st) => (
                                        <div
                                            key={st.id}
                                            className="flex items-center justify-between gap-2 rounded bg-slate-950/60 px-2.5 py-1.5 border border-slate-800/80 text-xs hover:border-slate-700/80 transition-colors"
                                        >
                                            <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={st.is_completed}
                                                    onChange={() => handleToggleSubtask(st.id)}
                                                    className="rounded-xs border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                                                />
                                                <span
                                                    className={`truncate text-slate-200 ${
                                                        st.is_completed ? 'line-through text-slate-400' : ''
                                                    }`}
                                                >
                                                    {st.title}
                                                </span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSubtask(st.id)}
                                                className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
                                                title="Excluir subtarefa"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    ref={subtaskInputRef}
                                    type="text"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (newSubtaskTitle.trim()) {
                                                handleAddSubtask(e);
                                            }
                                        }
                                    }}
                                    placeholder="Nova subtarefa... (Pressione Enter para salvar)"
                                    className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSubtask}
                                    disabled={!newSubtaskTitle.trim()}
                                    className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40 transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>

                        {/* Footer de Ações do Formulário */}
                        <div className="border-t border-slate-800 pt-4 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (isExistingCard) {
                                        setIsEditing(false);
                                    } else {
                                        onClose();
                                    }
                                }}
                                className="rounded-md px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white transition-colors"
                            >
                                {isExistingCard ? 'Salvar Alterações' : 'Criar Cartão'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
