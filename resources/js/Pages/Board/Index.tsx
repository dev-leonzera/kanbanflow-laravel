import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Board, Card, Column } from '@/types/kanban';
import { ColumnComponent } from '@/Components/Kanban/ColumnComponent';
import { CardItem } from '@/Components/Kanban/CardItem';
import { CardModal } from '@/Components/Kanban/CardModal';
import { PomodoroTimer } from '@/Components/Kanban/PomodoroTimer';
import { Plus, Search, Tag } from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface BoardIndexProps {
    board: Board;
    boards?: Board[];
}

export default function Index({ board, boards = [] }: BoardIndexProps) {
    const [columnsState, setColumnsState] = useState<Column[]>(board.columns || []);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [targetColumnId, setTargetColumnId] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [tagFilter, setTagFilter] = useState<string>('all');
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [newColumnWip, setNewColumnWip] = useState('');

    // Cartão em arrasto ativo
    const [activeCard, setActiveCard] = useState<Card | null>(null);

    // Cartão em foco no Pomodoro Timer
    const [timerActiveCard, setTimerActiveCard] = useState<Card | null>(null);

    // Sensores do DnD (com restrição de distância de 5px para não atrapalhar cliques normais)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Sincroniza estado das colunas e cartão selecionado quando as props do servidor mudam
    useEffect(() => {
        setColumnsState(board.columns || []);
        if (selectedCard) {
            const freshCard = (board.columns || [])
                .flatMap((col) => col.cards || [])
                .find((c) => c.id === selectedCard.id);
            if (freshCard) {
                setSelectedCard(freshCard);
            }
        }
    }, [board.columns]);

    // Lista plana de todos os cartões para o seletor do Timer
    const allCards: Card[] = columnsState.flatMap((col) => col.cards || []);

    const handleEditCard = (card: Card) => {
        setSelectedCard(card);
        setTargetColumnId(card.column_id);
        setIsCardModalOpen(true);
    };

    const handleAddCard = (columnId: number) => {
        setSelectedCard(null);
        setTargetColumnId(columnId);
        setIsCardModalOpen(true);
    };

    const handleStartTimerForCard = (card: Card) => {
        setTimerActiveCard(card);
    };

    const handleCreateColumn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newColumnTitle.trim()) return;

        router.post(`/boards/${board.id}/columns`, {
            title: newColumnTitle.trim(),
            wip_limit: newColumnWip ? parseInt(newColumnWip, 10) : null,
        }, {
            onSuccess: () => {
                setNewColumnTitle('');
                setNewColumnWip('');
                setIsAddColumnOpen(false);
            },
        });
    };

    // Auxiliares do DnD
    const findColumnByCardId = (cardId: number): Column | undefined => {
        return columnsState.find((col) => col.cards?.some((c) => c.id === cardId));
    };

    const handleDragStart = (event: DragStartEvent) => {
        const card = event.active.data.current?.card as Card;
        setActiveCard(card || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = Number(active.id);
        const overId = over.id;

        const sourceColumn = findColumnByCardId(activeId);
        const targetColumn =
            over.data.current?.type === 'column'
                ? (over.data.current.column as Column)
                : findColumnByCardId(Number(overId));

        if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) {
            return;
        }

        setColumnsState((prev) => {
            const activeCardItem = sourceColumn.cards?.find((c) => c.id === activeId);
            if (!activeCardItem) return prev;

            const newSourceCards = (sourceColumn.cards || []).filter((c) => c.id !== activeId);
            const newTargetCards = [...(targetColumn.cards || [])];

            const overIndex = newTargetCards.findIndex((c) => c.id === Number(overId));
            if (overIndex >= 0) {
                newTargetCards.splice(overIndex, 0, { ...activeCardItem, column_id: targetColumn.id });
            } else {
                newTargetCards.push({ ...activeCardItem, column_id: targetColumn.id });
            }

            return prev.map((col) => {
                if (col.id === sourceColumn.id) {
                    return { ...col, cards: newSourceCards };
                }
                if (col.id === targetColumn.id) {
                    return { ...col, cards: newTargetCards };
                }
                return col;
            });
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);

        if (!over) {
            setColumnsState(board.columns || []);
            return;
        }

        const activeId = Number(active.id);
        const overId = over.id;

        const targetColumn =
            over.data.current?.type === 'column'
                ? (over.data.current.column as Column)
                : findColumnByCardId(Number(overId)) || findColumnByCardId(activeId);

        if (!targetColumn) {
            setColumnsState(board.columns || []);
            return;
        }

        const colInState = columnsState.find((c) => c.id === targetColumn.id);
        if (!colInState) return;

        const oldIndex = colInState.cards?.findIndex((c) => c.id === activeId) ?? -1;
        const overIndex = colInState.cards?.findIndex((c) => c.id === Number(overId)) ?? -1;

        let finalCards = colInState.cards || [];
        if (oldIndex >= 0 && overIndex >= 0 && oldIndex !== overIndex) {
            finalCards = arrayMove(finalCards, oldIndex, overIndex);
            setColumnsState((prev) =>
                prev.map((col) => (col.id === colInState.id ? { ...col, cards: finalCards } : col))
            );
        }

        const cardOrders = finalCards.map((c, idx) => ({
            id: c.id,
            order_position: idx,
        }));

        router.post('/cards/reorder', {
            column_id: targetColumn.id,
            card_orders: cardOrders,
        }, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                setColumnsState(board.columns || []);
            },
        });
    };

    const handleDragCancel = () => {
        setActiveCard(null);
        setColumnsState(board.columns || []);
    };

    // Filtros de busca, prioridade e etiquetas aplicados aos cartões exibidos
    const filteredColumns = columnsState.map((column) => ({
        ...column,
        cards: column.cards?.filter((card) => {
            const matchesSearch =
                searchQuery === '' ||
                card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (card.description && card.description.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesPriority = priorityFilter === 'all' || card.priority === priorityFilter;

            const matchesTag =
                tagFilter === 'all' || card.labels?.some((l) => String(l.id) === String(tagFilter));

            return matchesSearch && matchesPriority && matchesTag;
        }) || [],
    }));

    return (
        <AuthenticatedLayout
            boards={boards}
            currentBoard={board}
            header={
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 w-full max-w-full">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold leading-tight text-slate-100 flex items-center gap-2">
                                {board.title}
                            </h2>
                            {board.description && (
                                <p className="text-xs text-slate-400 mt-0.5">{board.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Centro: Widget Pomodoro Timer */}
                    <div className="w-full lg:w-auto pb-1 lg:pb-0">
                        <PomodoroTimer
                            cards={allCards}
                            selectedCard={timerActiveCard}
                            onSelectCard={setTimerActiveCard}
                        />
                    </div>

                    {/* Barra de Filtros e Busca Rápida */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 min-w-[130px] lg:flex-none">
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                            <input
                                type="text"
                                placeholder="Filtrar tarefas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 pr-3 text-xs rounded-md bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500 w-full lg:w-48"
                            />
                        </div>

                        {/* Filtro por Prioridade */}
                        <div className="relative shrink-0 flex-1 sm:flex-none">
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="h-8 px-2 text-xs rounded-md bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-slate-500 w-full"
                            >
                                <option value="all">Todas Prioridades</option>
                                <option value="urgent">Urgente</option>
                                <option value="high">Alta</option>
                                <option value="medium">Média</option>
                                <option value="low">Baixa</option>
                            </select>
                        </div>

                        {/* Filtro por Etiqueta / Tag */}
                        <div className="relative shrink-0 flex-1 sm:flex-none">
                            <select
                                value={tagFilter}
                                onChange={(e) => setTagFilter(e.target.value)}
                                className="h-8 px-2 text-xs rounded-md bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-slate-500 w-full"
                            >
                                <option value="all">Todas Etiquetas</option>
                                {board.labels?.map((lbl) => (
                                    <option key={lbl.id} value={lbl.id}>
                                        {lbl.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Quadro: ${board.title}`} />

            {/* Mobile Column Indicator / Quick Jump Tabs */}
            {filteredColumns.length > 0 && (
                <div className="flex md:hidden items-center gap-1.5 px-3 py-2 bg-slate-900/90 border-b border-slate-800/80 overflow-x-auto scrollbar-none text-xs w-full max-w-full min-w-0">
                    {filteredColumns.map((col) => (
                        <button
                            key={col.id}
                            type="button"
                            onClick={() => {
                                const el = document.getElementById(`column-${col.id}`);
                                if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                                }
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 whitespace-nowrap active:bg-slate-700"
                        >
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: col.color || '#64748b' }}
                            />
                            <span className="truncate max-w-[100px]">{col.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                                ({col.cards?.length || 0})
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="flex-1 p-3 sm:p-4 flex gap-3 sm:gap-4 overflow-x-auto select-none bg-slate-950 text-slate-100 snap-x snap-mandatory md:snap-none scroll-smooth w-full max-w-full min-w-0 scroll-pl-3 sm:scroll-pl-4">
                    {/* Colunas do Kanban */}
                    {filteredColumns.map((column) => (
                        <div
                            key={column.id}
                            id={`column-${column.id}`}
                            className="snap-start shrink-0 w-[84vw] sm:w-80"
                        >
                            <ColumnComponent
                                column={column}
                                allColumns={board.columns || []}
                                activeTimerCardId={timerActiveCard?.id}
                                onEditCard={handleEditCard}
                                onAddCard={handleAddCard}
                                onStartTimer={handleStartTimerForCard}
                            />
                        </div>
                    ))}

                    {/* Botão de Adicionar Nova Coluna */}
                    <div className="snap-start shrink-0 w-[84vw] sm:w-80 pr-2 sm:pr-0">
                        {isAddColumnOpen ? (
                            <form
                                onSubmit={handleCreateColumn}
                                className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-3"
                            >
                                <h4 className="text-xs font-semibold uppercase text-slate-300 tracking-wider">Nova Coluna</h4>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    placeholder="Nome da coluna (ex: Em Teste)"
                                    className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={newColumnWip}
                                    onChange={(e) => setNewColumnWip(e.target.value)}
                                    placeholder="Limite de WIP (opcional)"
                                    className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-slate-500 focus:outline-none font-mono"
                                />
                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddColumnOpen(false)}
                                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-white"
                                    >
                                        Criar
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsAddColumnOpen(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-800 bg-slate-900/30 py-3 text-xs font-medium text-slate-400 hover:border-slate-700 hover:bg-slate-900/60 hover:text-slate-200 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar Coluna
                            </button>
                        )}
                    </div>
                </div>

                {/* Overlay do Cartão durante Drag */}
                <DragOverlay>
                    {activeCard ? (
                        <div className="w-72 sm:w-80 pointer-events-none">
                            <CardItem
                                card={activeCard}
                                isOverlay
                                allColumns={board.columns || []}
                                onEdit={() => {}}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Modal de Criação / Edição do Cartão */}
            <CardModal
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                card={selectedCard}
                columnId={targetColumnId}
                columns={board.columns || []}
                boardId={board.id}
                availableLabels={board.labels || []}
            />
        </AuthenticatedLayout>
    );
}
