import React, { useState } from 'react';
import { Card, Label } from '@/types/kanban';
import { X, Trash2, Plus, Clock, Calendar, CheckSquare } from 'lucide-react';
import { router } from '@inertiajs/react';

interface CardModalProps {
    card: Card | null;
    columnId?: number;
    availableLabels: Label[];
    isOpen: boolean;
    onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({
    card,
    columnId,
    availableLabels,
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null;

    const isEdit = !!card;

    const [title, setTitle] = useState(card?.title || '');
    const [description, setDescription] = useState(card?.description || '');
    const [priority, setPriority] = useState<Card['priority']>(card?.priority || 'medium');
    const [color, setColor] = useState<string | null>(card?.color || null);
    const [dueDate, setDueDate] = useState(card?.due_date || '');
    const [estimateMinutes, setEstimateMinutes] = useState(card?.estimate_minutes ? String(card.estimate_minutes) : '');
    const [selectedLabels, setSelectedLabels] = useState<number[]>(card?.labels?.map(l => l.id) || []);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    const KANBAN_COLORS = [
        { label: 'Padrão', hex: '' },
        { label: 'Vermelho', hex: '#ef4444' },
        { label: 'Âmbar', hex: '#f59e0b' },
        { label: 'Esmeralda', hex: '#10b981' },
        { label: 'Azul Celeste', hex: '#0ea5e9' },
        { label: 'Índigo', hex: '#6366f1' },
        { label: 'Rosa', hex: '#ec4899' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            column_id: card ? card.column_id : columnId,
            title,
            description,
            priority,
            color: color || null,
            due_date: dueDate || null,
            estimate_minutes: estimateMinutes ? parseInt(estimateMinutes, 10) : null,
            label_ids: selectedLabels,
        };

        if (isEdit && card) {
            router.put(`/cards/${card.id}`, payload, {
                onSuccess: () => onClose(),
            });
        } else {
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

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!card || !newSubtaskTitle.trim()) return;

        router.post(`/cards/${card.id}/subtasks`, {
            title: newSubtaskTitle.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => setNewSubtaskTitle(''),
        });
    };

    const handleDeleteSubtask = (subtaskId: number) => {
        router.delete(`/subtasks/${subtaskId}`, {
            preserveScroll: true,
        });
    };

    const toggleLabel = (labelId: number) => {
        setSelectedLabels(prev =>
            prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="flex flex-col w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900 shadow-2xl max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 p-4">
                    <h3 className="text-base font-semibold text-slate-100">
                        {isEdit ? 'Editar Cartão' : 'Novo Cartão'}
                    </h3>
                    <div className="flex items-center gap-2">
                        {isEdit && (
                            <button
                                onClick={handleDeleteCard}
                                className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Excluir Cartão"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Form Body com scroll */}
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

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Adicione detalhes, links ou especificações..."
                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none resize-none"
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
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none font-mono"
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
                                        (color === c.hex || (!color && !c.hex))
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

                    {/* Etiquetas */}
                    {availableLabels && availableLabels.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Etiquetas</label>
                            <div className="flex flex-wrap gap-1.5">
                                {availableLabels.map((lbl) => {
                                    const isSelected = selectedLabels.includes(lbl.id);
                                    return (
                                        <button
                                            type="button"
                                            key={lbl.id}
                                            onClick={() => toggleLabel(lbl.id)}
                                            className={`text-xs px-2 py-1 rounded border transition-colors ${
                                                isSelected
                                                    ? 'border-slate-400 bg-slate-800 text-white font-medium'
                                                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                                            }`}
                                            style={{
                                                borderColor: isSelected ? lbl.color_hex : undefined,
                                            }}
                                        >
                                            <span
                                                className="inline-block w-2 h-2 rounded-full mr-1.5"
                                                style={{ backgroundColor: lbl.color_hex }}
                                            />
                                            {lbl.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Subtarefas (quando o cartão já existe) */}
                    {isEdit && card && (
                        <div className="border-t border-slate-800 pt-3">
                            <label className="block text-xs font-medium text-slate-300 mb-2">Checklist de Subtarefas</label>
                            <div className="space-y-1.5 mb-3">
                                {card.subtasks?.map((st) => (
                                    <div
                                        key={st.id}
                                        className="flex items-center justify-between rounded bg-slate-950/50 px-2.5 py-1.5 border border-slate-800/80 text-xs"
                                    >
                                        <span className={`text-slate-200 ${st.is_completed ? 'line-through text-slate-500' : ''}`}>
                                            {st.title}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSubtask(st.id)}
                                            className="text-slate-500 hover:text-rose-400"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    placeholder="Nova subtarefa..."
                                    className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSubtask}
                                    className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer de Ações */}
                    <div className="border-t border-slate-800 pt-4 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white transition-colors"
                        >
                            {isEdit ? 'Salvar Alterações' : 'Criar Cartão'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
