<?php

namespace App\Http\Controllers\Auth;

use Laravel\Socialite\Facades\Socialite;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;

use App\User;
use App\Providers\RouteServiceProvider;
use App\Http\Controllers\Controller;

class SocialiteController extends Controller
{
    /**
     * @var Guard
     */
    private $auth;
    protected $token;

    /**
     * Where to redirect users after login.
     * TODO: save target page and redirect onto it
     *
     * @var string
     */
    // protected $redirectTo = RouteServiceProvider::HOME;
    protected $redirectTo = '/zv';

    /**
     * SocialiteController constructor.
     *
     * @param Request $request
     * @param Factory $socialite
     * @param Guard   $auth
     */
    public function __construct(Request $request, Guard $auth)
    {
        $this->request = $request;
        $this->auth = $auth;
    }

    public function redirect($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback($provider)
    {
        $socialiteUser = Socialite::driver($provider)->user();
        $user = User::socialite($socialiteUser, $provider);
        $this->auth->loginUsingId($user->id);
        $roles = $this->auth->user()->getAllUserRoleNames();
        $permissions = Socialite::driver($provider)->loadPermissions($roles);
        $user->setUserRolesByNames($permissions);
        return redirect($this->redirectTo);
    }

}
