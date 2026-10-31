import React, { useState, useMemo } from 'react';
import { Column, Card } from '@/types/kanban';
import { CardItem } from './CardItem';
import {
    Plus,
    MoreHorizontal,
    Trash2,
    Clock,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    GripVertical,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface ColumnProps {
    column: Column;
    allColumns?: Column[];
    isFirst?: boolean;
    isLast?: boolean;
    dragHandleProps?: Record<string, any>;
    onMoveLeft?: () => void;
    onMoveRight?: () => void;
    onEditCard: (card: Card) => void;
    onAddCard: (columnId: number) => void;
}

export const ColumnComponent: React.FC<ColumnProps> = ({
    column,
    allColumns = [],
    isFirst = false,
    isLast = false,
    dragHandleProps,
    onMoveLeft,
    onMoveRight,
    onEditCard,
    onAddCard,
}) => {
    const cardCount = column.cards?.length || 0;
    const isWipExceeded = column.wip_limit ? cardCount > column.wip_limit : false;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Droppable apenas para cartões soltos dentro do container desta coluna
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${column.id}`,
        data: {
            type: 'column-container',
            column,
        },
    });

    const cardIds = useMemo(() => (column.cards || []).map((c) => c.id), [column.cards]);

    // Soma total de estimativa da coluna
    const totalEstimateMinutes =
        column.cards?.reduce((acc, c) => acc + (c.estimate_minutes || 0), 0) || 0;
    const totalSpentMinutes =
        column.cards?.reduce(
            (acc, c) => acc + Math.round((c.time_spent_seconds || 0) / 60),
            0
        ) || 0;

    const handleDeleteColumn = () => {
        if (confirm(`Excluir a coluna "${column.title}" e todos os seus cartões?`)) {
            router.delete(`/columns/${column.id}`);
        }
    };

    return (
        <div
            className={`flex flex-col w-full rounded-lg bg-slate-900/50 border transition-all duration-150 max-h-[calc(100vh-160px)] md:max-h-[calc(100vh-140px)] shadow-xs ${
                isWipExceeded ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800/80'
            }`}
        >
            {/* Header da Coluna */}
            <div className="p-2.5 sm:p-3 border-b border-slate-800 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {/* Alça de arrasto da coluna com touch-action: none */}
                    {dragHandleProps && (
                        <div
                            {...dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-0.5 rounded touch-none select-none shrink-0 inline-flex items-center"
                            title="Arraste para reordenar esta coluna"
                        >
                            <GripVertical className="w-3.5 h-3.5" />
                        </div>
                    )}

                    <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: column.color || '#64748b' }}
                    />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 truncate">
                        {column.title}
                    </h3>
                    <span
                        className={`text-xs font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 shrink-0 ${
                            isWipExceeded
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold'
                                : 'bg-slate-800 border-slate-700/60 text-slate-400'
                        }`}
                        title={
                            isWipExceeded
                                ? 'Limite de trabalho em progresso excedido (aviso)!'
                                : 'Contagem / Limite de WIP'
                        }
                    >
                        {isWipExceeded && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                        {cardCount}
                        {column.wip_limit ? ` / ${column.wip_limit}` : ''}
                    </span>
                </div>

                <div className="relative flex items-center gap-1 shrink-0">
                    {/* Botões diretos no cabeçalho: trocar de lado (< e >) */}
                    <div className="flex items-center rounded border border-slate-800 bg-slate-950/70 shadow-xs">
                        <button
                            type="button"
                            disabled={isFirst}
                            onClick={onMoveLeft}
                            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors rounded-l"
                            title="Mover coluna para a esquerda"
                        >
                            <ArrowLeft className="w-3 h-3" />
                        </button>
                        <div className="w-[1px] h-3 bg-slate-800" />
                        <button
                            type="button"
                            disabled={isLast}
                            onClick={onMoveRight}
                            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors rounded-r"
                            title="Mover coluna para a direita"
                        >
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Totalizador de tempo da coluna */}
                    {(totalEstimateMinutes > 0 || totalSpentMinutes > 0) && (
                        <span
                            className="text-[10px] font-mono text-slate-500 hidden sm:flex items-center gap-0.5 px-1 bg-slate-800/50 rounded"
                            title={`Tempo total na coluna: ${totalSpentMinutes}m gastos / ${totalEstimateMinutes}m estimados`}
                        >
                            <Clock className="w-2.5 h-2.5 text-slate-500" />
                            {totalSpentMinutes}m
                            {totalEstimateMinutes > 0 ? `/${totalEstimateMinutes}m` : ''}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => onAddCard(column.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                        title="Adicionar Cartão"
                    >
                        <Plus className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ${
                            isMenuOpen ? 'bg-slate-800 text-slate-100' : ''
                        }`}
                        title="Opções da Coluna"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Menu de Contexto da Coluna */}
                    {isMenuOpen && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-7 z-30 w-48 rounded-md border border-slate-800 bg-slate-900 py-1 shadow-2xl"
                        >
                            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                Organizar Coluna
                            </div>

                            <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    if (onMoveLeft) onMoveLeft();
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Mover para a esquerda</span>
                            </button>

                            <button
                                type="button"
                                disabled={isLast}
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    if (onMoveRight) onMoveRight();
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>Mover para a direita</span>
                            </button>

                            <div className="border-t border-slate-800 my-1" />

                            <button
                                type="button"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleDeleteColumn();
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir Coluna</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Aviso visual se limite WIP excedido */}
            {isWipExceeded && (
                <div className="px-3 py-1 bg-rose-500/10 border-b border-rose-500/20 text-[11px] text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Limite de WIP ({column.wip_limit}) excedido nesta coluna</span>
                </div>
            )}

            {/* Lista de Cartões com scroll vertical independente */}
            <div
                ref={setNodeRef}
                className={`p-2 space-y-2 overflow-y-auto flex-1 min-h-[140px] transition-colors rounded-b-lg ${
                    isOver ? 'bg-slate-800/40 ring-1 ring-sky-500/30' : ''
                }`}
            >
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {column.cards && column.cards.length > 0 ? (
                        column.cards.map((card) => (
                            <CardItem
                                key={card.id}
                                card={card}
                                allColumns={allColumns}
                                onEdit={onEditCard}
                            />
                        ))
                    ) : (
                        <div className="flex h-24 items-center justify-center rounded border border-dashed border-slate-800/80 text-xs text-slate-500">
                            Arraste um cartão ou clique em +
                        </div>
                    )}
                </SortableContext>
            </div>

            {/* Botão de Adição Rápida no Rodapé */}
            <div className="p-2 border-t border-slate-800/60">
                <button
                    type="button"
                    onClick={() => onAddCard(column.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Cartão
                </button>
            </div>
        </div>
    );
};
