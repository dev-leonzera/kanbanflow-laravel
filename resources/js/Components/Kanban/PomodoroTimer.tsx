import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/types/kanban';
import { Play, Pause, RotateCcw, Check, Clock, ChevronDown, Flame, Coffee, Volume2, VolumeX, Settings, X } from 'lucide-react';
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

// Síntese de som suave usando a Web Audio API nativa
const playAlarmSound = (type: 'pomodoro_complete' | 'break_complete') => {
    try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();

        if (type === 'pomodoro_complete') {
            // Sino de conclusão de foco: 3 notas harmônicas suaves subindo (C5 -> E5 -> G5)
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.16);

                gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.16);
                gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.16 + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.16 + 0.6);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + idx * 0.16);
                osc.stop(ctx.currentTime + idx * 0.16 + 0.65);
            });
        } else {
            // Fim de intervalo: acorde suave de chamada para ação
            const notes = [440, 554.37, 659.25];
            notes.forEach((freq) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.85);
            });
        }
    } catch {
        // Ignora silenciosamente se o áudio não puder ser iniciado pelo navegador
    }
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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Preferências com persistência local
    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('kf_sound_enabled');
        return saved !== null ? saved === 'true' : true;
    });

    const [autoStartBreaks, setAutoStartBreaks] = useState<boolean>(() => {
        const saved = localStorage.getItem('kf_auto_start_breaks');
        return saved !== null ? saved === 'true' : false;
    });

    const [autoStartPomodoros, setAutoStartPomodoros] = useState<boolean>(() => {
        const saved = localStorage.getItem('kf_auto_start_pomodoros');
        return saved !== null ? saved === 'true' : false;
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const sessionSecondsElapsed = useRef<number>(0);

    // Atualizar LocalStorage quando preferências mudarem
    useEffect(() => {
        localStorage.setItem('kf_sound_enabled', String(soundEnabled));
    }, [soundEnabled]);

    useEffect(() => {
        localStorage.setItem('kf_auto_start_breaks', String(autoStartBreaks));
    }, [autoStartBreaks]);

    useEffect(() => {
        localStorage.setItem('kf_auto_start_pomodoros', String(autoStartPomodoros));
    }, [autoStartPomodoros]);

    const changeMode = (newMode: Mode, autoStart: boolean = false) => {
        setIsRunning(autoStart);
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

                                if (soundEnabled) {
                                    playAlarmSound('pomodoro_complete');
                                }

                                if (autoStartBreaks) {
                                    setTimeout(() => changeMode('short_break', true), 300);
                                }
                            } else if (mode === 'short_break' || mode === 'long_break') {
                                if (soundEnabled) {
                                    playAlarmSound('break_complete');
                                }

                                if (autoStartPomodoros) {
                                    setTimeout(() => changeMode('pomodoro', true), 300);
                                }
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
    }, [isRunning, mode, selectedCard, soundEnabled, autoStartBreaks, autoStartPomodoros]);

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
        <div className="relative w-full max-w-full">
            {/* Widget Principal adaptado para mobile sem quebrar ou gerar scroll horizontal */}
            <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 bg-slate-900 border border-slate-800 rounded-md px-1.5 sm:px-2.5 py-1 text-slate-200 w-full max-w-full">
                {/* Seletor de Modo */}
                <div className="flex items-center gap-0.5 sm:gap-1 border-r border-slate-800 pr-1 sm:pr-2 shrink-0">
                    <button
                        onClick={() => changeMode('pomodoro')}
                        className={`p-1 sm:px-2 sm:py-0.5 rounded text-xs font-medium transition-colors shrink-0 flex items-center ${
                            mode === 'pomodoro'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title="Foco Pomodoro de 25 min"
                    >
                        <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="hidden sm:inline sm:ml-1">Pomodoro</span>
                    </button>

                    <button
                        onClick={() => changeMode('short_break')}
                        className={`p-1 sm:px-2 sm:py-0.5 rounded text-xs font-medium transition-colors shrink-0 flex items-center ${
                            mode === 'short_break'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title="Pausa curta de 5 min"
                    >
                        <Coffee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="hidden sm:inline sm:ml-1">Pausa</span>
                    </button>

                    <button
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

                {/* Display do Tempo */}
                <div className="font-mono text-xs sm:text-sm font-bold tracking-wider text-slate-100 min-w-[38px] sm:min-w-[50px] text-center shrink-0">
                    {formatTime(timeLeft)}
                </div>

                {/* Controles Play / Pause / Reset */}
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
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
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-colors shrink-0"
                            title="Salvar tempo no cartão selecionado"
                        >
                            <Check className="w-3 h-3 inline mr-0.5" />
                            <span className="hidden sm:inline">Salvar</span>
                        </button>
                    )}
                </div>

                {/* Seletor do Cartão Focado */}
                <div className="relative border-l border-slate-800 pl-1.5 sm:pl-2 min-w-0 flex-1 sm:flex-none">
                    <button
                        onClick={() => {
                            setIsCardDropdownOpen(!isCardDropdownOpen);
                            setIsSettingsOpen(false);
                        }}
                        className="flex items-center gap-1 text-xs text-slate-300 hover:text-slate-100 max-w-[95px] xs:max-w-[130px] sm:max-w-[160px] truncate"
                        title={selectedCard ? `Cartão ativo: ${selectedCard.title}` : 'Vincular tarefa ao timer'}
                    >
                        <span className="truncate">
                            {selectedCard ? selectedCard.title : 'Cartão...'}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                    </button>

                    {isCardDropdownOpen && (
                        <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-md border border-slate-800 bg-slate-900 shadow-2xl py-1 max-h-64 overflow-y-auto">
                            <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                <span>Cartões do Quadro</span>
                                <button
                                    onClick={() => setIsCardDropdownOpen(false)}
                                    className="text-slate-500 hover:text-slate-300"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    onSelectCard(null);
                                    setIsCardDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-b border-slate-850"
                            >
                                Nenhum (Timer Geral)
                            </button>
                            {cards.length === 0 ? (
                                <div className="px-3 py-3 text-center text-xs text-slate-500">
                                    Nenhum cartão encontrado neste quadro.
                                </div>
                            ) : (
                                cards.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            onSelectCard(c);
                                            setIsCardDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs truncate flex items-center justify-between hover:bg-slate-800 transition-colors ${
                                            selectedCard?.id === c.id
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

                {/* Botão de Configurações do Pomodoro (Áudio e Início Automático) */}
                <div className="relative border-l border-slate-800 pl-1 sm:pl-1.5 shrink-0">
                    <button
                        onClick={() => {
                            setIsSettingsOpen(!isSettingsOpen);
                            setIsCardDropdownOpen(false);
                        }}
                        className={`p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
                            isSettingsOpen ? 'text-sky-400 bg-slate-800' : ''
                        }`}
                        title="Configurações do Pomodoro"
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </button>

                    {isSettingsOpen && (
                        <div className="absolute right-0 top-full mt-2 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-slate-800 bg-slate-900 shadow-2xl p-3 text-xs">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
                                <span className="font-semibold text-slate-200">Ajustes do Timer</span>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="text-slate-500 hover:text-slate-300"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Toggle de Aviso Sonoro */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-slate-300">
                                        {soundEnabled ? (
                                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                                        )}
                                        <span>Aviso Sonoro</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextVal = !soundEnabled;
                                            setSoundEnabled(nextVal);
                                            if (nextVal) playAlarmSound('pomodoro_complete');
                                        }}
                                        className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                            soundEnabled ? 'bg-sky-600' : 'bg-slate-700'
                                        }`}
                                    >
                                        <div
                                            className={`bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                                soundEnabled ? 'translate-x-3.5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Toggle Iniciar Pausa Automaticamente */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-300">Autoiniciar Pausas</span>
                                    <button
                                        type="button"
                                        onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                                        className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                            autoStartBreaks ? 'bg-sky-600' : 'bg-slate-700'
                                        }`}
                                    >
                                        <div
                                            className={`bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                                autoStartBreaks ? 'translate-x-3.5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Toggle Iniciar Pomodoro Automaticamente */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-300">Autoiniciar Pomodoro</span>
                                    <button
                                        type="button"
                                        onClick={() => setAutoStartPomodoros(!autoStartPomodoros)}
                                        className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                                            autoStartPomodoros ? 'bg-sky-600' : 'bg-slate-700'
                                        }`}
                                    >
                                        <div
                                            className={`bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                                                autoStartPomodoros ? 'translate-x-3.5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
