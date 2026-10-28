<?php

namespace App\Notifications;

use App\Models\Card;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CardDeadlineNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @param Card $card
     * @param string $type ('overdue' | 'due_today' | 'due_tomorrow' | 'due_soon')
     */
    public function __construct(
        public Card $card,
        public string $type = 'due_today'
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $board = $this->card->column?->board;
        $dueDate = $this->card->due_date ? Carbon::parse($this->card->due_date)->startOfDay() : null;
        $daysDiff = $dueDate ? (int) round(Carbon::today()->startOfDay()->diffInDays($dueDate, false)) : null;

        $message = match ($this->type) {
            'overdue' => "Prazo vencido: O cartão \"{$this->card->title}\" expirou.",
            'due_today' => "Vence hoje: O cartão \"{$this->card->title}\" deve ser concluído hoje.",
            'due_tomorrow' => "Vence amanhã: O cartão \"{$this->card->title}\" tem prazo até amanhã.",
            'due_soon' => "Prestes a expirar: O cartão \"{$this->card->title}\" vence em " . ($daysDiff ? "{$daysDiff} dias" : 'breve') . ".",
            default => "Lembrete: O cartão \"{$this->card->title}\" tem prazo próximo.",
        };

        return [
            'card_id' => $this->card->id,
            'card_title' => $this->card->title,
            'board_id' => $board?->id,
            'board_title' => $board?->title,
            'due_date' => $this->card->due_date ? (is_string($this->card->due_date) ? $this->card->due_date : $this->card->due_date->format('Y-m-d')) : null,
            'type' => $this->type,
            'days_diff' => $daysDiff,
            'message' => $message,
        ];
    }
}
