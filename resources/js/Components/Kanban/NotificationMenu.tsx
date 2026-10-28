import { useState, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { InAppNotification } from '@/types/notification';
import {
    Bell,
    Check,
    CheckCheck,
    Clock,
    AlertCircle,
    Calendar,
    ChevronRight,
    Loader2
} from 'lucide-react';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function NotificationMenu() {
    const { auth } = usePage<PageProps>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(auth.unread_notifications_count || 0);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Sincroniza com as props caso o Inertia atualize
    useEffect(() => {
        if (typeof auth.unread_notifications_count === 'number') {
            setUnreadCount(auth.unread_notifications_count);
        }
    }, [auth.unread_notifications_count]);

    // Fechar ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/notifications', {
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        // Atualização otimista
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await fetch(`/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
            });
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    };

    const markAllAsRead = async () => {
        // Atualização otimista
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);

        try {
            await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
            });
        } catch (error) {
            console.error('Erro ao marcar todas notificações como lidas:', error);
        }
    };

    const handleNotificationClick = (notification: InAppNotification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }

        setIsOpen(false);

        if (notification.data.board_id) {
            router.visit(`/board?board_id=${notification.data.board_id}`);
        }
    };

    const renderTypeBadge = (type: string, daysDiff?: number) => {
        switch (type) {
            case 'overdue':
                return (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/60">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Vencido
                    </span>
                );
            case 'due_today':
                return (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/60">
                        <Clock className="w-2.5 h-2.5" />
                        Hoje
                    </span>
                );
            case 'due_tomorrow':
                return (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold text-sky-400 bg-sky-950/40 border border-sky-800/60">
                        <Calendar className="w-2.5 h-2.5" />
                        Amanhã
                    </span>
                );
            case 'due_soon':
                return (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold text-amber-300 bg-amber-950/40 border border-amber-700/60">
                        <Clock className="w-2.5 h-2.5" />
                        {daysDiff ? `Em ${daysDiff}d` : 'Em breve'}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold text-slate-400 bg-slate-800 border border-slate-700">
                        Aviso
                    </span>
                );
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Botão de Disparo (Trigger) */}
            <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex items-center justify-center p-1.5 rounded-md border transition duration-150 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    unreadCount > 0
                        ? 'border-amber-500/40 bg-slate-800/90 text-amber-300 hover:bg-slate-800 hover:text-amber-200'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Notificações e Prazos"
                aria-label="Abrir notificações"
            >
                <Bell className="w-4 h-4" />

                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold font-mono text-amber-950 bg-amber-400 rounded-full border border-slate-900 shadow-sm animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Painel Dropdown de Notificações */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-md bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-900/90">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                                Notificações
                            </span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-400 transition-colors"
                                title="Marcar todas como lidas"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Marcar todas</span>
                            </button>
                        )}
                    </div>

                    {/* Lista de Notificações */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 text-left">
                        {isLoading ? (
                            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                                <span className="text-xs">Carregando avisos...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-2">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                </div>
                                <p className="text-xs font-medium text-slate-300">Tudo em dia!</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Nenhum prazo urgente ou notificação pendente.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const isUnread = !notification.read_at;
                                const type = notification.data?.type || 'notice';

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`group relative p-3 cursor-pointer transition-colors ${
                                            isUnread
                                                ? 'bg-slate-800/40 hover:bg-slate-800/70 border-l-2 ' +
                                                  (type === 'overdue'
                                                      ? 'border-rose-500'
                                                      : type === 'due_today'
                                                      ? 'border-amber-500'
                                                      : type === 'due_tomorrow'
                                                      ? 'border-sky-500'
                                                      : type === 'due_soon'
                                                      ? 'border-amber-400/80'
                                                      : 'border-slate-600')
                                                : 'hover:bg-slate-800/30 opacity-75 hover:opacity-100 border-l-2 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    {renderTypeBadge(type, notification.data?.days_diff)}
                                                    {notification.data?.board_title && (
                                                        <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                                            • {notification.data.board_title}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs font-medium text-slate-200 line-clamp-2">
                                                    {notification.data?.card_title || 'Cartão sem título'}
                                                </p>

                                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                                    {notification.data?.message}
                                                </p>

                                                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-500">
                                                    {notification.data?.due_date && (
                                                        <span>Prazo: {notification.data.due_date}</span>
                                                    )}
                                                    {notification.created_at_human && (
                                                        <span>• {notification.created_at_human}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5 ml-1 shrink-0">
                                                {isUnread && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => markAsRead(notification.id, e)}
                                                        className="p-1 rounded text-slate-500 hover:text-emerald-400 hover:bg-slate-700/60 transition-colors"
                                                        title="Marcar como lida"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Rodapé */}
                    {notifications.length > 0 && (
                        <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-900/90 text-center">
                            <span className="text-[10px] font-mono text-slate-500">
                                Alertas automáticos do KanbanFlow
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
