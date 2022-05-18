<?php

namespace App\Providers\SocialiteProviders\Geobuilder;

use SocialiteProviders\Manager\OAuth2\AbstractProvider;
use SocialiteProviders\Manager\OAuth2\User;

class GeobuilderProvider extends AbstractProvider
{
    /**
     * Unique Provider Identifier.
     */
    public const IDENTIFIER = 'SOCIALITE_GEOBUILDER';

    /**
     * Base OAuth service URL
     * TODO: move out to config?
     *
     * @var string
     */
    private const URL = 'https://fs.geobuilder.ru/idp/connect';

    /**
     * Indicates if the session state should be utilized.
     *
     * @var bool
     */
    protected $stateless = true;

    // protected $scopeSeparator = ' ';
    // protected $scopes = ['openid'];

    /**
     * {@inheritdoc}
     */
    public static function additionalConfigKeys()
    {
        return ['client_secret', 'nonce', 'realms'];
    }

    // protected function getBaseUrl()
    // {
    //     return rtrim(rtrim($this->getConfig('base_url'), '/').'/realms/'.$this->getConfig('realms', 'master'), '/');
    // }

    protected function getBaseUrl()
    {
        return self::URL;
    }

    /**
     * {@inheritdoc}
     */
    protected function getAuthUrl($state)
    {
        return $this->buildAuthUrlFromBase($this->getBaseUrl().'/authorize', $state);
    }

    /**
     * {@inheritdoc}
     */
    protected function getTokenUrl()
    {
        return $this->getBaseUrl().'/token';
    }

    /**
     * Get the access token response for the given code.
     *
     * @param  string  $code
     * @return array
     */
    public function getAccessTokenResponse($code)
    {
        $response = $this->getHttpClient()->post($this->getTokenUrl(), [
            'headers' => ['Accept' => 'application/json'],
            'form_params' => $this->getTokenFields($code),
        ]);

        return json_decode($response->getBody(), true);
    }

    /**
     * {@inheritdoc}
     */
    protected function getUserByToken($token)
    {
        $response = $this->getHttpClient()->get($this->getBaseUrl().'/userinfo', [
            RequestOptions::HEADERS => [
                'Authorization' => 'Bearer '.$token,
            ],
        ]);

        print '<pre>'; print_r($response->getBody()); die;
        return json_decode((string) $response->getBody(), true);
    }

    /**
     * {@inheritdoc}
     */
    protected function mapUserToObject(array $user)
    {
        return (new User())->setRaw($user)->map([
            'id'        => Arr::get($user, 'sub'),
            'name'      => Arr::get($user, 'name'),
            'email'     => Arr::get($user, 'email'),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    protected function getTokenFields($code)
    {
        return array_merge(parent::getTokenFields($code), [
            'grant_type' => 'authorization_code',
        ]);
    }

    /**
     * Return logout endpoint with redirect_uri query parameter.
     *
     * @return string
     */
    public function getLogoutUrl(string $redirectUri)
    {
        return $this->getBaseUrl().'/logout?redirect_uri='.urlencode($redirectUri);
    }


    /**
      * Get the GET parameters for the code request.
      *
      * @param  string|null  $state
      * @return array
      */
     protected function getCodeFields($state = null)
     {
         $fields = [
             'client_id' => $this->clientId,
             'redirect_uri' => $this->redirectUrl,
             'scope' => 'openid profile authz.grants orgstruct.read',
             'response_type' => 'token id_token',
             'state' => '4d6021430fec40ec8a9872e89be8247a',
             'nonce' => 'f8c167c0ba0949bfaa07fa40ab824e02',
         ];

         return array_merge($fields, $this->parameters);
     }
}
