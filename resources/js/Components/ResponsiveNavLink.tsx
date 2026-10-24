import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-2 py-2 pe-4 ps-3 text-xs font-medium uppercase tracking-wide transition duration-150 ease-in-out focus:outline-none ${
                active
                    ? 'border-sky-500 bg-sky-950/40 text-sky-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900/60 hover:text-slate-200'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
