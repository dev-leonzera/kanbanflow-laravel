<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Card;
use App\Models\Column;
use App\Models\Label;
use App\Models\Subtask;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BoardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $boardId = $request->query('board_id');

        $boards = Board::where('user_id', $user->id)->get();

        if ($boards->isEmpty()) {
            $initialBoard = Board::create([
                'user_id' => $user->id,
                'title' => 'Meu Primeiro Quadro',
                'description' => 'Quadro inicial de tarefas',
                'color_theme' => 'slate',
            ]);

            Column::create(['board_id' => $initialBoard->id, 'title' => 'A Fazer', 'color' => '#64748b', 'order_position' => 0]);
            Column::create(['board_id' => $initialBoard->id, 'title' => 'Em Progresso', 'color' => '#f59e0b', 'order_position' => 1]);
            Column::create(['board_id' => $initialBoard->id, 'title' => 'Concluído', 'color' => '#10b981', 'order_position' => 2]);

            $boards = Board::where('user_id', $user->id)->get();
        }

        $activeBoardQuery = Board::with([
            'columns.cards.subtasks',
            'columns.cards.labels',
            'labels',
        ])->where('user_id', $user->id);

        if ($boardId) {
            $board = (clone $activeBoardQuery)->where('id', $boardId)->first();
        }

        if (empty($board)) {
            $board = $activeBoardQuery->first();
        }

        return Inertia::render('Board/Index', [
            'board' => $board,
            'boards' => $boards,
        ]);
    }

    public function storeBoard(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color_theme' => 'nullable|string|max:30',
        ]);

        $board = Board::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'color_theme' => $validated['color_theme'] ?? 'slate',
        ]);

        // Criar colunas padrão para o novo quadro/projeto
        Column::create(['board_id' => $board->id, 'title' => 'A Fazer', 'color' => '#64748b', 'order_position' => 0]);
        Column::create(['board_id' => $board->id, 'title' => 'Em Progresso', 'color' => '#f59e0b', 'order_position' => 1]);
        Column::create(['board_id' => $board->id, 'title' => 'Concluído', 'color' => '#10b981', 'order_position' => 2]);

        return redirect()->route('board.index', ['board_id' => $board->id]);
    }

    public function destroyBoard(Request $request, Board $board): RedirectResponse
    {
        if ($board->user_id !== $request->user()->id) {
            abort(403);
        }

        // Não permitir deletar se for o único quadro
        $count = Board::where('user_id', $request->user()->id)->count();
        if ($count <= 1) {
            return redirect()->back()->with('error', 'Você precisa ter pelo menos um quadro ativo.');
        }

        $board->delete();

        return redirect()->route('board.index');
    }

    public function storeCard(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'column_id' => 'required|exists:columns,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'color' => 'nullable|string|max:7',
            'due_date' => 'nullable|date',
            'estimate_minutes' => 'nullable|integer|min:0',
            'label_ids' => 'nullable|array',
            'label_ids.*' => 'exists:labels,id',
            'subtasks' => 'nullable|array',
        ]);

        $column = Column::with('board')->findOrFail($validated['column_id']);
        if ($column->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $highestOrder = Card::where('column_id', $column->id)->max('order_position') ?? -1;

        $card = Card::create([
            'column_id' => $column->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'color' => $validated['color'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'estimate_minutes' => $validated['estimate_minutes'] ?? null,
            'order_position' => $highestOrder + 1,
        ]);

        if (!empty($validated['label_ids'])) {
            $boardLabelsCount = Label::where('board_id', $column->board_id)
                ->whereIn('id', $validated['label_ids'])
                ->count();
            if ($boardLabelsCount !== count($validated['label_ids'])) {
                abort(403);
            }
            $card->labels()->sync($validated['label_ids']);
        }

        if (!empty($validated['subtasks'])) {
            foreach ($validated['subtasks'] as $index => $subtaskData) {
                $subtaskTitle = is_array($subtaskData) ? ($subtaskData['title'] ?? '') : (string) $subtaskData;
                $trimmed = trim($subtaskTitle);
                if ($trimmed !== '') {
                    $card->subtasks()->create([
                        'title' => $trimmed,
                        'is_completed' => false,
                        'order_position' => $index,
                    ]);
                }
            }
        }

        return redirect()->back();
    }

    public function updateCard(Request $request, Card $card): RedirectResponse
    {
        $card->load('column.board');
        if ($card->column->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'column_id' => 'sometimes|required|exists:columns,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'color' => 'nullable|string|max:7',
            'due_date' => 'nullable|date',
            'estimate_minutes' => 'nullable|integer|min:0',
            'label_ids' => 'nullable|array',
            'label_ids.*' => 'exists:labels,id',
        ]);

        if (isset($validated['column_id']) && (int) $validated['column_id'] !== (int) $card->column_id) {
            $newColumn = Column::findOrFail($validated['column_id']);
            if ($newColumn->board_id !== $card->column->board_id) {
                abort(403);
            }
            $highestOrder = Card::where('column_id', $newColumn->id)->max('order_position') ?? -1;
            $validated['order_position'] = $highestOrder + 1;
        }

        $card->update($validated);

        if ($request->has('label_ids')) {
            $labelIds = $request->input('label_ids', []);
            if (!empty($labelIds)) {
                $boardLabelsCount = Label::where('board_id', $card->column->board_id)
                    ->whereIn('id', $labelIds)
                    ->count();
                if ($boardLabelsCount !== count($labelIds)) {
                    abort(403);
                }
            }
            $card->labels()->sync($labelIds);
        }

        return redirect()->back();
    }

    public function moveCard(Request $request, Card $card): RedirectResponse
    {
        $card->load('column.board');
        if ($card->column->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'column_id' => 'required|exists:columns,id',
            'order_position' => 'nullable|integer|min:0',
        ]);

        $targetColumn = Column::findOrFail($validated['column_id']);
        if ($targetColumn->board_id !== $card->column->board_id) {
            abort(403);
        }

        if (!isset($validated['order_position'])) {
            $highestOrder = Card::where('column_id', $targetColumn->id)->max('order_position') ?? -1;
            $orderPosition = $highestOrder + 1;
        } else {
            $orderPosition = (int) $validated['order_position'];
        }

        $card->update([
            'column_id' => $targetColumn->id,
            'order_position' => $orderPosition,
        ]);

        return redirect()->back();
    }

    public function destroyCard(Request $request, Card $card): RedirectResponse
    {
        $card->load('column.board');
        if ($card->column->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $card->delete();

        return redirect()->back();
    }

    public function reorderCards(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'column_id' => 'required|exists:columns,id',
            'card_orders' => 'required|array',
            'card_orders.*.id' => 'required|exists:cards,id',
            'card_orders.*.order_position' => 'required|integer',
        ]);

        $targetColumn = Column::with('board')->findOrFail($validated['column_id']);
        if ($targetColumn->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $user = $request->user();
        $cardIds = collect($validated['card_orders'])->pluck('id');
        $cardsCount = Card::whereIn('id', $cardIds)
            ->whereHas('column.board', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->count();

        if ($cardsCount !== count($validated['card_orders'])) {
            abort(403);
        }

        DB::transaction(function () use ($validated, $targetColumn) {
            foreach ($validated['card_orders'] as $item) {
                Card::where('id', $item['id'])->update([
                    'column_id' => $targetColumn->id,
                    'order_position' => $item['order_position'],
                ]);
            }
        });

        return redirect()->back();
    }

    public function storeLabel(Request $request, Board $board): RedirectResponse
    {
        if ($board->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'color_hex' => ['required', 'string', 'max:7', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $board->labels()->create($validated);

        return redirect()->back();
    }

    public function updateLabel(Request $request, Label $label): RedirectResponse
    {
        $label->load('board');
        if ($label->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'color_hex' => ['required', 'string', 'max:7', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $label->update($validated);

        return redirect()->back();
    }

    public function destroyLabel(Request $request, Label $label): RedirectResponse
    {
        $label->load('board');
        if ($label->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $label->delete();

        return redirect()->back();
    }

    public function storeTimeEntry(Request $request, Card $card): RedirectResponse
    {
        $card->load('column.board');
        if ($card->column->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'duration_seconds' => 'required|integer|min:1',
            'started_at' => 'nullable|date',
            'ended_at' => 'nullable|date',
        ]);

        $card->timeEntries()->create([
            'user_id' => $request->user()->id,
            'duration_seconds' => $validated['duration_seconds'],
            'started_at' => $validated['started_at'] ?? now()->subSeconds($validated['duration_seconds']),
            'ended_at' => $validated['ended_at'] ?? now(),
        ]);

        return redirect()->back();
    }

    public function toggleSubtask(Request $request, Subtask $subtask): RedirectResponse
    {
        $subtask->load('card.column.board');
        if ($subtask->card->column->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $subtask->update([
            'is_completed' => !$subtask->is_completed,
        ]);

        return redirect()->back();
    }

    public function storeSubtask(Request $request, Card $card): RedirectResponse
    {
        $card->load('column.board');
        if ($card->column->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $maxOrder = $card->subtasks()->max('order_position') ?? -1;

        $card->subtasks()->create([
            'title' => $validated['title'],
            'is_completed' => false,
            'order_position' => $maxOrder + 1,
        ]);

        return redirect()->back();
    }

    public function destroySubtask(Request $request, Subtask $subtask): RedirectResponse
    {
        $subtask->load('card.column.board');
        if ($subtask->card->column->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $subtask->delete();

        return redirect()->back();
    }

    public function storeColumn(Request $request, Board $board): RedirectResponse
    {
        if ($board->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'wip_limit' => 'nullable|integer|min:1',
            'color' => 'nullable|string|max:7',
        ]);

        $maxOrder = $board->columns()->max('order_position') ?? -1;

        $board->columns()->create([
            'title' => $validated['title'],
            'wip_limit' => $validated['wip_limit'] ?? null,
            'color' => $validated['color'] ?? '#64748b',
            'order_position' => $maxOrder + 1,
        ]);

        return redirect()->back();
    }

    public function destroyColumn(Request $request, Column $column): RedirectResponse
    {
        $column->load('board');
        if ($column->board->user_id !== $request->user()->id) {
            abort(403);
        }

        $column->delete();

        return redirect()->back();
    }

    public function reorderColumns(Request $request, Board $board): RedirectResponse
    {
        if ($board->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'column_orders' => 'required|array',
            'column_orders.*.id' => 'required|exists:columns,id',
            'column_orders.*.order_position' => 'required|integer',
        ]);

        $colIds = collect($validated['column_orders'])->pluck('id');
        $ownedColsCount = Column::where('board_id', $board->id)
            ->whereIn('id', $colIds)
            ->count();

        if ($ownedColsCount !== count($validated['column_orders'])) {
            abort(403);
        }

        DB::transaction(function () use ($validated, $board) {
            foreach ($validated['column_orders'] as $item) {
                Column::where('id', $item['id'])
                    ->where('board_id', $board->id)
                    ->update(['order_position' => $item['order_position']]);
            }
        });

        return redirect()->back();
    }
}
