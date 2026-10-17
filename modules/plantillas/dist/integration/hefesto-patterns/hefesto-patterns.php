<?php
/**
 * Plugin Name: Hefesto — Packs por rubro
 * Description: Registra 48 patrones de bloques con contenido de ejemplo. No crea ni modifica páginas.
 * Version: 1.0.0
 * Requires at least: 6.0
 * License: GPL-2.0-or-later
 */
if (!defined('ABSPATH')) { exit; }
add_action('init', function () {
    if (!function_exists('register_block_pattern')) { return; }
    register_block_pattern_category('hefesto', ['label' => 'Hefesto · Rubros']);
    $raw = file_get_contents(__DIR__ . '/patterns.json');
    $patterns = json_decode($raw, true);
    if (!is_array($patterns)) { return; }
    foreach ($patterns as $pattern) {
        register_block_pattern($pattern['slug'], [
            'title' => $pattern['title'],
            'description' => $pattern['description'],
            'categories' => ['hefesto'],
            'content' => $pattern['content'],
        ]);
    }
});
