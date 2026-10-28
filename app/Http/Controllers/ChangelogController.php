<?php

namespace App\Http\Controllers;

use App\Services\ChangelogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChangelogController extends Controller
{
    /**
     * Confirma a visualização do changelog da versão atual pelo usuário autenticado.
     */
    public function acknowledge(Request $request, ChangelogService $changelogService): RedirectResponse
    {
        $user = $request->user();

        if ($user !== null) {
            $changelogService->markVersionAsSeen($user);
        }

        return redirect()->back();
    }

    /**
     * Retorna a lista de lançamentos e versão atual em formato JSON.
     */
    public function index(ChangelogService $changelogService): JsonResponse
    {
        return response()->json([
            'current_version' => $changelogService->getCurrentVersion(),
            'releases' => $changelogService->getReleases(),
        ]);
    }
}
