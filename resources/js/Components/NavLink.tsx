import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-xs font-medium tracking-wide uppercase transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-sky-500 text-sky-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200 focus:border-slate-600 focus:text-slate-200') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
