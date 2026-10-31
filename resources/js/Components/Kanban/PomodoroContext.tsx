import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { Card, Column } from '@/types/kanban';
import { router } from '@inertiajs/react';

export type PomodoroMode = 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch';

export interface PomodoroSettings {
    pomodoroMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
}

export interface WorkflowPipeline {
    defaultColumnId: number | null; // Coluna de Entrada / Backlog / A Fazer
    wipColumnIds: number[]; // Colunas de Trabalho / Em Progresso (múltiplas)
    startWipColumnId: number | null; // Coluna de entrada do trabalho ao iniciar foco
    doneColumnId: number | null; // Coluna de Conclusão / Finalizado
    autoMoveOnStart: boolean; // Mover automaticamente para trabalho ao dar play
    autoAdvanceOnDone: boolean; // Avançar para próximo da fila ao concluir
}

const DEFAULT_SETTINGS: PomodoroSettings = {
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    notificationsEnabled: false,
    autoStartBreaks: false,
    autoStartPomodoros: false,
};

// Síntese de som suave usando a Web Audio API nativa
const playAlarmSound = (type: 'pomodoro_complete' | 'break_complete') => {
    try {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();

        if (type === 'pomodoro_complete') {
            const notes = [523.25, 659.25, 783.99, 1046.5];
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
        // Silencioso
    }
};

const sendDesktopNotification = (title: string, body: string) => {
    try {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.ico',
            });
        }
    } catch {
        // Silencioso
    }
};

interface PomodoroContextValue {
    mode: PomodoroMode;
    timeLeft: number;
    isRunning: boolean;
    pomodorosCompleted: number;
    sessionSecondsElapsed: number;
    activeCardId: number | null;
    activeCard: Card | null;
    queueIds: number[];
    queueCards: Card[];
    settings: PomodoroSettings;
    pipeline: WorkflowPipeline;
    columns: Column[];
    allCards: Card[];
    isOverdueBreak: boolean;

    // Ações
    startCard: (card: Card) => void;
    togglePlay: () => void;
    resetTimer: () => void;
    changeMode: (newMode: PomodoroMode, autoStart?: boolean) => void;
    adjustTime: (secondsDelta: number) => void;
    skipCurrent: () => void;
    selectActiveCard: (card: Card | null) => void;
    addToQueue: (card: Card) => void;
    removeFromQueue: (cardId: number) => void;
    reorderQueue: (newQueueIds: number[]) => void;
    advanceQueue: () => void;
    completeActiveCard: () => void;
    logSessionTime: () => void;
    updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
    updatePipeline: (newPipeline: Partial<WorkflowPipeline>) => void;
    requestNotificationPermission: () => Promise<boolean>;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

interface PomodoroProviderProps {
    children: React.ReactNode;
    boardId?: number;
    allCards: Card[];
    columns: Column[];
}

export const PomodoroProvider: React.FC<PomodoroProviderProps> = ({
    children,
    boardId,
    allCards,
    columns,
}) => {
    // 1. Configurações gerais de tempo salvas no localStorage
    const [settings, setSettings] = useState<PomodoroSettings>(() => {
        try {
            const saved = localStorage.getItem('kf_pomodoro_settings');
            if (saved) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
        } catch {
            // Silencioso
        }
        return DEFAULT_SETTINGS;
    });

    // 2. Configurações da Esteira de Trabalho (Pipeline) por Quadro
    const pipelineStorageKey = `kf_workflow_pipeline_${boardId || 'default'}`;

    const defaultPipeline: WorkflowPipeline = useMemo(() => {
        if (!columns || columns.length === 0) {
            return {
                defaultColumnId: null,
                wipColumnIds: [],
                startWipColumnId: null,
                doneColumnId: null,
                autoMoveOnStart: true,
                autoAdvanceOnDone: true,
            };
        }

        const defaultCol = columns[0]?.id ?? null;
        const doneCol =
            columns.find((c) => /conclu|done|finaliz/i.test(c.title))?.id ||
            columns[columns.length - 1]?.id ||
            null;

        const intermediateCols = columns
            .filter((c) => c.id !== defaultCol && c.id !== doneCol)
            .map((c) => c.id);

        const wipCols = intermediateCols.length > 0 ? intermediateCols : [defaultCol];
        const startWip = intermediateCols.length > 0 ? intermediateCols[0] : defaultCol;

        return {
            defaultColumnId: defaultCol,
            wipColumnIds: wipCols,
            startWipColumnId: startWip,
            doneColumnId: doneCol,
            autoMoveOnStart: true,
            autoAdvanceOnDone: true,
        };
    }, [columns]);

    const [pipeline, setPipeline] = useState<WorkflowPipeline>(() => {
        try {
            const saved = localStorage.getItem(pipelineStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...defaultPipeline,
                    ...parsed,
                };
            }
        } catch {
            // Silencioso
        }
        return defaultPipeline;
    });

