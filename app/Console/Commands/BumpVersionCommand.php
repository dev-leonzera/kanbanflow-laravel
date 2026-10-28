<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BumpVersionCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:bump-version 
                            {version : A nova versão (ex: v1.5.0)} 
                            {--title= : Título de destaque da atualização} 
                            {--summary= : Resumo das principais novidades}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gera uma nova versão da aplicação e atualiza o histórico de changelog';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $version = (string) $this->argument('version');
        $title = (string) ($this->option('title') ?: 'Atualização do Sistema');
        $summary = (string) ($this->option('summary') ?: 'Melhorias contínuas e novas funcionalidades no KanbanFlow.');

        $configPath = config_path('changelog.php');

        if (!file_exists($configPath)) {
            $this->error("Arquivo de configuração {$configPath} não encontrado.");
            return Command::FAILURE;
        }

        $config = require $configPath;

        $newRelease = [
            'version' => $version,
            'date' => date('Y-m-d'),
            'title' => $title,
            'summary' => $summary,
            'items' => [
                [
                    'type' => 'improvement',
                    'title' => 'Otimizações do Sistema',
                    'description' => 'Aprimoramentos de estabilidade, desempenho e interface.',
                ],
            ],
        ];

        $releases = $config['releases'] ?? [];
        array_unshift($releases, $newRelease);

        $export = var_export([
            'current_version' => $version,
            'releases' => $releases,
        ], true);

        $content = "<?php\n\nreturn {$export};\n";

        file_put_contents($configPath, $content);

        $this->call('config:clear');

        $this->info("Versão atualizada com sucesso para {$version}!");
        $this->line("Usuários verão o changelog automaticamente no próximo login.");

        return Command::SUCCESS;
    }
}
