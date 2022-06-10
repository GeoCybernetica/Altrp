<?php

namespace App\Providers\SocialiteProviders\Geobuilder;

use Exception;
use GuzzleHttp\Client;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use Laravel\Socialite\Two\InvalidStateException;
use SocialiteProviders\Manager\OAuth2\AbstractProvider;
use SocialiteProviders\Manager\OAuth2\User;

class GeobuilderProvider extends AbstractProvider
{
    /**
     * Unique Provider Identifier.
     */
    public const IDENTIFIER = 'SOCIALITE_GEOBUILDER';

    /**
     * The HTTP Client instance.
     *
     * @var \GuzzleHttp\Client
     */
    protected $httpClient;

    /**
     * Indicates if the session state should be utilized.
     *
     * @var bool
     */
    protected $stateless = true;
    protected $token;

    /**
     * {@inheritdoc}
     */
    protected $scopes = [
        'openid',
    ];

    /**
     * Create a new provider instance.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $clientId
     * @param  string  $clientSecret
     * @param  string  $redirectUrl
     * @param  array  $guzzle
     * @return void
     */
    public function __construct(Request $request, $clientId, $clientSecret, $redirectUrl)
    {
        $this->request = $request;
        $this->clientId = $clientId;
        $this->redirectUrl = $redirectUrl;
        $this->clientSecret = $clientSecret;
        // TODO: bad idea, add cert locally
        $this->httpClient = new Client([
            'verify' => false
        ]);
    }

    /**
     * Get OpenID Configuration.
     *
     * @throws Laravel\Socialite\Two\InvalidStateException
     *
     * @return mixed
     */
    private function getOpenIdConfiguration()
    {
        try {
            $response = $this->getHttpClient()->get($this->getConfig('oidc_url') . '/.well-known/openid-configuration');
        } catch (Exception $ex) {
            throw new InvalidStateException("Error getting OpenID Configuration. {$ex}");
        }

        return json_decode((string) $response->getBody());
    }

    /**
     * Get public keys to verify id_token from jwks_uri.
     *
     * @return array
     */
    private function getJWTKeys()
    {
        $response = $this->getHttpClient()->get($this->getOpenIdConfiguration()->jwks_uri);

        return json_decode((string) $response->getBody(), true);
    }

    /**
     * {@inheritdoc}
     */
    protected function getAuthUrl($state)
    {
        return $this->buildAuthUrlFromBase(
            $this->getOpenIdConfiguration()->authorization_endpoint,
            $state
        );
    }

    /**
     * {@inheritdoc}
     */
    protected function getTokenUrl()
    {
        return $this->getOpenIdConfiguration()->token_endpoint;
    }

    /**
     * {@inheritdoc}
     */
    protected function getUserByToken($token)
    {
        // No implementation for OIDC
    }

    /**
     * Additional implementation to get user claims from id_token.
     *
     * @return \SocialiteProviders\Manager\OAuth2\User
     */
    public function user()
    {
        $token = $this->request->input('id_token');
        $accessToken = $this->request->input('token');
        $claims = $this->validateIdToken($token);

        $user = $this->mapUserToObject($claims);
        $this->token = $accessToken;
        return $user;
    }

    /**
     * validate id_token
     * - signature validation using firebase/jwt library.
     * - claims validation
     *   iss: MUST much iss = issuer value on metadata.
     *   aud: MUST include client_id for this client.
     *   exp: MUST time() < exp.
     *
     * @param string $idToken
     *
     * @throws Laravel\Socialite\Two\InvalidStateException
     *
     * @return array
     */
    private function validateIdToken($idToken)
    {
        try {
            // payload validation
            $payload = explode('.', $idToken);
            $payloadJson = json_decode(base64_decode(str_pad(strtr($payload[1], '-_', '+/'), strlen($payload[1]) % 4, '=', STR_PAD_RIGHT)), true);

            // iss validation
            if (strcmp($payloadJson['iss'], $this->getOpenIdConfiguration()->issuer)) {
                throw new InvalidStateException('iss on id_token does not match issuer value on the OpenID configuration');
            }
            // aud validation
            if (strpos($payloadJson['aud'], $this->config['client_id']) === false) {
                throw new InvalidStateException('aud on id_token does not match the client_id for this application');
            }
            // exp validation
            if ((int) $payloadJson['exp'] < time()) {
                throw new InvalidStateException('id_token is expired');
            }

            // signature validation and return claims
            return (array) JWT::decode($idToken, JWK::parseKeySet($this->getJWTKeys()), $this->getOpenIdConfiguration()->id_token_signing_alg_values_supported);
        } catch (Exception $ex) {
            throw new InvalidStateException("Error on validationg id_token. {$ex}");
        }
    }

    /**
     * {@inheritdoc}
     */
    protected function mapUserToObject(array $user)
    {
        return (new User())->setRaw($user)->map([
            'id'   => $user['sub'],
            'name' => $user['name'] ?? '',
            'permissions' => $user['permissions'] ?? []
        ]);
    }

    /**
     * return logout endpoint with post_logout_uri paramter.
     *
     * @return string
     */
    public function logout($post_logout_uri)
    {
        return $this->getOpenIdConfiguration()->end_session_endpoint
            .'?logout&post_logout_redirect_uri='
            .urlencode($post_logout_uri);
    }

    /**
     * Get the code from the request.
     *
     * @return string
     */
    protected function getCode()
    {
        return $this->request->input('code');
    }

    /**
      * Get the GET parameters for the code request.
      *
      * @param  string|null  $state
      * @return array
      */
     protected function getCodeFields($state = null)
     {
         $fields = parent::getCodeFields($state);
         $fields['state'] = $this->getConfig('state');
         $fields['nonce'] = $this->getConfig('nonce');
         $fields['scope'] = 'openid profile authz.grants orgstruct.read';
         $fields['response_type'] = 'token id_token';
         return $fields;
     }

    /**
      * Load user permissions from Geoserver.
      *
      * @param  string|null  $state
      * @return array
      */
     public function loadPermissions($roles)
     {
         $token = $this->request->input('access_token');
         $url = $this->getConfig('permissions_url');
         try {
             $response = $this->getHttpClient()->post($url, [
                 'headers' => [
                     'Authorization' => 'Bearer '. $token,
                 ],
                 'json' => $roles,
             ]);
         } catch (Exception $ex) {
             throw new InvalidStateException("Error getting user permissions. {$ex}");
         }

         $data = json_decode((string) $response->getBody());
         $collection = collect($data->value);
         $permissions = $collection->filter(function ($item) {
             return $item->access === 1;
         })->map(function ($item) {
             return $item->operation;
         })->all();

         return $permissions;
     }

    /**
     * @return array
     */
    public static function additionalConfigKeys()
    {
        return [
            'oidc_url',
            'policy',
            'state',
            'nonce',
        ];
    }
}
