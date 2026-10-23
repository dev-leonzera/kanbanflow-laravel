<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Hostinger shared hosting: Ensure tempnam uses a writable local directory without triggering E_NOTICE
putenv('TMPDIR=' . __DIR__ . '/../storage/framework/views');
ini_set('sys_temp_dir', __DIR__ . '/../storage/framework/views');

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Ensure .env or production environment variables are loaded
if (file_exists($envFile = __DIR__.'/../.env.production')) {
    \Dotenv\Dotenv::createMutable(dirname(__DIR__), '.env.production')->safeLoad();
}

if (!getenv('APP_KEY') && !isset($_ENV['APP_KEY'])) {
    putenv('APP_KEY=base64:vnCWt3sVTSyETE2U0RnVpYuUnI8qC++Cbq3cYam2bGo=');
    $_ENV['APP_KEY'] = 'base64:vnCWt3sVTSyETE2U0RnVpYuUnI8qC++Cbq3cYam2bGo=';
}

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
