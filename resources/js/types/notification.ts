export interface InAppNotificationData {
    card_id: number;
    card_title: string;
    board_id?: number;
    board_title?: string;
    due_date?: string | null;
    type: 'overdue' | 'due_today' | 'due_tomorrow' | 'due_soon' | string;
    days_diff?: number;
    message: string;
}

export interface InAppNotification {
    id: string;
    data: InAppNotificationData;
    read_at: string | null;
    created_at: string;
    created_at_human?: string;
}
