<?php

namespace App\Console\Commands;

use App\Models\Card;
use App\Models\User;
use App\Notifications\CardDeadlineNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckCardDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cards:check-deadlines {--days=3 : Dias de antecedência para considerar prestes a expirar}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica prazos de cartões (vencidos e prestes a expirar) e gera notificações in-app';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today()->startOfDay();
        $daysAhead = (int) $this->option('days');

        $this->info("Iniciando checagem de prazos de cartões (vencidos e prestes a expirar em até {$daysAhead} dias)...");

        $cards = Card::with(['column.board.user'])
            ->whereNotNull('due_date')
            ->get();

        $notificationsSent = 0;

        foreach ($cards as $card) {
            $column = $card->column;
            if (!$column) {
                continue;
            }

            // Ignora cartões que já estejam em colunas de conclusão
            $colTitle = mb_strtolower(trim($column->title));
            if (in_array($colTitle, ['concluído', 'concluido', 'done', 'finalizado', 'feito', 'pronto'])) {
                continue;
            }

            $user = $column->board?->user;
            if (!$user) {
                continue;
            }

            $dueDate = Carbon::parse($card->due_date)->startOfDay();
            $daysDiff = (int) round($today->diffInDays($dueDate, false));

            $type = null;
            if ($dueDate->lt($today)) {
                $type = 'overdue';
            } elseif ($dueDate->eq($today)) {
                $type = 'due_today';
            } elseif ($dueDate->eq($today->copy()->addDay())) {
                $type = 'due_tomorrow';
            } elseif ($dueDate->gt($today->copy()->addDay()) && $dueDate->lte($today->copy()->addDays($daysAhead))) {
                $type = 'due_soon';
            }

            if (!$type) {
                continue;
            }

            // Evita duplicar a mesma notificação para o cartão no mesmo dia
            $alreadyNotified = DB::table('notifications')
                ->where('notifiable_type', User::class)
                ->where('notifiable_id', $user->id)
                ->whereDate('created_at', Carbon::today())
                ->where('data', 'like', '%"card_id":' . $card->id . '%')
                ->where('data', 'like', '%"type":"' . $type . '"%')
                ->exists();

            if (!$alreadyNotified) {
                $user->notify(new CardDeadlineNotification($card, $type));
                $notificationsSent++;
            }
        }

        $this->info("Checagem concluída. {$notificationsSent} novas notificações geradas.");

        return Command::SUCCESS;
    }
}
