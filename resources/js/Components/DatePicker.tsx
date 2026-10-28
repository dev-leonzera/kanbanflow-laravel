import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface DatePickerProps {
    value?: string | null; // ISO 'YYYY-MM-DD'
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
}

const MONTH_NAMES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Converte ISO 'YYYY-MM-DD' para objeto numérico seguro contra fuso horário
 */
export function parseIsoDate(iso: string | null | undefined): { year: number; month: number; day: number } | null {
    if (!iso) return null;
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    return { year, month, day };
}

/**
 * Converte componentes numéricos para string ISO 'YYYY-MM-DD'
 */
export function toIsoDate(year: number, month: number, day: number): string {
    const y = year.toString().padStart(4, '0');
    const m = month.toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Converte ISO 'YYYY-MM-DD' para exibição 'DD/MM/AAAA'
 */
export function isoToDisplay(iso: string | null | undefined): string {
    const parsed = parseIsoDate(iso);
    if (!parsed) return '';
    const d = parsed.day.toString().padStart(2, '0');
    const m = parsed.month.toString().padStart(2, '0');
    const y = parsed.year.toString().padStart(4, '0');
    return `${d}/${m}/${y}`;
}

/**
 * Converte exibição 'DD/MM/AAAA' para objeto numérico
 */
export function parseDisplayDate(display: string): { year: number; month: number; day: number } | null {
    if (!display) return null;
    const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    return { year, month, day };
}

/**
 * Validação rigorosa de dia/mês/ano considerando bissextos
 */
export function isValidDate(year: number, month: number, day: number): boolean {
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
}

interface CalendarDay {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isoString: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder = 'DD/MM/AAAA',
    className = '',
    disabled = false,
    id,
    name,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayText, setDisplayText] = useState(() => isoToDisplay(value));

    // Mês e ano em visualização no calendário (base 1 para mês)
    const today = new Date();
    const [viewYear, setViewYear] = useState(() => {
        const parsed = parseIsoDate(value);
        return parsed ? parsed.year : today.getFullYear();
    });
    const [viewMonth, setViewMonth] = useState(() => {
        const parsed = parseIsoDate(value);
        return parsed ? parsed.month : today.getMonth() + 1;
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sincroniza displayText e visão do calendário quando `value` mudar externamente
    useEffect(() => {
        const display = isoToDisplay(value);
        setDisplayText(display);
        if (value) {
            const parsed = parseIsoDate(value);
            if (parsed) {
                setViewYear(parsed.year);
                setViewMonth(parsed.month);
            }
        }
    }, [value]);

    // Fechamento ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Aplica formatação de máscara progressiva
    const formatInputText = (rawVal: string): string => {
        // Se colar formato ISO YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawVal.trim())) {
            const [y, m, d] = rawVal.trim().split('-');
            return `${d}/${m}/${y}`;
        }

        const cleaned = rawVal.replace(/[^\d]/g, '');
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 2) {
            return rawVal.endsWith('/') && cleaned.length === 2 ? `${cleaned}/` : cleaned;
        }
        if (cleaned.length <= 4) {
            const part1 = cleaned.slice(0, 2);
            const part2 = cleaned.slice(2);
            return rawVal.endsWith('/') && cleaned.length === 4 ? `${part1}/${part2}/` : `${part1}/${part2}`;
        }
        const part1 = cleaned.slice(0, 2);
        const part2 = cleaned.slice(2, 4);
        const part3 = cleaned.slice(4, 8);
        return `${part1}/${part2}/${part3}`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const formatted = formatInputText(raw);
        setDisplayText(formatted);

        if (formatted.length === 10) {
            const parsed = parseDisplayDate(formatted);
            if (parsed && isValidDate(parsed.year, parsed.month, parsed.day)) {
                const iso = toIsoDate(parsed.year, parsed.month, parsed.day);
                onChange(iso);
                setViewYear(parsed.year);
                setViewMonth(parsed.month);
            }
        } else if (formatted.length === 0) {
            onChange('');
        }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (containerRef.current?.contains(e.relatedTarget as Node)) {
            return;
        }

        // Validação ao perder o foco: se incompleto/inválido, restaura último valor válido
        if (displayText.trim() !== '') {
            const parsed = parseDisplayDate(displayText);
            if (parsed && isValidDate(parsed.year, parsed.month, parsed.day)) {
                const iso = toIsoDate(parsed.year, parsed.month, parsed.day);
                if (iso !== value) {
                    onChange(iso);
                }
            } else {
                setDisplayText(value ? isoToDisplay(value) : '');
            }
        } else if (value) {
            onChange('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'Enter') {
            if (isOpen) {
                setIsOpen(false);
            }
        }
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        if (viewMonth === 1) {
            setViewMonth(12);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        if (viewMonth === 12) {
            setViewMonth(1);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const handleSelectDay = (day: CalendarDay) => {
        const iso = day.isoString;
        onChange(iso);
        setDisplayText(isoToDisplay(iso));
        setViewYear(day.year);
        setViewMonth(day.month);
        setIsOpen(false);
    };

    const handleSelectToday = (e: React.MouseEvent) => {
        e.preventDefault();
        const cur = new Date();
        const y = cur.getFullYear();
        const m = cur.getMonth() + 1;
        const d = cur.getDate();
        const iso = toIsoDate(y, m, d);
        onChange(iso);
        setDisplayText(isoToDisplay(iso));
        setViewYear(y);
        setViewMonth(m);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        onChange('');
        setDisplayText('');
        setIsOpen(false);
    };

    // Gera matriz de dias do calendário
    const calendarDays = (() => {
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();

        const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 = Domingo
        const daysInCurrentMonth = new Date(viewYear, viewMonth, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();

        const days: CalendarDay[] = [];

        // Dias do mês anterior
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const m = viewMonth === 1 ? 12 : viewMonth - 1;
            const y = viewMonth === 1 ? viewYear - 1 : viewYear;
            const iso = toIsoDate(y, m, d);
            days.push({
                day: d,
                month: m,
                year: y,
                isCurrentMonth: false,
                isToday: y === todayYear && m === todayMonth && d === todayDay,
                isSelected: iso === value,
                isoString: iso,
            });
        }

        // Dias do mês atual
        for (let d = 1; d <= daysInCurrentMonth; d++) {
            const iso = toIsoDate(viewYear, viewMonth, d);
            days.push({
                day: d,
                month: viewMonth,
                year: viewYear,
                isCurrentMonth: true,
                isToday: viewYear === todayYear && viewMonth === todayMonth && d === todayDay,
                isSelected: iso === value,
                isoString: iso,
            });
        }

        // Dias do próximo mês para fechar semanas completas
        const totalSlots = days.length <= 35 ? 35 : 42;
        const remaining = totalSlots - days.length;
        for (let d = 1; d <= remaining; d++) {
            const m = viewMonth === 12 ? 1 : viewMonth + 1;
            const y = viewMonth === 12 ? viewYear + 1 : viewYear;
            const iso = toIsoDate(y, m, d);
            days.push({
                day: d,
                month: m,
                year: y,
                isCurrentMonth: false,
                isToday: y === todayYear && m === todayMonth && d === todayDay,
                isSelected: iso === value,
                isoString: iso,
            });
        }

        return days;
    })();

    // Anos disponíveis para salto rápido
    const currentYear = today.getFullYear();
    const yearOptions = Array.from({ length: 15 }, (_, i) => currentYear - 5 + i);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type="text"
                    inputMode="numeric"
                    disabled={disabled}
                    value={displayText}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onClick={() => setIsOpen(true)}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 pr-16 text-sm text-slate-100 placeholder-slate-500 font-mono transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 ${className}`}
                />

                <div className="absolute right-2 flex items-center gap-1">
                    {value && !disabled && (
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleClear}
                            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                            title="Limpar data"
                            aria-label="Limpar data"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        disabled={disabled}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            setIsOpen((prev) => !prev);
                            inputRef.current?.focus();
                        }}
                        className={`p-1 rounded transition-colors focus:outline-none ${
                            isOpen
                                ? 'text-sky-400 bg-slate-800'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                        title={isOpen ? 'Fechar calendário' : 'Abrir calendário'}
                        aria-label="Alternar calendário"
                    >
                        <Calendar className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Popover do Calendário */}
            {isOpen && !disabled && (
                <div
                    onMouseDown={(e) => e.preventDefault()} // Impede perda prematura de foco do input
                    className="absolute left-0 mt-1.5 z-50 w-72 max-w-[calc(100vw-2.5rem)] rounded-md border border-slate-800 bg-slate-900 p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-100 text-slate-100"
                >
                    {/* Header com Navegação e Saltos */}
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/80">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                            title="Mês anterior"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1 text-xs font-medium">
                            <select
                                value={viewMonth}
                                onChange={(e) => setViewMonth(Number(e.target.value))}
                                className="bg-transparent border-none text-slate-200 text-xs font-semibold p-0 pr-1 cursor-pointer hover:text-white focus:ring-0 focus:outline-none"
                            >
                                {MONTH_NAMES.map((name, idx) => (
                                    <option key={idx} value={idx + 1} className="bg-slate-900 text-slate-200">
                                        {name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={viewYear}
                                onChange={(e) => setViewYear(Number(e.target.value))}
                                className="bg-transparent border-none text-slate-400 text-xs font-mono font-medium p-0 pr-1 cursor-pointer hover:text-slate-200 focus:ring-0 focus:outline-none"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y} className="bg-slate-900 text-slate-200">
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                            title="Próximo mês"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Dias da Semana */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {WEEKDAY_NAMES.map((wd, i) => (
                            <span key={i} className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                                {wd}
                            </span>
                        ))}
                    </div>

                    {/* Grid de Dias */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((dayObj) => {
                            const isCurrent = dayObj.isCurrentMonth;
                            const isSel = dayObj.isSelected;
                            const isTod = dayObj.isToday;

                            let buttonStyle = 'text-slate-200 hover:bg-slate-800';
                            if (!isCurrent) {
                                buttonStyle = 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/40';
                            }
                            if (isSel) {
                                buttonStyle = 'bg-sky-600 text-white font-semibold shadow-xs hover:bg-sky-500';
                            } else if (isTod) {
                                buttonStyle = `${buttonStyle} ring-1 ring-sky-500/50 text-sky-400 font-medium`;
                            }

                            return (
                                <button
                                    key={dayObj.isoString + (isCurrent ? '-cur' : '-out')}
                                    type="button"
                                    onClick={() => handleSelectDay(dayObj)}
                                    className={`h-7 w-full text-xs font-mono rounded flex items-center justify-center transition-colors ${buttonStyle}`}
                                >
                                    {dayObj.day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Rodapé com Atalhos Rápidos */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <button
                            type="button"
                            onClick={handleSelectToday}
                            className="text-xs font-medium text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
                        >
                            Hoje
                        </button>

                        {value && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-xs text-slate-400 hover:text-slate-300 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
                            >
                                Limpar
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
