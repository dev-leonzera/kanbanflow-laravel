<?php

namespace App\Services;

use App\Models\User;

class ChangelogService
{
    /**
     * Obter a versão atual configurada para a aplicação.
     */
    public function getCurrentVersion(): string
    {
        return (string) config('changelog.current_version', 'v1.4.0');
    }

    /**
     * Obter a lista completa de atualizações e notas de versão.
     *
     * @return array<int, array{
     *     version: string,
     *     date: string,
     *     title: string,
     *     summary: string,
     *     items: array<int, array{type: string, title: string, description: string}>
     * }>
     */
    public function getReleases(): array
    {
        return config('changelog.releases', []);
    }

    /**
     * Obter a nota de lançamento mais recente.
     *
     * @return array{
     *     version: string,
     *     date: string,
     *     title: string,
     *     summary: string,
     *     items: array<int, array{type: string, title: string, description: string}>
     * }|null
     */
    public function getLatestRelease(): ?array
    {
        $releases = $this->getReleases();

        return !empty($releases) ? $releases[0] : null;
    }

    /**
     * Verifica se o changelog deve ser apresentado ao usuário no seu primeiro acesso após a atualização.
     */
    public function shouldShowChangelogFor(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        $currentVersion = $this->getCurrentVersion();

        return $user->last_seen_version !== $currentVersion;
    }

    /**
     * Marca a versão atual (ou especificada) como vista pelo usuário.
     */
    public function markVersionAsSeen(User $user, ?string $version = null): void
    {
        $versionToMark = $version ?? $this->getCurrentVersion();

        $user->update([
            'last_seen_version' => $versionToMark,
        ]);
    }
}
