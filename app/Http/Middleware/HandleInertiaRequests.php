<?php

namespace App\Http\Middleware;

use App\Services\ChangelogService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $changelogService = app(ChangelogService::class);
        $currentVersion = $changelogService->getCurrentVersion();
        $shouldShow = $changelogService->shouldShowChangelogFor($user);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'unread_notifications_count' => $user ? $user->unreadNotifications()->count() : 0,
            ],
            'app_version' => $currentVersion,
            'changelog' => [
                'current_version' => $currentVersion,
                'should_show' => $shouldShow,
                'latest_release' => $changelogService->getLatestRelease(),
                'all_releases' => $changelogService->getReleases(),
            ],
        ];
    }
}
