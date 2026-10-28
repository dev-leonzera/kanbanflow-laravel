export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    last_seen_version?: string | null;
}

export interface ChangelogItem {
    type: 'feature' | 'improvement' | 'fix';
    title: string;
    description: string;
}

export interface ReleaseNote {
    version: string;
    date: string;
    title: string;
    summary: string;
    items: ChangelogItem[];
}

export interface ChangelogData {
    current_version: string;
    should_show: boolean;
    latest_release: ReleaseNote | null;
    all_releases: ReleaseNote[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        unread_notifications_count: number;
    };
    app_version?: string;
    changelog?: ChangelogData;
};
