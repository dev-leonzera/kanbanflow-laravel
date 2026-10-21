import React from 'react';
import { Card } from '@/types/kanban';
import { CheckSquare, Calendar, Clock, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';

interface CardItemProps {
    card: Card;
    onEdit: (card: Card) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onEdit }) => {
    const completedSubtasks = card.subtasks?.filter(s => s.is_completed).length || 0;
    const totalSubtasks = card.subtasks?.length || 0;
    const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    const priorityBadge = {
        urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        medium: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    }[card.priority || 'medium'];

    const toggleSubtask = (e: React.MouseEvent, subtaskId: number) => {
        e.stopPropagation();
        router.patch(`/subtasks/${subtaskId}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <div
            onClick={() => onEdit(card)}
            className="group relative cursor-pointer rounded-md border border-slate-800 bg-slate-900/90 p-3.5 transition-all duration-150 hover:border-slate-700 hover:bg-slate-900 shadow-sm"
        >
            {/* Header: Prioridade & Etiquetas */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${priorityBadge}`}>
                    {card.priority}
                </span>

                {card.labels?.map((label) => (
                    <span
                        key={label.id}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-700/60 text-slate-300"
                        style={{ backgroundColor: `${label.color_hex}15`, borderColor: `${label.color_hex}40` }}
                    >
                        {label.name}
                    </span>
                ))}
            </div>

            {/* Título */}
            <h4 className="text-sm font-medium text-slate-200 leading-snug group-hover:text-white transition-colors">
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

                    {/* Preview das subtarefas */}
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
                                    className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span className={`truncate ${st.is_completed ? 'line-through text-slate-500' : ''}`}>
                                    {st.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer: Data de Entrega & Estimativa */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                    {card.due_date && (
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {card.due_date}
                        </span>
                    )}
                </div>

                {card.estimate_minutes ? (
                    <span className="flex items-center gap-1 font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {card.estimate_minutes}m
                    </span>
                ) : null}
            </div>
        </div>
    );
};
