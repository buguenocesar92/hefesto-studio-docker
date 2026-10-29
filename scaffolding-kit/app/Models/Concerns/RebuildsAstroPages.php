<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Services\CloudflarePagesRebuilder;
use Illuminate\Database\Eloquent\Model;

trait RebuildsAstroPages
{
    public static function bootRebuildsAstroPages(): void
    {
        static::saved(function (Model $model): void {
            if (! self::shouldTriggerAstroRebuild($model)) {
                return;
            }

            dispatch(function () use ($model): void {
                app(CloudflarePagesRebuilder::class)->trigger(
                    reason: class_basename($model) . ':saved',
                    context: [
                        'model' => class_basename($model),
                        'id' => $model->getKey(),
                        'slug' => $model->getAttribute('slug') ?? $model->getAttribute('id'),
                    ]
                );
            })->afterResponse();
        });

        static::deleted(function (Model $model): void {
            dispatch(function () use ($model): void {
                app(CloudflarePagesRebuilder::class)->trigger(
                    reason: class_basename($model) . ':deleted',
                    context: [
                        'model' => class_basename($model),
                        'id' => $model->getKey(),
                    ]
                );
            })->afterResponse();
        });
    }

    protected static function shouldTriggerAstroRebuild(Model $model): bool
    {
        // Si el modelo tiene columna `is_published` o `status`, evitamos disparar builds por borradores no publicados
        if (array_key_exists('is_published', $model->getAttributes())) {
            return (bool) $model->getAttribute('is_published') || $model->wasChanged('is_published');
        }

        if (array_key_exists('status', $model->getAttributes())) {
            $status = (string) $model->getAttribute('status');

            return $status !== 'draft' || $model->wasChanged('status');
        }

        return true;
    }
}
