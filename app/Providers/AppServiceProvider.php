<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Hostinger shared hosting: ignore harmless tempnam notice from Blade compiler
        set_error_handler(function ($level, $message, $file = '', $line = 0) {
            if (str_contains($message, 'tempnam()')) {
                return true;
            }
            return false;
        }, E_NOTICE | E_WARNING);
    }
}
