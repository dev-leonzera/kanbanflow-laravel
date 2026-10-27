import React from 'react';
import { Card } from '@/types/kanban';
import { CheckSquare, Calendar, Clock, Flame } from 'lucide-react';
import { router } from '@inertiajs/react';

interface CardItemProps {
    card: Card;
    isActiveInTimer?: boolean;
    onEdit: (card: Card) => void;
    onStartTimer?: (card: Card) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
    card,
    isActiveInTimer,
    onEdit,
    onStartTimer,
}) => {
    const completedSubtasks = card.subtasks?.filter((s) => s.is_completed).length || 0;
    const totalSubtasks = card.subtasks?.length || 0;
    const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    const priorityBadge = {
        urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        medium: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    }[card.priority || 'medium'];

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

    return (
        <div
            onClick={() => onEdit(card)}
            className={`group relative cursor-pointer rounded-md border p-4 sm:p-4.5 transition-all duration-150 shadow-xs ${
                isActiveInTimer
                    ? 'border-sky-500/60 bg-sky-950/25 ring-1 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900'
            }`}
            style={
                card.color
                    ? { borderLeftWidth: '4px', borderLeftColor: card.color }
                    : undefined
            }
        >
            {/* Header: Prioridade & Etiquetas & Botão de Timer Rápido */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[11px] uppercase font-semibold px-2 py-0.5 rounded border ${priorityBadge}`}>
                        {card.priority}
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
                            {card.due_date}
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
