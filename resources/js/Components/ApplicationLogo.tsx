import { SVGAttributes } from 'react';

export default function ApplicationLogo({ className = 'h-8 w-auto', ...props }: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 240 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* Ícone de Colunas de Fluxo Contínuo */}
            <g transform="translate(4, 6)">
                {/* Coluna 1 - Backlog / To-Do */}
                <rect x="0" y="4" width="9" height="28" rx="2.5" fill="#38bdf8" fillOpacity="0.8" />
                <rect x="0" y="8" width="9" height="6" rx="1.5" fill="#0284c7" />

                {/* Coluna 2 - Em Progresso (em destaque com acento de cor) */}
                <rect x="13" y="0" width="9" height="36" rx="2.5" fill="#0ea5e9" />
                <rect x="13" y="5" width="9" height="10" rx="1.5" fill="#38bdf8" />
                <rect x="13" y="18" width="9" height="7" rx="1.5" fill="#0284c7" />

                {/* Coluna 3 - Concluído / Fluxo */}
                <rect x="26" y="8" width="9" height="24" rx="2.5" fill="#0284c7" fillOpacity="0.75" />
                <rect x="26" y="12" width="9" height="8" rx="1.5" fill="#38bdf8" />
            </g>

            {/* Tipografia da Marca: KANBAN + FLOW */}
            <text
                x="48"
                y="31"
                fill="currentColor"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fontSize="22"
                fontWeight="800"
                letterSpacing="-0.5px"
            >
                Kanban<tspan fill="#38bdf8" fontWeight="600">Flow</tspan>
            </text>
        </svg>
    );
}