    // Sincroniza pipeline caso as colunas do board mudem e não haja configuração personalizada
    useEffect(() => {
        try {
            const saved = localStorage.getItem(pipelineStorageKey);
            if (!saved) {
                setPipeline(defaultPipeline);
            }
        } catch {
            setPipeline(defaultPipeline);
        }
    }, [defaultPipeline, pipelineStorageKey]);

    const updatePipeline = (newPartial: Partial<WorkflowPipeline>) => {
        setPipeline((prev) => {
            const updated = { ...prev, ...newPartial };
            try {
                localStorage.setItem(pipelineStorageKey, JSON.stringify(updated));
            } catch {
                // Silencioso
            }
            return updated;
        });
    };

    // 3. Fila de cartões
    const [queueIds, setQueueIds] = useState<number[]>(() => {
        try {
            const saved = localStorage.getItem('kf_pomodoro_queue');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean);
            }
        } catch {
            // Silencioso
        }
        return [];
    });

    // 4. Cartão ativo
    const [activeCardId, setActiveCardId] = useState<number | null>(() => {
        try {
            const saved = localStorage.getItem('kf_timer_active_card_id');
            return saved ? parseInt(saved, 10) : null;
        } catch {
            return null;
        }
    });

    // 5. Estado base do timer
    const [mode, setMode] = useState<PomodoroMode>('pomodoro');
    const [timeLeft, setTimeLeft] = useState<number>(settings.pomodoroMinutes * 60);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [pomodorosCompleted, setPomodorosCompleted] = useState<number>(0);
    const sessionSecondsElapsed = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const getModeDuration = (targetMode: PomodoroMode): number => {
        switch (targetMode) {
            case 'pomodoro':
                return settings.pomodoroMinutes * 60;
            case 'short_break':
                return settings.shortBreakMinutes * 60;
            case 'long_break':
                return settings.longBreakMinutes * 60;
            case 'stopwatch':
                return 0;
        }
    };

    // Inicialização do estado salvo do timer
    useEffect(() => {
        try {
            const saved = localStorage.getItem('kf_pomodoro_state');
            if (saved) {
                const data = JSON.parse(saved);
                const validModes: PomodoroMode[] = ['pomodoro', 'short_break', 'long_break', 'stopwatch'];
                const savedMode: PomodoroMode = validModes.includes(data.mode) ? data.mode : 'pomodoro';
                const completed = typeof data.pomodorosCompleted === 'number' ? data.pomodorosCompleted : 0;
                let elapsed = typeof data.sessionSecondsElapsed === 'number' ? data.sessionSecondsElapsed : 0;
                let running = Boolean(data.isRunning);
                let remaining = typeof data.timeLeft === 'number' ? data.timeLeft : getModeDuration(savedMode);

                if (running && data.lastTimestamp) {
                    const diffSec = Math.max(0, Math.floor((Date.now() - data.lastTimestamp) / 1000));
                    if (savedMode === 'stopwatch') {
                        remaining += diffSec;
                        elapsed += diffSec;
                    } else {
                        if (remaining > diffSec) {
                            remaining -= diffSec;
                            elapsed += diffSec;
                        } else {
                            remaining = 0;
                            elapsed += remaining;
                            running = false;
                        }
                    }
                }

                setMode(savedMode);
                setTimeLeft(remaining);
                setIsRunning(running);
                setPomodorosCompleted(completed);
                sessionSecondsElapsed.current = elapsed;
            }
        } catch {
            // Silencioso
        }
    }, []);

    const updateSettings = (newPartial: Partial<PomodoroSettings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newPartial };
            try {
                localStorage.setItem('kf_pomodoro_settings', JSON.stringify(updated));
            } catch {
                // Silencioso
            }
            return updated;
        });
    };

    const persistTimerState = (override?: {
        mode?: PomodoroMode;
        timeLeft?: number;
        isRunning?: boolean;
        pomodorosCompleted?: number;
    }) => {
        try {
            const payload = {
                mode: override?.mode ?? mode,
                timeLeft: override?.timeLeft ?? timeLeft,
                isRunning: override?.isRunning ?? isRunning,
                pomodorosCompleted: override?.pomodorosCompleted ?? pomodorosCompleted,
                sessionSecondsElapsed: sessionSecondsElapsed.current,
                lastTimestamp: Date.now(),
            };
            localStorage.setItem('kf_pomodoro_state', JSON.stringify(payload));
        } catch {
            // Silencioso
        }
    };

    useEffect(() => {
        try {
            localStorage.setItem('kf_pomodoro_queue', JSON.stringify(queueIds));
        } catch {
            // Silencioso
        }
    }, [queueIds]);

    useEffect(() => {
        try {
            if (activeCardId) {
                localStorage.setItem('kf_timer_active_card_id', String(activeCardId));
            } else {
                localStorage.removeItem('kf_timer_active_card_id');
            }
        } catch {
            // Silencioso
        }
    }, [activeCardId]);

    const activeCard = useMemo(() => {
        if (!activeCardId) return null;
        return allCards.find((c) => c.id === activeCardId) || null;
    }, [allCards, activeCardId]);

    const queueCards = useMemo(() => {
        return queueIds
            .map((id) => allCards.find((c) => c.id === id))
            .filter((c): c is Card => Boolean(c));
    }, [allCards, queueIds]);

    const saveTimeEntry = (cardId: number, seconds: number) => {
        if (!cardId || seconds < 5) return;
        router.post(
            `/cards/${cardId}/time-entries`,
            { duration_seconds: seconds },
            { preserveScroll: true, preserveState: true }
        );
    };

    const logSessionTime = () => {
        if (activeCardId && sessionSecondsElapsed.current >= 5) {
            saveTimeEntry(activeCardId, sessionSecondsElapsed.current);
            sessionSecondsElapsed.current = 0;
        }
    };

    const changeMode = (newMode: PomodoroMode, autoStart: boolean = false) => {
        const duration = getModeDuration(newMode);
        setMode(newMode);
        setTimeLeft(duration);
        setIsRunning(autoStart);
        sessionSecondsElapsed.current = 0;
        persistTimerState({
            mode: newMode,
            timeLeft: duration,
            isRunning: autoStart,
        });
    };

    const togglePlay = () => {
        setIsRunning((prev) => {
            const next = !prev;
            persistTimerState({ isRunning: next });
            return next;
        });
    };

    const resetTimer = () => {
        setIsRunning(false);
        const duration = getModeDuration(mode);
        setTimeLeft(duration);
        sessionSecondsElapsed.current = 0;
        persistTimerState({
            timeLeft: duration,
            isRunning: false,
        });
    };

    const adjustTime = (secondsDelta: number) => {
        setTimeLeft((prev) => {
            const next = Math.max(10, prev + secondsDelta);
            persistTimerState({ timeLeft: next });
            return next;
        });
    };

    const selectActiveCard = (card: Card | null) => {
        if (activeCardId && activeCardId !== card?.id && sessionSecondsElapsed.current >= 5) {
            saveTimeEntry(activeCardId, sessionSecondsElapsed.current);
            sessionSecondsElapsed.current = 0;
        }

        if (card) {
            setActiveCardId(card.id);
            setQueueIds((prev) => {
                if (!prev.includes(card.id)) {
                    return [card.id, ...prev];
                }
                return prev;
            });
        } else {
            setActiveCardId(null);
        }
    };

    // Iniciar foco direto em um cartão com AUTOMAÇÃO DA ESTEIRA
    const startCard = (card: Card) => {
        // Se já é o cartão ativo: alterna Play / Pause
        if (activeCardId === card.id) {
            if (!isRunning) {
                setIsRunning(true);
                persistTimerState({ isRunning: true });
            } else {
                setIsRunning(false);
                persistTimerState({ isRunning: false });
            }
            return;
        }

        // Se for outro cartão: salva tempo do anterior
        if (activeCardId && sessionSecondsElapsed.current >= 5) {
            saveTimeEntry(activeCardId, sessionSecondsElapsed.current);
            sessionSecondsElapsed.current = 0;
        }

        // Define como ativo e coloca no topo da fila
        setActiveCardId(card.id);
        setQueueIds((prev) => {
            const filtered = prev.filter((id) => id !== card.id);
            return [card.id, ...filtered];
        });

        // AUTOMAÇÃO DA ESTEIRA: Move automaticamente para a coluna de trabalho se configurado
        if (pipeline.autoMoveOnStart && pipeline.startWipColumnId) {
            const isInWorkAlready = pipeline.wipColumnIds.includes(card.column_id);
            const isDone = card.column_id === pipeline.doneColumnId;

            if (!isInWorkAlready && !isDone && card.column_id !== pipeline.startWipColumnId) {
                router.patch(
                    `/cards/${card.id}/move`,
                    { column_id: pipeline.startWipColumnId },
                    { preserveScroll: true, preserveState: true }
                );
            }
        }

        // Alterna para Pomodoro e inicia a contagem
        setMode('pomodoro');
        const duration = settings.pomodoroMinutes * 60;
        setTimeLeft(duration);
        setIsRunning(true);
        sessionSecondsElapsed.current = 0;

        persistTimerState({
            mode: 'pomodoro',
            timeLeft: duration,
            isRunning: true,
        });
    };

    const addToQueue = (card: Card) => {
        setQueueIds((prev) => {
            if (prev.includes(card.id)) return prev;
            return [...prev, card.id];
        });

        if (!activeCardId) {
            setActiveCardId(card.id);
        }
    };

    const removeFromQueue = (cardId: number) => {
        setQueueIds((prev) => prev.filter((id) => id !== cardId));
        if (activeCardId === cardId) {
            if (sessionSecondsElapsed.current >= 5) {
                saveTimeEntry(cardId, sessionSecondsElapsed.current);
                sessionSecondsElapsed.current = 0;
            }

            const nextInQueue = queueIds.find((id) => id !== cardId);
            setActiveCardId(nextInQueue || null);
        }
    };

    const reorderQueue = (newQueueIds: number[]) => {
        setQueueIds(newQueueIds);
        if (newQueueIds.length > 0 && newQueueIds[0] !== activeCardId) {
            setActiveCardId(newQueueIds[0]);
        }
    };

    // Avança para o próximo cartão da fila e move-o para a esteira de trabalho se configurado
    const advanceQueue = () => {
        if (activeCardId && sessionSecondsElapsed.current >= 5) {
            saveTimeEntry(activeCardId, sessionSecondsElapsed.current);
            sessionSecondsElapsed.current = 0;
        }

        let nextId: number | null = null;

        setQueueIds((prev) => {
            const remaining = prev.filter((id) => id !== activeCardId);
            nextId = remaining.length > 0 ? remaining[0] : null;
            setActiveCardId(nextId);
            return remaining;
        });

        // Se houver próximo cartão, automatiza seu início na esteira
        if (nextId) {
            const nextCard = allCards.find((c) => c.id === nextId);
            if (nextCard && pipeline.autoMoveOnStart && pipeline.startWipColumnId) {
                const isInWorkAlready = pipeline.wipColumnIds.includes(nextCard.column_id);
                const isDone = nextCard.column_id === pipeline.doneColumnId;

                if (!isInWorkAlready && !isDone && nextCard.column_id !== pipeline.startWipColumnId) {
                    router.patch(
                        `/cards/${nextCard.id}/move`,
                        { column_id: pipeline.startWipColumnId },
                        { preserveScroll: true, preserveState: true }
                    );
                }
            }
        }

        const duration = settings.pomodoroMinutes * 60;
        setTimeLeft(duration);
        setMode('pomodoro');
        sessionSecondsElapsed.current = 0;
        persistTimerState({
            mode: 'pomodoro',
            timeLeft: duration,
        });
    };

    // Concluir o cartão ativo e movê-lo para a Coluna de Conclusão da Esteira
    const completeActiveCard = () => {
        if (!activeCard) return;

        // 1. Salvar tempo decorrido
        if (sessionSecondsElapsed.current >= 5) {
            saveTimeEntry(activeCard.id, sessionSecondsElapsed.current);
            sessionSecondsElapsed.current = 0;
        }

        // 2. Mover para a Coluna de Conclusão configurada na Esteira
        const targetDoneColId =
            pipeline.doneColumnId ||
            columns.find((col) => /conclu|done|finaliz/i.test(col.title))?.id ||
            (columns.length > 0 ? columns[columns.length - 1].id : null);

        if (targetDoneColId && activeCard.column_id !== targetDoneColId) {
            router.patch(
                `/cards/${activeCard.id}/move`,
                { column_id: targetDoneColId },
                { preserveScroll: true, preserveState: true }
            );
        }

        // 3. Notificar
        if (settings.soundEnabled) {
            playAlarmSound('pomodoro_complete');
        }
        if (settings.notificationsEnabled) {
            sendDesktopNotification('Tarefa Concluída!', `"${activeCard.title}" finalizada com sucesso.`);
        }

        // 4. Avançar para o próximo da fila
        advanceQueue();
    };

    const skipCurrent = () => {
        if (mode === 'pomodoro') {
            if (activeCardId && sessionSecondsElapsed.current >= 5) {
                saveTimeEntry(activeCardId, sessionSecondsElapsed.current);
                sessionSecondsElapsed.current = 0;
            }
            const isLongBreak = (pomodorosCompleted + 1) % settings.longBreakInterval === 0;
            setPomodorosCompleted((c) => c + 1);
            changeMode(isLongBreak ? 'long_break' : 'short_break', false);
        } else {
            changeMode('pomodoro', false);
        }
    };

    const requestNotificationPermission = async (): Promise<boolean> => {
        if (!('Notification' in window)) return false;
        try {
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';
            updateSettings({ notificationsEnabled: granted });
            return granted;
        } catch {
            return false;
        }
    };

    // Loop do temporizador a cada 1 segundo
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                sessionSecondsElapsed.current += 1;

                if (mode === 'stopwatch') {
                    setTimeLeft((prev) => {
                        const next = prev + 1;
                        persistTimerState({ timeLeft: next, isRunning: true });
                        return next;
                    });
                } else {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            setIsRunning(false);

                            if (mode === 'pomodoro') {
                                const newCompleted = pomodorosCompleted + 1;
                                setPomodorosCompleted(newCompleted);

                                if (activeCardId) {
                                    saveTimeEntry(activeCardId, sessionSecondsElapsed.current);
                                }
                                sessionSecondsElapsed.current = 0;

                                if (settings.soundEnabled) {
                                    playAlarmSound('pomodoro_complete');
                                }

                                const isLongBreak = newCompleted % settings.longBreakInterval === 0;
                                const nextMode: PomodoroMode = isLongBreak ? 'long_break' : 'short_break';

                                if (settings.notificationsEnabled) {
                                    sendDesktopNotification(
                                        'Pomodoro Concluído!',
                                        `Excelente foco! Hora da sua ${isLongBreak ? 'Pausa Longa' : 'Pausa Curta'}.`
                                    );
                                }

                                persistTimerState({
                                    mode: nextMode,
                                    timeLeft: getModeDuration(nextMode),
                                    isRunning: settings.autoStartBreaks,
                                    pomodorosCompleted: newCompleted,
                                });

                                if (settings.autoStartBreaks) {
                                    setTimeout(() => changeMode(nextMode, true), 300);
                                } else {
                                    changeMode(nextMode, false);
                                }
                            } else {
                                if (settings.soundEnabled) {
                                    playAlarmSound('break_complete');
                                }

                                if (settings.notificationsEnabled) {
                                    sendDesktopNotification(
                                        'Intervalo Finalizado!',
                                        'Hora de retomar o foco e avançar na sua lista de tarefas.'
                                    );
                                }

                                persistTimerState({
                                    mode: 'pomodoro',
                                    timeLeft: getModeDuration('pomodoro'),
                                    isRunning: settings.autoStartPomodoros,
                                });

                                if (settings.autoStartPomodoros) {
                                    setTimeout(() => changeMode('pomodoro', true), 300);
                                } else {
                                    changeMode('pomodoro', false);
                                }
                            }

                            return 0;
                        }

                        const next = prev - 1;
                        persistTimerState({ timeLeft: next, isRunning: true });
                        return next;
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
    }, [isRunning, mode, activeCardId, settings, pomodorosCompleted]);

    // Listener para quando o cartão ativo for movido para a Coluna de Conclusão da Esteira
    useEffect(() => {
        if (!activeCard) return;

        const isDone = pipeline.doneColumnId
            ? activeCard.column_id === pipeline.doneColumnId
            : /conclu|done|finaliz/i.test(
                  columns.find((c) => c.id === activeCard.column_id)?.title || ''
              );

        if (isDone) {
            if (sessionSecondsElapsed.current >= 5) {
                saveTimeEntry(activeCard.id, sessionSecondsElapsed.current);
                sessionSecondsElapsed.current = 0;
            }
            if (pipeline.autoAdvanceOnDone) {
                advanceQueue();
            }
        }
    }, [activeCard?.column_id, pipeline.doneColumnId, pipeline.autoAdvanceOnDone]);

    const isOverdueBreak = useMemo(() => {
        return pomodorosCompleted > 0 && pomodorosCompleted % settings.longBreakInterval === 0;
    }, [pomodorosCompleted, settings.longBreakInterval]);

    const value: PomodoroContextValue = {
        mode,
        timeLeft,
        isRunning,
        pomodorosCompleted,
        sessionSecondsElapsed: sessionSecondsElapsed.current,
        activeCardId,
        activeCard,
        queueIds,
        queueCards,
        settings,
        pipeline,
        columns,
        allCards,
        isOverdueBreak,
        startCard,
        togglePlay,
        resetTimer,
        changeMode,
        adjustTime,
        skipCurrent,
        selectActiveCard,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        advanceQueue,
        completeActiveCard,
        logSessionTime,
        updateSettings,
        updatePipeline,
        requestNotificationPermission,
    };

    return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};

export const usePomodoro = (): PomodoroContextValue => {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro deve ser usado dentro de um PomodoroProvider');
    }
    return context;
};
