import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Board, Card } from '@/types/kanban';
import { ColumnComponent } from '@/Components/Kanban/ColumnComponent';
import { CardModal } from '@/Components/Kanban/CardModal';
import { PomodoroTimer } from '@/Components/Kanban/PomodoroTimer';
import { Plus, Search, Filter } from 'lucide-react';

interface BoardIndexProps {
    board: Board;
    boards?: Board[];
}

export default function Index({ board, boards = [] }: BoardIndexProps) {
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [targetColumnId, setTargetColumnId] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [newColumnWip, setNewColumnWip] = useState('');

    // Cartão em foco no Pomodoro Timer
    const [timerActiveCard, setTimerActiveCard] = useState<Card | null>(null);

    // Lista plana de todos os cartões para o seletor do Timer
    const allCards: Card[] = board.columns?.flatMap((col) => col.cards || []) || [];

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

    // Filtros de busca e prioridade aplicados aos cartões exibidos
    const filteredColumns = board.columns?.map(column => ({
        ...column,
        cards: column.cards?.filter(card => {
            const matchesSearch = searchQuery === '' ||
                card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (card.description && card.description.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesPriority = priorityFilter === 'all' || card.priority === priorityFilter;

            return matchesSearch && matchesPriority;
        }) || [],
    })) || [];

    return (
        <AuthenticatedLayout
            boards={boards}
            currentBoard={board}
            header={
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                    <div className="w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                        <PomodoroTimer
                            cards={allCards}
                            selectedCard={timerActiveCard}
                            onSelectCard={setTimerActiveCard}
                        />
                    </div>

                    {/* Barra de Filtros e Busca Rápida */}
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:flex-none">
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                            <input
                                type="text"
                                placeholder="Filtrar tarefas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 pr-3 text-xs rounded-md bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500 w-full lg:w-56"
                            />
                        </div>

                        <div className="relative shrink-0">
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="h-8 px-2 text-xs rounded-md bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-slate-500"
                            >
                                <option value="all">Todas</option>
                                <option value="urgent">Urgente</option>
                                <option value="high">Alta</option>
                                <option value="medium">Média</option>
                                <option value="low">Baixa</option>
                            </select>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Quadro: ${board.title}`} />

            {/* Mobile Column Indicator / Quick Jump Tabs */}
            {filteredColumns.length > 0 && (
                <div className="flex md:hidden items-center gap-1.5 px-3 py-2 bg-slate-900/90 border-b border-slate-800/80 overflow-x-auto scrollbar-none text-xs">
                    {filteredColumns.map((col, idx) => (
                        <button
                            key={col.id}
                            type="button"
                            onClick={() => {
                                const el = document.getElementById(`column-${col.id}`);
                                if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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

            <div className="flex-1 p-3 sm:p-4 flex gap-3 sm:gap-4 overflow-x-auto select-none bg-slate-950 text-slate-100 snap-x snap-mandatory md:snap-none scroll-smooth">
                {/* Colunas do Kanban */}
                {filteredColumns.map(column => (
                    <div
                        key={column.id}
                        id={`column-${column.id}`}
                        className="snap-center shrink-0 w-[84vw] sm:w-80"
                    >
                        <ColumnComponent
                            column={column}
                            activeTimerCardId={timerActiveCard?.id}
                            onEditCard={handleEditCard}
                            onAddCard={handleAddCard}
                            onStartTimer={handleStartTimerForCard}
                        />
                    </div>
                ))}

                {/* Botão de Adicionar Nova Coluna */}
                <div className="snap-center shrink-0 w-[84vw] sm:w-80">
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

            {/* Modal de Criação / Edição do Cartão */}
            <CardModal
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                card={selectedCard}
                columnId={targetColumnId}
                availableLabels={board.labels || []}
            />
        </AuthenticatedLayout>
    );
}
