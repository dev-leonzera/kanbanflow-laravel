import React, { useState, useRef, useEffect } from 'react';
import { usePomodoro } from './PomodoroContext';
import {
    Play,
    Pause,
    RotateCcw,
    Check,
    Clock,
    ChevronDown,
    Flame,
    Coffee,
    Volume2,
    VolumeX,
    Settings,
    X,
    Bell,
    ListOrdered,
    Sliders,
    Layers,
    CheckCircle2,
} from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
    const {
        mode,
        timeLeft,
        isRunning,
        pomodorosCompleted,
        activeCard,
        queueIds,
        queueCards,
        settings,
        pipeline,
        columns,
        allCards,
        togglePlay,
        resetTimer,
        changeMode,
        adjustTime,
        selectActiveCard,
        addToQueue,
        removeFromQueue,
        completeActiveCard,
        updateSettings,
        updatePipeline,
        requestNotificationPermission,
    } = usePomodoro();

    const [isCardDropdownOpen, setIsCardDropdownOpen] = useState(false);
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'timer' | 'pipeline'>('timer');

    const cardDropdownRef = useRef<HTMLDivElement>(null);
    const queueRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Fechar dropdowns ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (cardDropdownRef.current && !cardDropdownRef.current.contains(target)) {
                setIsCardDropdownOpen(false);
            }
            if (queueRef.current && !queueRef.current.contains(target)) {
                setIsQueueOpen(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(target)) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (totalSeconds: number): string => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const cardsAvailableForQueue = allCards.filter((c) => !queueIds.includes(c.id));
    const currentCyclePosition = pomodorosCompleted % settings.longBreakInterval;

    // Alternar presença de coluna nas colunas de trabalho
    const toggleWipColumn = (colId: number) => {
        const currentWip = pipeline.wipColumnIds || [];
        let updatedWip: number[];
        if (currentWip.includes(colId)) {
            updatedWip = currentWip.filter((id) => id !== colId);
        } else {
            updatedWip = [...currentWip, colId];
        }

        let newStartWip = pipeline.startWipColumnId;
        if (!updatedWip.includes(newStartWip || -1)) {
            newStartWip = updatedWip.length > 0 ? updatedWip[0] : null;
        }

        updatePipeline({
            wipColumnIds: updatedWip,
            startWipColumnId: newStartWip,
        });
    };

    return (
        <div className="relative w-full max-w-full">
            {/* Widget Principal */}
            <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 bg-slate-900 border border-slate-800 rounded-md px-1.5 sm:px-2.5 py-1 text-slate-200 w-full max-w-full shadow-xs">
                {/* Seletor de Modo */}
                <div className="flex items-center gap-0.5 sm:gap-1 border-r border-slate-800 pr-1 sm:pr-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => changeMode('pomodoro')}
                        className={`p-1 sm:px-2 sm:py-0.5 rounded text-xs font-medium transition-colors shrink-0 flex items-center ${
                            mode === 'pomodoro'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title={`Foco Pomodoro de ${settings.pomodoroMinutes} min`}
                    >
                        <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="hidden sm:inline sm:ml-1">Pomodoro</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => changeMode('short_break')}
                        className={`p-1 sm:px-2 sm:py-0.5 rounded text-xs font-medium transition-colors shrink-0 flex items-center ${
                            mode === 'short_break'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title={`Pausa curta de ${settings.shortBreakMinutes} min`}
                    >
                        <Coffee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="hidden sm:inline sm:ml-1">Pausa</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => changeMode('long_break')}
                        className={`hidden md:flex p-1 sm:px-2 sm:py-0.5 rounded text-xs font-medium transition-colors shrink-0 items-center ${
                            mode === 'long_break'
                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title={`Pausa longa de ${settings.longBreakMinutes} min`}
                    >
                        <Coffee className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="ml-1">Longa</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => changeMode('stopwatch')}
                        className={`p-1 sm:px-2 sm:py-0.5 rounded text-xs font-medium transition-colors shrink-0 flex items-center ${
                            mode === 'stopwatch'
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title="Cronômetro livre"
                    >
                        <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="hidden sm:inline sm:ml-1">Livre</span>
                    </button>
                </div>

                {/* Display do Tempo com Microajuste */}
                <div className="flex items-center gap-1 shrink-0">
                    <div
                        className={`font-mono text-xs sm:text-sm font-bold tracking-wider min-w-[38px] sm:min-w-[50px] text-center ${
                            isRunning ? 'text-amber-400' : 'text-slate-100'
                        }`}
                    >
                        {formatTime(timeLeft)}
                    </div>

                    <button
                        type="button"
                        onClick={() => adjustTime(300)}
                        className="hidden xs:inline-flex px-1 py-0.5 text-[10px] font-mono rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Adicionar +5 minutos ao timer"
                    >
                        +5m
                    </button>
                </div>

                {/* Controles Play / Pause / Reset / Concluir */}
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={togglePlay}
                        className={`p-1 rounded-sm border transition-colors ${
                            isRunning
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                                : 'bg-sky-600/20 border-sky-500/40 text-sky-400 hover:bg-sky-600/30'
                        }`}
                        title={isRunning ? 'Pausar' : 'Iniciar'}
                    >
                        {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    <button
                        type="button"
                        onClick={resetTimer}
                        className="p-1 rounded-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Reiniciar timer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Botão Concluir Tarefa Ativa e Mover para a Coluna de Conclusão da Esteira */}
                    {activeCard && (
                        <button
                            type="button"
                            onClick={completeActiveCard}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-colors shrink-0 flex items-center gap-1"
                            title="Marcar como Concluído, mover na esteira e avançar para o próximo da fila"
                        >
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">Concluir</span>
                        </button>
                    )}
                </div>

                {/* Cartão Ativo + Dropdown de Seleção */}
                <div
                    ref={cardDropdownRef}
                    className="relative border-l border-slate-800 pl-1.5 sm:pl-2 min-w-0 flex-1 sm:flex-none"
                >
                    <button
                        type="button"
                        onClick={() => {
                            setIsCardDropdownOpen(!isCardDropdownOpen);
                            setIsQueueOpen(false);
                            setIsSettingsOpen(false);
                        }}
                        className={`flex items-center gap-1 text-xs max-w-[95px] xs:max-w-[130px] sm:max-w-[160px] truncate transition-colors ${
                            activeCard ? 'text-sky-300 hover:text-sky-200' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title={activeCard ? `Cartão ativo: ${activeCard.title}` : 'Vincular tarefa ao timer'}
                    >
                        <span className="truncate">
                            {activeCard ? activeCard.title : 'Selecionar...'}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                    </button>

                    {isCardDropdownOpen && (
                        <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-md border border-slate-800 bg-slate-900 shadow-2xl py-1 max-h-64 overflow-y-auto">
                            <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                <span>Cartões do Quadro</span>
                                <button
                                    type="button"
                                    onClick={() => setIsCardDropdownOpen(false)}
                                    className="text-slate-500 hover:text-slate-300"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    selectActiveCard(null);
                                    setIsCardDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-b border-slate-800"
                            >
                                Nenhum (Timer Geral sem tarefa)
                            </button>
                            {allCards.length === 0 ? (
                                <div className="px-3 py-3 text-center text-xs text-slate-500">
                                    Nenhum cartão encontrado neste quadro.
                                </div>
                            ) : (
                                allCards.map((c) => (
                                    <button
                                        type="button"
                                        key={c.id}
                                        onClick={() => {
                                            selectActiveCard(c);
                                            setIsCardDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs truncate flex items-center justify-between hover:bg-slate-800 transition-colors ${
                                            activeCard?.id === c.id
                                                ? 'bg-sky-500/10 text-sky-400 font-medium'
                                                : 'text-slate-300'
                                        }`}
                                    >
                                        <span className="truncate pr-2">{c.title}</span>
                                        {c.estimate_minutes ? (
                                            <span className="font-mono text-[10px] text-slate-500 shrink-0">
                                                {c.estimate_minutes}m
                                            </span>
                                        ) : null}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Gerenciador da Fila de Foco */}
                <div ref={queueRef} className="relative border-l border-slate-800 pl-1 sm:pl-1.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            setIsQueueOpen(!isQueueOpen);
                            setIsCardDropdownOpen(false);
                            setIsSettingsOpen(false);
                        }}
                        className={`p-1 rounded text-xs transition-colors flex items-center gap-1 ${
                            queueCards.length > 0
                                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                        title="Fila de Tarefas do Pomodoro"
                    >
                        <ListOrdered className="w-3.5 h-3.5" />
                        <span className="font-mono text-[11px] font-bold">
                            {queueCards.length}
                        </span>
                    </button>

                    {isQueueOpen && (
                        <div className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-slate-800 bg-slate-900 shadow-2xl p-3 text-xs">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                                <div className="flex items-center gap-1.5">
                                    <ListOrdered className="w-4 h-4 text-amber-400" />
                                    <span className="font-semibold text-slate-200">Fila do Pomodoro</span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                        {queueCards.length} tarefas
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsQueueOpen(false)}
                                    className="text-slate-500 hover:text-slate-300"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
                                Ao concluir uma tarefa, ela é movida para a coluna final e a esteira avança automaticamente para a próxima.
                            </p>

                            {queueCards.length === 0 ? (
                                <div className="py-4 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded mb-2">
                                    Nenhuma tarefa na fila. Adicione cards pelo botão abaixo ou direto no cartão no quadro.
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 mb-2.5">
                                    {queueCards.map((c, index) => {
                                        const isActive = activeCard?.id === c.id;
                                        return (
                                            <div
                                                key={c.id}
                                                className={`flex items-center justify-between gap-2 p-2 rounded border transition-colors ${
                                                    isActive
                                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-mono text-[10px] text-slate-500 w-4 text-center shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium flex items-center gap-1.5">
                                                            <span>{c.title}</span>
                                                            {isActive && (
                                                                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                                                                    Em Foco
                                                                </span>
                                                            )}
                                                        </div>
                                                        {c.estimate_minutes ? (
                                                            <div className="text-[10px] font-mono text-slate-500">
                                                                {c.estimate_minutes} min previstos
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    {!isActive && (
                                                        <button
                                                            type="button"
                                                            onClick={() => selectActiveCard(c)}
                                                            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                                                            title="Tornar este o card ativo agora"
                                                        >
                                                            <Play className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromQueue(c.id)}
                                                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                                                        title="Remover da fila"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {cardsAvailableForQueue.length > 0 && (
                                <div className="pt-2 border-t border-slate-800">
                                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                                        + Adicionar à fila
                                    </label>
                                    <select
                                        defaultValue=""
                                        onChange={(e) => {
                                            const id = Number(e.target.value);
                                            const targetCard = allCards.find((c) => c.id === id);
                                            if (targetCard) {
                                                addToQueue(targetCard);
                                            }
                                            e.target.value = '';
                                        }}
                                        className="w-full text-xs rounded bg-slate-950 border border-slate-700 text-slate-300 py-1 px-2 focus:border-amber-500 focus:outline-none"
                                    >
                                        <option value="" disabled>
                                            Escolha uma tarefa do quadro...
                                        </option>
                                        {cardsAvailableForQueue.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Botão de Configurações com Painel de Abas (Timer vs Esteira) */}
                <div ref={settingsRef} className="relative border-l border-slate-800 pl-1 sm:pl-1.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            setIsSettingsOpen(!isSettingsOpen);
                            setIsCardDropdownOpen(false);
                            setIsQueueOpen(false);
                        }}
                        className={`p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
                            isSettingsOpen ? 'text-sky-400 bg-slate-800' : ''
                        }`}
                        title="Ajustes do Pomodoro e Esteira"
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </button>

                    {isSettingsOpen && (
                        <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-md border border-slate-800 bg-slate-900 shadow-2xl p-3.5 text-xs">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                                <span className="font-semibold text-slate-200">Configurações</span>
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="text-slate-500 hover:text-slate-300"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Abas: Timer & Ciclos vs Esteira do Quadro */}
                            <div className="flex border-b border-slate-800 mb-3 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setSettingsTab('timer')}
                                    className={`flex-1 pb-2 font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                                        settingsTab === 'timer'
                                            ? 'border-rose-500 text-rose-400 font-semibold'
                                            : 'border-transparent text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <Sliders className="w-3.5 h-3.5" />
                                    <span>Timer & Ciclos</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettingsTab('pipeline')}
                                    className={`flex-1 pb-2 font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                                        settingsTab === 'pipeline'
                                            ? 'border-amber-500 text-amber-400 font-semibold'
                                            : 'border-transparent text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>Esteira Kanban</span>
                                </button>
                            </div>

                            {/* ========================================= */}
                            {/* ABA 1: CONFIGURAÇÕES DE TEMPO E CICLOS    */}
                            {/* ========================================= */}
                            {settingsTab === 'timer' && (
                                <div className="space-y-3">
                                    {/* Ciclo Atual */}
                                    <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                                        <span className="text-[11px] text-slate-400">Progresso do Ciclo</span>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: settings.longBreakInterval }).map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-2.5 h-2.5 rounded-full ${
                                                        idx < currentCyclePosition
                                                            ? 'bg-rose-500 shadow-xs'
                                                            : 'bg-slate-800 border border-slate-700'
                                                    }`}
                                                    title={`Pomodoro ${idx + 1} de ${settings.longBreakInterval}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Duração Pomodoro */}
                                    <div>
                                        <label className="flex items-center justify-between text-slate-300 mb-1">
                                            <span>Foco (Pomodoro)</span>
                                            <span className="font-mono text-slate-400">
                                                {settings.pomodoroMinutes} min
                                            </span>
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="90"
                                            step="5"
                                            value={settings.pomodoroMinutes}
                                            onChange={(e) =>
                                                updateSettings({ pomodoroMinutes: Number(e.target.value) })
                                            }
                                            className="w-full accent-rose-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                                        />
                                    </div>

                                    {/* Duração Pausa Curta */}
                                    <div>
                                        <label className="flex items-center justify-between text-slate-300 mb-1">
                                            <span>Pausa Curta</span>
                                            <span className="font-mono text-slate-400">
                                                {settings.shortBreakMinutes} min
                                            </span>
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            step="1"
                                            value={settings.shortBreakMinutes}
                                            onChange={(e) =>
                                                updateSettings({ shortBreakMinutes: Number(e.target.value) })
                                            }
                                            className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                                        />
                                    </div>

                                    {/* Duração Pausa Longa */}
                                    <div>
                                        <label className="flex items-center justify-between text-slate-300 mb-1">
                                            <span>Pausa Longa</span>
                                            <span className="font-mono text-slate-400">
                                                {settings.longBreakMinutes} min
                                            </span>
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="45"
                                            step="5"
                                            value={settings.longBreakMinutes}
                                            onChange={(e) =>
                                                updateSettings({ longBreakMinutes: Number(e.target.value) })
                                            }
                                            className="w-full accent-teal-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                                        />
                                    </div>

                                    {/* Frequência da Pausa Longa */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                                        <span className="text-slate-300">Pausa Longa a cada</span>
                                        <select
                                            value={settings.longBreakInterval}
                                            onChange={(e) =>
                                                updateSettings({ longBreakInterval: Number(e.target.value) })
                                            }
                                            className="text-xs rounded bg-slate-950 border border-slate-700 text-slate-300 py-0.5 px-2 font-mono"
                                        >
                                            <option value="2">2 pomodoros</option>
                                            <option value="3">3 pomodoros</option>
                                            <option value="4">4 pomodoros</option>
                                            <option value="5">5 pomodoros</option>
                                            <option value="6">6 pomodoros</option>
                                        </select>
                                    </div>

                                    {/* Toggle Aviso Sonoro */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            {settings.soundEnabled ? (
                                                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                                            )}
                                            <span>Aviso Sonoro</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateSettings({ soundEnabled: !settings.soundEnabled })
                                            }
                                            className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                                settings.soundEnabled ? 'bg-sky-600' : 'bg-slate-700'
                                            }`}
                                        >
                                            <div
                                                className={`bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                                    settings.soundEnabled ? 'translate-x-3.5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Toggle Notificações Desktop */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <Bell className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Notificações Desktop</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!settings.notificationsEnabled) {
                                                    requestNotificationPermission();
                                                } else {
                                                    updateSettings({ notificationsEnabled: false });
                                                }
                                            }}
                                            className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                                settings.notificationsEnabled ? 'bg-sky-600' : 'bg-slate-700'
                                            }`}
                                        >
                                            <div
                                                className={`bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                                    settings.notificationsEnabled ? 'translate-x-3.5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Toggles Início Automático */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">Autoiniciar Pausas</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateSettings({ autoStartBreaks: !settings.autoStartBreaks })
                                            }
                                            className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                                settings.autoStartBreaks ? 'bg-sky-600' : 'bg-slate-700'
                                            }`}
                                        >
                                            <div
                                                className={`bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                                    settings.autoStartBreaks ? 'translate-x-3.5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">Autoiniciar Pomodoro</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateSettings({ autoStartPomodoros: !settings.autoStartPomodoros })
                                            }
                                            className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                                settings.autoStartPomodoros ? 'bg-sky-600' : 'bg-slate-700'
                                            }`}
                                        >
                                            <div
                                                className={`bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                                    settings.autoStartPomodoros ? 'translate-x-3.5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ========================================= */}
                            {/* ABA 2: CONFIGURAÇÃO DA ESTEIRA DO QUADRO  */}
                            {/* ========================================= */}
                            {settingsTab === 'pipeline' && (
                                <div className="space-y-3.5">
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Defina as colunas do seu quadro para automatizar a movimentação de tarefas durante o foco e conclusão.
                                    </p>

                                    {/* 1. Coluna Padrão / Entrada */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                            1. Coluna Padrão / Entrada
                                        </label>
                                        <select
                                            value={pipeline.defaultColumnId || ''}
                                            onChange={(e) =>
                                                updatePipeline({ defaultColumnId: Number(e.target.value) })
                                            }
                                            className="w-full text-xs rounded bg-slate-950 border border-slate-700 text-slate-200 py-1.5 px-2 focus:border-amber-500 focus:outline-none"
                                        >
                                            {columns.map((col) => (
                                                <option key={col.id} value={col.id}>
                                                    {col.title}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                                            Onde ficam as tarefas pendentes na fila antes de entrar em foco.
                                        </span>
                                    </div>

                                    {/* 2. Colunas de Trabalho / Em Andamento (Seleção Múltipla) */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                            2. Colunas de Trabalho (WIP)
                                        </label>
                                        <div className="space-y-1.5 bg-slate-950 p-2 rounded border border-slate-800 max-h-36 overflow-y-auto">
                                            {columns.map((col) => {
                                                const isChecked = pipeline.wipColumnIds?.includes(col.id);
                                                return (
                                                    <label
                                                        key={col.id}
                                                        className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors text-xs ${
                                                            isChecked
                                                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                                                : 'hover:bg-slate-800/60 text-slate-400'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleWipColumn(col.id)}
                                                                className="rounded-xs border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                                                            />
                                                            <span
                                                                className="w-2 h-2 rounded-full shrink-0"
                                                                style={{ backgroundColor: col.color || '#64748b' }}
                                                            />
                                                            <span className="font-medium">{col.title}</span>
                                                        </div>
                                                        {col.id === pipeline.startWipColumnId && (
                                                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">
                                                                Entrada
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {/* Sub-opção: Coluna inicial de entrada do trabalho */}
                                        {pipeline.wipColumnIds && pipeline.wipColumnIds.length > 1 && (
                                            <div className="mt-2 pt-2 border-t border-slate-800">
                                                <label className="block text-[10.5px] text-slate-400 mb-1">
                                                    Ao iniciar o Pomodoro, mover inicialmente para:
                                                </label>
                                                <select
                                                    value={pipeline.startWipColumnId || ''}
                                                    onChange={(e) =>
                                                        updatePipeline({ startWipColumnId: Number(e.target.value) })
                                                    }
                                                    className="w-full text-xs rounded bg-slate-950 border border-slate-700 text-slate-300 py-1 px-2 focus:border-amber-500 focus:outline-none"
                                                >
                                                    {columns
                                                        .filter((c) => pipeline.wipColumnIds.includes(c.id))
                                                        .map((col) => (
                                                            <option key={col.id} value={col.id}>
                                                                {col.title}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Coluna de Conclusão */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                            3. Coluna de Conclusão
                                        </label>
                                        <select
                                            value={pipeline.doneColumnId || ''}
                                            onChange={(e) =>
                                                updatePipeline({ doneColumnId: Number(e.target.value) })
                                            }
                                            className="w-full text-xs rounded bg-slate-950 border border-slate-700 text-slate-200 py-1.5 px-2 focus:border-emerald-500 focus:outline-none"
                                        >
                                            {columns.map((col) => (
                                                <option key={col.id} value={col.id}>
                                                    {col.title}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                                            Para onde o card é movido quando você clica em "Concluir" no timer.
                                        </span>
                                    </div>

                                    {/* 4. Automações da Esteira */}
                                    <div className="pt-2 border-t border-slate-800 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-300 font-medium">Mover para trabalho ao dar Play</div>
                                                <div className="text-[10px] text-slate-500">
                                                    Move o card da coluna padrão para a coluna de trabalho inicial.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updatePipeline({ autoMoveOnStart: !pipeline.autoMoveOnStart })
                                                }
                                                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                                                    pipeline.autoMoveOnStart ? 'bg-amber-600' : 'bg-slate-700'
                                                }`}
                                            >
                                                <div
                                                    className={`bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                                        pipeline.autoMoveOnStart ? 'translate-x-3.5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-300 font-medium">Avançar fila ao concluir</div>
                                                <div className="text-[10px] text-slate-500">
                                                    Puxa a próxima tarefa da fila ao atingir a coluna de conclusão.
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updatePipeline({ autoAdvanceOnDone: !pipeline.autoAdvanceOnDone })
                                                }
                                                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                                                    pipeline.autoAdvanceOnDone ? 'bg-emerald-600' : 'bg-slate-700'
                                                }`}
                                            >
                                                <div
                                                    className={`bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                                        pipeline.autoAdvanceOnDone ? 'translate-x-3.5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
