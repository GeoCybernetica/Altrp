<?php

namespace App\Providers\SocialiteProviders\Geobuilder;

use SocialiteProviders\Manager\OAuth2\AbstractProvider;
use SocialiteProviders\Manager\OAuth2\User;

class GeobuilderProvider extends AbstractProvider
{
    /**
     * Unique Provider Identifier.
     */
    const IDENTIFIER = 'SOCIALITE_GEOBUILDER';

    private const URL = 'https://fs.geobuilder.ru/idp/connect';


    /**
     * {@inheritdoc}
     */
    protected function getAuthUrl($state)
    {
        return $this->buildAuthUrlFromBase(self::URL.'/authorize', $state);
    }

    /**
     * {@inheritdoc}
     */
    protected function getTokenUrl()
    {
        return self::URL.'/access_token';
    }

    /**
     * {@inheritdoc}
     */
    protected function getUserByToken($token)
    {
        $response = $this->getHttpClient()->get(self::URL.'/user', [
            'headers' => [
                'Authorization' => 'Bearer '.$token,
            ],
        ]);

        return json_decode($response->getBody(), true);
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




    /**
     * {@inheritdoc}
     */
    protected function mapUserToObject(array $user)
    {
        return (new User())->setRaw($user['user'])->map([
            'id'       => $user['user']['uid'],
            'nickname' => $user['user']['username'],
            'name'     => $user['user']['name'],
            'email'    => $user['user']['email'],
        ]);
    }
}
