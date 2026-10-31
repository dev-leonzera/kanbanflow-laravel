<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Versão Atual da Aplicação
    |--------------------------------------------------------------------------
    |
    | Esta versão é sincronizada com o frontend e utilizada para determinar
    | se o modal de novidades (changelog) deve ser exibido ao usuário
    | em seu primeiro login ou acesso pós-atualização.
    |
    */
    'current_version' => 'v1.5.0',

    /*
    |--------------------------------------------------------------------------
    | Histórico de Lançamentos e Atualizações (Changelog)
    |--------------------------------------------------------------------------
    |
    | Registro estruturado de cada versão lançada, com tipo de alteração:
    | 'feature' (Nova funcionalidade), 'improvement' (Melhoria) ou 'fix' (Correção).
    |
    */
    'releases' => [
        [
            'version' => 'v1.5.0',
            'date' => '2026-10-30',
            'title' => 'Pomodoro Integrado aos Cards, Fila e Esteira Kanban, Modal Interativo e Reordenação de Colunas',
            'summary' => 'Grande atualização com acionamento do Pomodoro direto pelos cartões, fila de foco com esteira configurável, visualização ergonômica de cards com checklist interativo e reordenação de colunas.',
            'items' => [
                [
                    'type' => 'feature',
                    'title' => 'Pomodoro Direto no Card e Fila de Foco',
                    'description' => 'Inicie sessões de Pomodoro com 1 clique direto no cartão ou adicione tarefas à fila sequencial com passagem automática para a próxima ao concluir.',
                ],
                [
                    'type' => 'feature',
                    'title' => 'Esteira de Trabalho Kanban Customizável',
                    'description' => 'Defina a coluna padrão de entrada, colunas de trabalho em andamento (WIP) e a coluna de conclusão, com movimentação automática de cartões ao iniciar o timer.',
                ],
                [
                    'type' => 'feature',
                    'title' => 'Modal de Visualização Interativo com Modo Edição',
                    'description' => 'Ao clicar em um card, visualize detalhes, prazos e interaja diretamente com o checklist de subtarefas antes de alternar para o modo completo de edição.',
                ],
                [
                    'type' => 'improvement',
                    'title' => 'Reordenação de Colunas no Quadro',
                    'description' => 'Reorganize colunas com facilidade usando as setas rápidas no cabeçalho ou arrastando via drag-and-drop com prevenção de conflitos.',
                ],
                [
                    'type' => 'improvement',
                    'title' => 'Notificações de Pomodoro no Navegador e Alarme Sonoro',
                    'description' => 'Alertas sonoros sintetizados via Web Audio API e notificações nativas de desktop ao término de cada ciclo de foco ou pausa.',
                ],
            ],
        ],
        [
            'version' => 'v1.4.0',
            'date' => '2026-10-28',
            'title' => 'Changelog Automático, Atalho de Subtarefas e Calendário',
            'summary' => 'Nova versão com apresentação automática de atualizações ao primeiro login, adição rápida de subtarefas via Enter e seletor moderno de datas.',
            'items' => [
                [
                    'type' => 'feature',
                    'title' => 'Apresentação Automática do Changelog',
                    'description' => 'A cada nova versão publicada, o usuário é recebido em seu primeiro login pós-atualização com o resumo das novidades, exibido uma única vez.',
                ],
                [
                    'type' => 'feature',
                    'title' => 'Inserção Rápida de Subtarefas ao Pressionar Enter',
                    'description' => 'Adicione itens ao checklist de forma contínua e ágil apenas digitando o título e pressionando a tecla Enter.',
                ],
                [
                    'type' => 'improvement',
                    'title' => 'Seletor de Datas Visual com Calendário e Digitação',
                    'description' => 'Interface híbrida que combina calendário interativo com atalho para data de hoje e entrada manual formatada (dd/mm/aaaa).',
                ],
                [
                    'type' => 'improvement',
                    'title' => 'Sincronização Instantânea de Dados nos Cartões',
                    'description' => 'Subtarefas e etiquetas são refletidas de forma imediata na visualização do modal, eliminando atrasos visuais.',
                ],
            ],
        ],
        [
            'version' => 'v1.3.0',
            'date' => '2026-10-28',
            'title' => 'Central de Notificações e Prazos',
            'summary' => 'Monitoramento proativo de vencimentos com avisos no cabeçalho e disparos por e-mail.',
            'items' => [
                [
                    'type' => 'feature',
                    'title' => 'Alertas de Vencimento de Tarefas',
                    'description' => 'Notificações geradas automaticamente para cartões com prazo vencendo hoje ou atrasados.',
                ],
                [
                    'type' => 'feature',
                    'title' => 'Menu de Notificações na Barra Superior',
                    'description' => 'Painel interativo para visualizar alertas não lidos, marcar como concluídos ou limpar notificações.',
                ],
                [
                    'type' => 'feature',
                    'title' => 'Notificações por E-mail',
                    'description' => 'Envio automático de lembretes no e-mail do usuário quando um prazo importante estiver expirando.',
                ],
            ],
        ],
        [
            'version' => 'v1.2.0',
            'date' => '2026-10-26',
            'title' => 'Gestão de Etiquetas e Otimização Mobile',
            'summary' => 'Cores personalizadas para etiquetas e layout responsivo com visualização por abas no smartphone.',
            'items' => [
                [
                    'type' => 'feature',
                    'title' => 'Criação e Gestão de Etiquetas por Quadro',
                    'description' => 'Possibilidade de criar, colorir e excluir etiquetas diretamente dentro de cada quadro.',
                ],
                [
                    'type' => 'improvement',
                    'title' => 'Navegação Mobile Otimizada',
                    'description' => 'Interface com navegação entre colunas por abas em telas compactas, evitando rolagem horizontal desconfortável.',
                ],
                [
                    'type' => 'improvement',
                    'title' => 'Área de Descrição Ampliada',
                    'description' => 'Campo de descrição com redimensionamento vertical para detalhar melhor os requisitos do cartão.',
                ],
            ],
        ],
        [
            'version' => 'v1.1.0',
            'date' => '2026-10-23',
            'title' => 'Temporizador Pomodoro & Rastreamento de Tempo',
            'summary' => 'Controle de foco produtivo e estimativas em minutos integradas ao Kanban.',
            'items' => [
                [
                    'type' => 'feature',
                    'title' => 'Cronômetro Pomodoro Integrado',
                    'description' => 'Contador de tempo com ciclos de trabalho e descanso associados diretamente ao cartão selecionado.',
                ],
                [
                    'type' => 'feature',
                    'title' => 'Estimativas e Rastreamento de Horas',
                    'description' => 'Defina a estimativa prevista e registre as horas reais gastas para comparar a eficiência do fluxo.',
                ],
                [
                    'type' => 'improvement',
                    'title' => 'Identificação por Cores',
                    'description' => 'Faixa colorida superior no cartão para distinguir categorias visuais de forma instantânea.',
                ],
            ],
        ],
        [
            'version' => 'v1.0.0',
            'date' => '2026-10-21',
            'title' => 'Lançamento Inicial KanbanFlow Laravel',
            'summary' => 'Estrutura inicial do sistema Kanban com colunas, cartões e arrastar e soltar.',
            'items' => [
                [
                    'type' => 'feature',
                    'title' => 'Quadro Kanban com Drag & Drop',
                    'description' => 'Movimentação rápida e fluida de cartões entre colunas através de sensores de arrasto ergonômicos.',
                ],
                [
                    'type' => 'feature',
                    'title' => 'Limites WIP (Work In Progress)',
                    'description' => 'Configuração de limites de cartões simultâneos por coluna para evitar gargalos operacionais.',
                ],
                [
                    'type' => 'feature',
                    'title' => 'Checklists de Subtarefas',
                    'description' => 'Divisão de itens maiores em passos menores com barra de progresso em tempo real.',
                ],
            ],
        ],
    ],
];
