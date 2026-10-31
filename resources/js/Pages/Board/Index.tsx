import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Board, Card, Column } from '@/types/kanban';
import { ColumnComponent } from '@/Components/Kanban/ColumnComponent';
import { CardItem } from '@/Components/Kanban/CardItem';
import { CardModal } from '@/Components/Kanban/CardModal';
import { PomodoroTimer } from '@/Components/Kanban/PomodoroTimer';
import { PomodoroProvider } from '@/Components/Kanban/PomodoroContext';
import { Plus, Search } from 'lucide-react';
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
    CollisionDetection,
    pointerWithin,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BoardIndexProps {
    board: Board;
    boards?: Board[];
}

// Wrapper sortable para cada coluna do Kanban com alça dedicada
interface SortableColumnProps {
    column: Column;
    allColumns: Column[];
    isFirst: boolean;
    isLast: boolean;
    onMoveLeft: () => void;
    onMoveRight: () => void;
    onEditCard: (card: Card) => void;
    onAddCard: (columnId: number) => void;
}

const SortableColumnItem: React.FC<SortableColumnProps> = ({
    column,
    allColumns,
    isFirst,
    isLast,
    onMoveLeft,
    onMoveRight,
    onEditCard,
    onAddCard,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `col-${column.id}`,
        data: {
            type: 'column',
            column,
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            id={`column-${column.id}`}
            className="snap-start shrink-0 w-[84vw] sm:w-80"
        >
            <ColumnComponent
                column={column}
                allColumns={allColumns}
                isFirst={isFirst}
                isLast={isLast}
                dragHandleProps={{ ...attributes, ...listeners }}
                onMoveLeft={onMoveLeft}
                onMoveRight={onMoveRight}
                onEditCard={onEditCard}
                onAddCard={onAddCard}
            />
        </div>
    );
};

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

    // Item em arrasto ativo (Card ou Column)
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);

    // Sensores do DnD: distância mínima de 4px para ativar sem interferir em cliques
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
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

    // Lista plana de todos os cartões para o seletor do Timer e tags
    const allCards: Card[] = useMemo(
        () => columnsState.flatMap((col) => col.cards || []),
        [columnsState]
    );

    // Abre modal em modo de visualização / leitura do card
    const handleOpenCard = (card: Card) => {
        setSelectedCard(card);
        setTargetColumnId(card.column_id);
        setIsCardModalOpen(true);
    };

    // Abre modal em modo de criação
    const handleAddCard = (columnId: number) => {
        setSelectedCard(null);
        setTargetColumnId(columnId);
        setIsCardModalOpen(true);
    };

    const handleCreateColumn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newColumnTitle.trim()) return;

        router.post(
            `/boards/${board.id}/columns`,
            {
                title: newColumnTitle.trim(),
                wip_limit: newColumnWip ? parseInt(newColumnWip, 10) : null,
            },
            {
                onSuccess: () => {
                    setNewColumnTitle('');
                    setNewColumnWip('');
                    setIsAddColumnOpen(false);
                },
            }
        );
    };

    // Reordenação de Colunas via Botões de Trocar de Lado (< e >)
    const handleMoveColumn = useCallback(
        (columnId: number, direction: 'left' | 'right') => {
            const currentIndex = columnsState.findIndex((c) => c.id === columnId);
            if (currentIndex === -1) return;

            const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex < 0 || targetIndex >= columnsState.length) return;

            const updated = arrayMove(columnsState, currentIndex, targetIndex);
            setColumnsState(updated);

            const columnOrders = updated.map((col, idx) => ({
                id: col.id,
                order_position: idx,
            }));

            router.post(
                `/boards/${board.id}/columns/reorder`,
                { column_orders: columnOrders },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onError: () => {
                        setColumnsState(board.columns || []);
                    },
                }
            );
        },
        [columnsState, board.id]
    );

    // Auxiliar para identificar qual coluna corresponde a qualquer elemento over
    const resolveColumnId = (item: any): number | null => {
        if (!item) return null;
        const idStr = String(item.id);
        if (idStr.startsWith('col-')) {
            return parseInt(idStr.replace('col-', ''), 10);
        }
        if (idStr.startsWith('column-')) {
            return parseInt(idStr.replace('column-', ''), 10);
        }
        if (item.data?.current?.column?.id) {
            return Number(item.data.current.column.id);
        }
        if (item.data?.current?.card?.column_id) {
            return Number(item.data.current.card.column_id);
        }
        const cardId = Number(item.id);
        if (!isNaN(cardId)) {
            const found = columnsState.find((c) => c.cards?.some((card) => card.id === cardId));
            if (found) return found.id;
        }
        return null;
    };

    const findColumnByCardId = (cardId: number): Column | undefined => {
        return columnsState.find((col) => col.cards?.some((c) => c.id === cardId));
    };

    // Estratégia de Colisão customizada: quando arrasta coluna, avalia APENAS outras colunas!
    const customCollisionDetection: CollisionDetection = (args) => {
        if (args.active.data.current?.type === 'column') {
            const columnContainers = args.droppableContainers.filter(
                (container) =>
                    container.data.current?.type === 'column' ||
                    String(container.id).startsWith('col-')
            );
            return closestCorners({
                ...args,
                droppableContainers: columnContainers,
            });
        }
        return closestCorners(args);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const type = event.active.data.current?.type;
        if (type === 'column') {
            setActiveColumn(event.active.data.current?.column as Column);
            setActiveCard(null);
        } else {
            const card = event.active.data.current?.card as Card;
            setActiveCard(card || null);
            setActiveColumn(null);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        // 1. Reordenação dinâmica visual de colunas durante o arrasto
        if (active.data.current?.type === 'column') {
            const activeColId = resolveColumnId(active);
            const overColId = resolveColumnId(over);

            if (activeColId && overColId && activeColId !== overColId) {
                setColumnsState((prev) => {
                    const oldIndex = prev.findIndex((c) => c.id === activeColId);
                    const newIndex = prev.findIndex((c) => c.id === overColId);
                    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                        return arrayMove(prev, oldIndex, newIndex);
                    }
                    return prev;
                });
            }
            return;
        }

        // 2. Movimento de cartões entre colunas
        const activeId = Number(active.id);
        const overId = over.id;

        const sourceColumn = findColumnByCardId(activeId);
        const targetColumn =
            over.data.current?.type === 'column-container' || over.data.current?.type === 'column'
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
                newTargetCards.splice(overIndex, 0, {
                    ...activeCardItem,
                    column_id: targetColumn.id,
                });
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
        setActiveColumn(null);

        // 1. PERSISTÊNCIA DA REORDENAÇÃO DE COLUNAS
        if (active.data.current?.type === 'column') {
            const columnOrders = columnsState.map((col, idx) => ({
                id: col.id,
                order_position: idx,
            }));

            router.post(
                `/boards/${board.id}/columns/reorder`,
                { column_orders: columnOrders },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onError: () => {
                        setColumnsState(board.columns || []);
                    },
                }
            );
            return;
        }

        if (!over) {
            setColumnsState(board.columns || []);
            return;
        }

        // 2. PERSISTÊNCIA DA REORDENAÇÃO DE CARTÕES
        const activeId = Number(active.id);
        const overId = over.id;

        const targetColumn =
            over.data.current?.type === 'column-container' || over.data.current?.type === 'column'
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

        router.post(
            '/cards/reorder',
            {
                column_id: targetColumn.id,
                card_orders: cardOrders,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setColumnsState(board.columns || []);
                },
            }
        );
    };

    const handleDragCancel = () => {
        setActiveCard(null);
        setActiveColumn(null);
        setColumnsState(board.columns || []);
    };

    // Filtros de busca, prioridade e etiquetas aplicados aos cartões exibidos
    const filteredColumns = columnsState.map((column) => ({
        ...column,
        cards:
            column.cards?.filter((card) => {
                const matchesSearch =
                    searchQuery === '' ||
                    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (card.description &&
                        card.description.toLowerCase().includes(searchQuery.toLowerCase()));

                const matchesPriority = priorityFilter === 'all' || card.priority === priorityFilter;

                const matchesTag =
                    tagFilter === 'all' || card.labels?.some((l) => String(l.id) === String(tagFilter));

                return matchesSearch && matchesPriority && matchesTag;
            }) || [],
    }));

    const columnIds = useMemo(() => filteredColumns.map((c) => `col-${c.id}`), [filteredColumns]);

    return (
        <PomodoroProvider boardId={board.id} allCards={allCards} columns={columnsState}>
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

                        {/* Centro: Widget Pomodoro Timer Completo com Fila e Ajustes */}
                        <div className="w-full lg:w-auto pb-1 lg:pb-0">
                            <PomodoroTimer />
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
                                        el.scrollIntoView({
                                            behavior: 'smooth',
                                            inline: 'start',
                                            block: 'nearest',
                                        });
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
                    collisionDetection={customCollisionDetection}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <div className="flex-1 p-3 sm:p-4 flex gap-3 sm:gap-4 overflow-x-auto select-none bg-slate-950 text-slate-100 snap-x snap-mandatory md:snap-none scroll-smooth w-full max-w-full min-w-0 scroll-pl-3 sm:scroll-pl-4">
                        {/* Contexto de Ordenação Horizontal das Colunas */}
                        <SortableContext
                            items={columnIds}
                            strategy={horizontalListSortingStrategy}
                        >
                            {filteredColumns.map((column, index) => (
                                <SortableColumnItem
                                    key={column.id}
                                    column={column}
                                    allColumns={board.columns || []}
                                    isFirst={index === 0}
                                    isLast={index === filteredColumns.length - 1}
                                    onMoveLeft={() => handleMoveColumn(column.id, 'left')}
                                    onMoveRight={() => handleMoveColumn(column.id, 'right')}
                                    onEditCard={handleOpenCard}
                                    onAddCard={handleAddCard}
                                />
                            ))}
                        </SortableContext>

                        {/* Botão de Adicionar Nova Coluna */}
                        <div className="snap-start shrink-0 w-[84vw] sm:w-80 pr-2 sm:pr-0">
                            {isAddColumnOpen ? (
                                <form
                                    onSubmit={handleCreateColumn}
                                    className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-3"
                                >
                                    <h4 className="text-xs font-semibold uppercase text-slate-300 tracking-wider">
                                        Nova Coluna
                                    </h4>
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

                    {/* Overlay durante Drag */}
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
                        ) : activeColumn ? (
                            <div className="w-[84vw] sm:w-80 opacity-90 rotate-1 pointer-events-none">
                                <ColumnComponent
                                    column={activeColumn}
                                    allColumns={board.columns || []}
                                    onEditCard={() => {}}
                                    onAddCard={() => {}}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {/* Modal de Detalhes / Edição / Criação do Cartão */}
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
        </PomodoroProvider>
    );
}
