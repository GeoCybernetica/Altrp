<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'telegram-bot-api' => [
        'token' => env('ALTRP_SETTING_TELEGRAM_BOT_TOKEN', '')
    ],

    'geobuilder' => [
      'oidc_url' => env('GEOBUILDER_OIDC_URL'),
      'permissions_url' => env('GEOBUILDER_PERMISSIONS_URL'),
      'client_id' => env('GEOBUILDER_CLIENT_ID'),
      'client_secret' => env('GEOBUILDER_CLIENT_SECRET'),
      'redirect' => env('GEOBUILDER_REDIRECT_URI'),
      'state' => env('GEOBUILDER_STATE'),
      'nonce' => env('GEOBUILDER_NONCE'),
    ]

];
