<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Lista as notificações mais recentes do usuário autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest()
            ->take(25)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at?->toISOString(),
                    'created_at' => $notification->created_at?->toISOString(),
                    'created_at_human' => $notification->created_at?->diffForHumans(),
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Marca uma notificação específica como lida.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Marca todas as notificações do usuário como lidas.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'unread_count' => 0,
        ]);
    }

    /**
     * Remove uma notificação.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()->notifications()->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }
}
