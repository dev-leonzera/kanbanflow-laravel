<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\Card;
use App\Models\Column;
use App\Models\Label;
use App\Models\Subtask;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password123'),
            ]
        );

        $board = Board::create([
            'user_id' => $user->id,
            'title' => 'Projeto Principal (Demo)',
            'description' => 'Quadro inicial de demonstração do KanbanFlow em Laravel',
            'color_theme' => 'slate',
        ]);

        $labelDev = Label::create(['board_id' => $board->id, 'name' => 'Desenvolvimento', 'color_hex' => '#3b82f6']);
        $labelDesign = Label::create(['board_id' => $board->id, 'name' => 'Design', 'color_hex' => '#8b5cf6']);
        $labelBug = Label::create(['board_id' => $board->id, 'name' => 'Bug', 'color_hex' => '#ef4444']);

        $columnsData = [
            ['title' => 'A Fazer', 'color' => '#64748b', 'wip_limit' => 5],
            ['title' => 'Em Progresso', 'color' => '#f59e0b', 'wip_limit' => 3],
            ['title' => 'Revisão', 'color' => '#3b82f6', 'wip_limit' => 4],
            ['title' => 'Concluído', 'color' => '#10b981', 'wip_limit' => null],
        ];

        $createdColumns = [];
        foreach ($columnsData as $index => $col) {
            $createdColumns[] = Column::create([
                'board_id' => $board->id,
                'title' => $col['title'],
                'color' => $col['color'],
                'wip_limit' => $col['wip_limit'],
                'order_position' => $index,
            ]);
        }

        // Cartão 1 em "A Fazer"
        $card1 = Card::create([
            'column_id' => $createdColumns[0]->id,
            'title' => 'Planejar arquitetura dos controladores Inertia',
            'description' => 'Definir endpoints otimizados para reordenação de colunas e drag & drop atômico.',
            'priority' => 'high',
            'color' => '#f8fafc',
            'order_position' => 0,
            'due_date' => now()->addDays(2)->toDateString(),
            'estimate_minutes' => 120,
        ]);
        $card1->labels()->attach([$labelDev->id]);
        Subtask::create(['card_id' => $card1->id, 'title' => 'Mapear rotas de quadro', 'is_completed' => true, 'order_position' => 0]);
        Subtask::create(['card_id' => $card1->id, 'title' => 'Implementar BoardController', 'is_completed' => false, 'order_position' => 1]);

        // Cartão 2 em "Em Progresso"
        $card2 = Card::create([
            'column_id' => $createdColumns[1]->id,
            'title' => 'Refatorar UI ergonômica com tema escuro e neutro',
            'description' => 'Remover gradientes roxos genéricos e adotar contraste slate/ardósia sóbrio.',
            'priority' => 'medium',
            'color' => '#f8fafc',
            'order_position' => 0,
            'due_date' => now()->addDays(1)->toDateString(),
            'estimate_minutes' => 60,
        ]);
        $card2->labels()->attach([$labelDesign->id]);
        Subtask::create(['card_id' => $card2->id, 'title' => 'Ajustar paleta de neutros', 'is_completed' => true, 'order_position' => 0]);
        Subtask::create(['card_id' => $card2->id, 'title' => 'Testar contraste WCAG AA', 'is_completed' => false, 'order_position' => 1]);

        // Cartão 3 em "Concluído"
        $card3 = Card::create([
            'column_id' => $createdColumns[3]->id,
            'title' => 'Instalação base do Laravel 11 com Inertia + React',
            'description' => 'Stack criada com sucesso com Breeze, Vite e modelos de dados com migrations.',
            'priority' => 'low',
            'color' => '#f8fafc',
            'order_position' => 0,
            'due_date' => now()->subDay()->toDateString(),
            'estimate_minutes' => 45,
        ]);
        $card3->labels()->attach([$labelDev->id]);
        Subtask::create(['card_id' => $card3->id, 'title' => 'Configurar migrations', 'is_completed' => true, 'order_position' => 0]);
        Subtask::create(['card_id' => $card3->id, 'title' => 'Definir models e relacionamentos', 'is_completed' => true, 'order_position' => 1]);
    }
}
