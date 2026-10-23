import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-xs border-slate-700 bg-slate-950 text-sky-500 shadow-xs focus:ring-1 focus:ring-sky-500 focus:ring-offset-slate-900 transition-colors ' +
                className
            }
        />
    );
}
