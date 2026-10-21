export interface Subtask {
    id: number;
    card_id: number;
    title: string;
    is_completed: boolean;
    order_position: number;
}

export interface Label {
    id: number;
    board_id: number;
    name: string;
    color_hex: string;
}

export interface Card {
    id: number;
    column_id: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    color: string | null;
    order_position: number;
    due_date: string | null;
    estimate_minutes: number | null;
    subtasks: Subtask[];
    labels: Label[];
}

export interface Column {
    id: number;
    board_id: number;
    title: string;
    wip_limit: number | null;
    order_position: number;
    color: string | null;
    cards: Card[];
}

export interface Board {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    color_theme: string;
    columns: Column[];
    labels: Label[];
}
