import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/types/kanban';
import { Play, Pause, RotateCcw, Check, Clock, ChevronDown, Flame, Coffee } from 'lucide-react';
import { router } from '@inertiajs/react';

interface PomodoroTimerProps {
    cards: Card[];
    selectedCard: Card | null;
    onSelectCard: (card: Card | null) => void;
}

type Mode = 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch';

const MODE_CONFIG: Record<Mode, { label: string; duration: number }> = {
    pomodoro: { label: 'Pomodoro', duration: 25 * 60 },
    short_break: { label: 'Pausa Curta', duration: 5 * 60 },
    long_break: { label: 'Pausa Longa', duration: 15 * 60 },
    stopwatch: { label: 'Cronômetro', duration: 0 },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
    cards,
    selectedCard,
    onSelectCard,
}) => {
    const [mode, setMode] = useState<Mode>('pomodoro');
    const [timeLeft, setTimeLeft] = useState<number>(MODE_CONFIG.pomodoro.duration);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [pomodorosCompleted, setPomodorosCompleted] = useState<number>(0);
    const [isCardDropdownOpen, setIsCardDropdownOpen] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const sessionSecondsElapsed = useRef<number>(0);

    const changeMode = (newMode: Mode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(MODE_CONFIG[newMode].duration);
        sessionSecondsElapsed.current = 0;
    };

    const togglePlay = () => {
        setIsRunning((prev) => !prev);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(MODE_CONFIG[mode].duration);
        sessionSecondsElapsed.current = 0;
    };

    // Salvar entrada de tempo no backend para o cartão selecionado
    const saveTimeEntry = (seconds: number) => {
        if (!selectedCard || seconds < 5) return;

        router.post(`/cards/${selectedCard.id}/time-entries`, {
            duration_seconds: seconds,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                sessionSecondsElapsed.current += 1;

                if (mode === 'stopwatch') {
                    setTimeLeft((prev) => prev + 1);
                } else {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            setIsRunning(false);
                            if (mode === 'pomodoro') {
                                setPomodorosCompleted((c) => c + 1);
                                if (selectedCard) {
                                    saveTimeEntry(sessionSecondsElapsed.current);
                                }
                                sessionSecondsElapsed.current = 0;
                            }
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, mode, selectedCard]);

    const formatTime = (totalSeconds: number): string => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleLogCurrentSession = () => {
        if (sessionSecondsElapsed.current >= 5) {
            saveTimeEntry(sessionSecondsElapsed.current);
            sessionSecondsElapsed.current = 0;
            resetTimer();
        }
    };

    return (
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 border border-slate-800 rounded-md px-2 sm:px-2.5 py-1 text-slate-200 overflow-x-auto max-w-full">
            {/* Seletor de Modo */}
            <div className="flex items-center gap-1 border-r border-slate-800 pr-1.5 sm:pr-2 shrink-0">
                <button
                    onClick={() => changeMode('pomodoro')}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium transition-colors shrink-0 ${
                        mode === 'pomodoro'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title="Foco de 25 min"
                >
                    <Flame className="w-3.5 h-3.5 inline mr-1 text-rose-500" />
                    <span className="hidden sm:inline">Pomodoro</span>
                    <span className="sm:hidden">25m</span>
                </button>

                <button
                    onClick={() => changeMode('short_break')}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium transition-colors shrink-0 ${
                        mode === 'short_break'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title="Pausa curta de 5 min"
                >
                    <Coffee className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                    <span className="hidden sm:inline">Pausa</span>
                    <span className="sm:hidden">5m</span>
                </button>

                <button
                    onClick={() => changeMode('stopwatch')}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium transition-colors shrink-0 ${
                        mode === 'stopwatch'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title="Cronômetro livre"
                >
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
                    <span className="hidden sm:inline">Livre</span>
                    <span className="sm:hidden">Livre</span>
                </button>
            </div>

            {/* Display do Tempo */}
            <div className="font-mono text-xs sm:text-sm font-bold tracking-wider text-slate-100 min-w-[42px] sm:min-w-[50px] text-center shrink-0">
                {formatTime(timeLeft)}
            </div>

            {/* Controles Play / Pause / Reset */}
            <div className="flex items-center gap-1 shrink-0">
                <button
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
                    onClick={resetTimer}
                    className="p-1 rounded-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Reiniciar timer"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {selectedCard && sessionSecondsElapsed.current >= 5 && (
                    <button
                        onClick={handleLogCurrentSession}
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                        title="Salvar tempo no cartão selecionado"
                    >
                        <Check className="w-3 h-3 inline mr-0.5" />
                        Salvar
                    </button>
                )}
            </div>

            {/* Seletor do Cartão Focado */}
            <div className="relative border-l border-slate-800 pl-2">
                <button
                    onClick={() => setIsCardDropdownOpen(!isCardDropdownOpen)}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-slate-100 max-w-[170px] truncate"
                    title={selectedCard ? `Cartão ativo: ${selectedCard.title}` : 'Vincular tarefa ao timer'}
                >
                    <span className="truncate">
                        {selectedCard ? selectedCard.title : 'Vincular cartão...'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                </button>

                {isCardDropdownOpen && (
                    <div className="absolute right-0 top-8 z-50 w-64 rounded-md border border-slate-800 bg-slate-900 shadow-2xl py-1 max-h-60 overflow-y-auto">
                        <button
                            onClick={() => {
                                onSelectCard(null);
                                setIsCardDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        >
                            Nenhum (Timer Geral)
                        </button>
                        {cards.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    onSelectCard(c);
                                    setIsCardDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs truncate flex items-center justify-between hover:bg-slate-800 ${
                                    selectedCard?.id === c.id
                                        ? 'bg-sky-500/10 text-sky-400 font-medium'
                                        : 'text-slate-300'
                                }`}
                            >
                                <span className="truncate">{c.title}</span>
                                {c.estimate_minutes ? (
                                    <span className="font-mono text-[10px] text-slate-500 ml-2 shrink-0">
                                        {c.estimate_minutes}m
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
