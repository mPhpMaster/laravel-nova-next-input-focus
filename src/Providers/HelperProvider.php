<?php
/** @noinspection PhpIllegalPsrClassPathInspection */

/*
 * Copyright © 2023. mPhpMaster(https://github.com/mPhpMaster) All rights reserved.
 */

namespace MPhpMaster\LaravelNovaNextInputFocus\Providers;

use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;
use Laravel\Nova\Events\ServingNova;
use Nova;

/**
 * Class HelperProvider
 *
 * @package MPhpMaster\LaravelNovaNextInputFocus\Providers
 */
class HelperProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     *
     * @param Router $router
     *
     * @return void
     */
    public function boot(Router $router)
    {
        require_once __DIR__ . '/../Helpers/FHelpers.php';

        if( $this->app->runningInConsole() ) {
            $this->publishes([
                                 dirname(__DIR__) . '/../config/laravel_nova_next_input_focus.php' => config_path('laravel_nova_next_input_focus.php'),
                             ], 'nova-next-input-focus-config');
        }

        Nova::serving(function(ServingNova $event) {
            Nova::provideToScript([ 'next_input_focus' => config('nova-next-input-focus-config', [ 'enabled' => false ]) ]);
        });

        Nova::serving(function(ServingNova $event) {
            Nova::script('when-ready-src', dirname(__DIR__) . '/js/whenReady.js');
            Nova::script('next-element-src', dirname(__DIR__) . '/js/nextElement.js');
            Nova::script('laravel-nova-next-element-src', dirname(__DIR__) . '/js/laravel-nova.js');
        });
    }

    /**
     * @return array
     */
    public function provides()
    {
        return [];
    }

    public function register()
    {
        $this->mergeConfigFrom(
            dirname(__DIR__) . '/../config/laravel_nova_next_input_focus.php',
            'nova-next-input-focus-config'
        );
    }
}
