import React, { useState } from 'react';
import { Card, Column } from '@/types/kanban';
import { CheckSquare, Calendar, Clock, Flame, ArrowRightLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardItemProps {
    card: Card;
    allColumns?: Column[];
    isActiveInTimer?: boolean;
    isOverlay?: boolean;
    onEdit: (card: Card) => void;
    onStartTimer?: (card: Card) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
    card,
    allColumns = [],
    isActiveInTimer,
    isOverlay = false,
    onEdit,
    onStartTimer,
}) => {
    const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: 'card',
            card,
        },
        disabled: isOverlay,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        ...(card.color ? { borderLeftWidth: '4px', borderLeftColor: card.color } : {}),
    };

    const completedSubtasks = card.subtasks?.filter((s) => s.is_completed).length || 0;
    const totalSubtasks = card.subtasks?.length || 0;
    const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    const priorityBadge = {
        urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        medium: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    }[card.priority || 'medium'];

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

    // Cálculo do tempo gasto
    const spentMinutes = Math.round((card.time_spent_seconds || 0) / 60);
    const estimateMinutes = card.estimate_minutes || 0;
    const isOverEstimate = estimateMinutes > 0 && spentMinutes > estimateMinutes;

    const toggleSubtask = (e: React.MouseEvent, subtaskId: number) => {
        e.stopPropagation();
        router.patch(`/subtasks/${subtaskId}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const handleTimerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onStartTimer) {
            onStartTimer(card);
        }
    };

    const handleMoveCard = (e: React.MouseEvent, targetColumnId: number) => {
        e.stopPropagation();
        setIsMoveMenuOpen(false);
        router.patch(`/cards/${card.id}/move`, {
            column_id: targetColumnId,
        }, {
            preserveScroll: true,
        });
    };

    const otherColumns = (allColumns || []).filter(c => c.id !== card.column_id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onEdit(card)}
            className={`group relative cursor-pointer rounded-md border p-4 sm:p-4.5 transition-all duration-150 shadow-xs ${
                isActiveInTimer
                    ? 'border-sky-500/60 bg-sky-950/25 ring-1 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900'
            } ${isOverlay ? 'shadow-2xl ring-2 ring-sky-500/50 rotate-1 cursor-grabbing' : ''}`}
        >
            {/* Header: Prioridade & Etiquetas & Botão de Timer Rápido & Mover Rápido */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[11px] uppercase font-semibold px-2 py-0.5 rounded border ${priorityBadge}`}>
                        {priorityLabels[card.priority || 'medium'] || card.priority}
                    </span>

                    {card.labels?.map((label) => (
                        <span
                            key={label.id}
                            className="text-[11px] font-medium px-2 py-0.5 rounded border border-slate-700/60 text-slate-300"
                            style={{
                                backgroundColor: `${label.color_hex}15`,
                                borderColor: `${label.color_hex}40`,
                            }}
                        >
                            {label.name}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* Botão rápido: Mover para outra coluna / status */}
                    {otherColumns.length > 0 && !isOverlay && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMoveMenuOpen(!isMoveMenuOpen);
                                }}
                                className="p-1.5 rounded text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                                title="Mover para outra coluna"
                            >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            {isMoveMenuOpen && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-7 z-30 w-44 rounded-md border border-slate-700 bg-slate-900 py-1 shadow-2xl"
                                >
                                    <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                        Mover para
                                    </div>
                                    {otherColumns.map((col) => (
                                        <button
                                            key={col.id}
                                            type="button"
                                            onClick={(e) => handleMoveCard(e, col.id)}
                                            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 transition-colors text-left"
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: col.color || '#64748b' }}
                                            />
                                            <span className="truncate">{col.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botão de foco / Pomodoro para o cartão */}
                    <button
                        onClick={handleTimerClick}
                        className={`p-1.5 rounded text-xs transition-colors ${
                            isActiveInTimer
                                ? 'text-sky-400 bg-sky-500/20'
                                : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title={isActiveInTimer ? 'Cartão em foco no timer' : 'Focar neste cartão no Pomodoro'}
                    >
                        <Flame className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Título com maior destaque e presença visual */}
            <h4 className="text-[15px] font-medium text-slate-100 leading-snug group-hover:text-white transition-colors">
                {card.title}
            </h4>

            {/* Descrição resumida */}
            {card.description && (
                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {card.description}
                </p>
            )}

            {/* Subtarefas */}
            {totalSubtasks > 0 && (
                <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                            <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                            {completedSubtasks}/{totalSubtasks}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{subtaskProgress}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${subtaskProgress}%` }}
                        />
                    </div>

                    {/* Preview das subtarefas com clique direto */}
                    <div className="pt-1 space-y-1">
                        {card.subtasks.map((st) => (
                            <div
                                key={st.id}
                                onClick={(e) => toggleSubtask(e, st.id)}
                                className="flex items-center gap-2 text-xs py-0.5 text-slate-400 hover:text-slate-200"
                            >
                                <input
                                    type="checkbox"
                                    checked={st.is_completed}
                                    readOnly
                                    className="rounded-xs border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span className={`truncate ${st.is_completed ? 'line-through text-slate-500' : ''}`}>
                                    {st.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer: Data de Entrega & Relação Tempo Gasto / Estimativa */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                    {card.due_date && (
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {formatDate(card.due_date)}
                        </span>
                    )}
                </div>

                {/* Tempo Gasto / Estimativa (Estilo KanbanFlow Original) */}
                {(estimateMinutes > 0 || spentMinutes > 0) && (
                    <span
                        className={`flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded border ${
                            isOverEstimate
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                : 'bg-slate-800/80 border-slate-700/50 text-slate-300'
                        }`}
                        title={`Tempo gasto: ${spentMinutes}m | Estimativa: ${estimateMinutes}m`}
                    >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{spentMinutes}m</span>
                        {estimateMinutes > 0 && (
                            <span className="text-slate-500">/ {estimateMinutes}m</span>
                        )}
                    </span>
                )}
            </div>
        </div>
    );
};
