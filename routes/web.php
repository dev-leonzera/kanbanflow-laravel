<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\BoardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ChangelogController;

Route::get('/', function () {
    return redirect()->route('board.index');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/board', [BoardController::class, 'index'])->name('board.index');
    Route::post('/boards', [BoardController::class, 'storeBoard'])->name('boards.store');
    Route::delete('/boards/{board}', [BoardController::class, 'destroyBoard'])->name('boards.destroy');
    Route::get('/dashboard', function () {
        return redirect()->route('board.index');
    })->name('dashboard');

    Route::post('/cards', [BoardController::class, 'storeCard'])->name('cards.store');
    Route::put('/cards/{card}', [BoardController::class, 'updateCard'])->name('cards.update');
    Route::patch('/cards/{card}/move', [BoardController::class, 'moveCard'])->name('cards.move');
    Route::delete('/cards/{card}', [BoardController::class, 'destroyCard'])->name('cards.destroy');
    Route::post('/cards/reorder', [BoardController::class, 'reorderCards'])->name('cards.reorder');

    Route::post('/boards/{board}/labels', [BoardController::class, 'storeLabel'])->name('labels.store');
    Route::put('/labels/{label}', [BoardController::class, 'updateLabel'])->name('labels.update');
    Route::delete('/labels/{label}', [BoardController::class, 'destroyLabel'])->name('labels.destroy');

    Route::post('/cards/{card}/time-entries', [BoardController::class, 'storeTimeEntry'])->name('cards.time_entries.store');

    Route::post('/cards/{card}/subtasks', [BoardController::class, 'storeSubtask'])->name('subtasks.store');
    Route::patch('/subtasks/{subtask}/toggle', [BoardController::class, 'toggleSubtask'])->name('subtasks.toggle');
    Route::delete('/subtasks/{subtask}', [BoardController::class, 'destroySubtask'])->name('subtasks.destroy');

    Route::post('/boards/{board}/columns', [BoardController::class, 'storeColumn'])->name('columns.store');
    Route::delete('/columns/{column}', [BoardController::class, 'destroyColumn'])->name('columns.destroy');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark_read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark_all_read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    Route::post('/changelog/acknowledge', [ChangelogController::class, 'acknowledge'])->name('changelog.acknowledge');
    Route::get('/changelog', [ChangelogController::class, 'index'])->name('changelog.index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
