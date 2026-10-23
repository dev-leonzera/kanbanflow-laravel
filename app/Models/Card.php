<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'column_id',
        'title',
        'description',
        'priority',
        'color',
        'order_position',
        'due_date',
        'estimate_minutes',
    ];

    protected $casts = [
        'order_position' => 'integer',
        'estimate_minutes' => 'integer',
        'due_date' => 'date:Y-m-d',
    ];

    protected $appends = [
        'time_spent_seconds',
    ];

    public function getTimeSpentSecondsAttribute(): int
    {
        return (int) $this->timeEntries()->sum('duration_seconds');
    }

    public function column(): BelongsTo
    {
        return $this->belongsTo(Column::class);
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Subtask::class)->orderBy('order_position', 'asc');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class, 'card_label');
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }
}
