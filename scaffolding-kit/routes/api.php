<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\ScaffoldingCmsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/products', [ScaffoldingCmsController::class, 'products']);
    Route::get('/ecosystem', [ScaffoldingCmsController::class, 'ecosystem']);
    Route::get('/cases', [ScaffoldingCmsController::class, 'cases']);
    Route::get('/cases/kraftdo', [ScaffoldingCmsController::class, 'kraftdoCase']);
    Route::get('/templates', [ScaffoldingCmsController::class, 'templates']);
    Route::get('/legal', [ScaffoldingCmsController::class, 'legal']);
});
