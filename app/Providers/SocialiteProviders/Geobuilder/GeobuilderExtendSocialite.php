<?php

namespace App\Providers\SocialiteProviders\Geobuilder;

use SocialiteProviders\Manager\SocialiteWasCalled;

class GeobuilderExtendSocialite
{
    /**
     * Execute the provider.
     */
    public function handle(SocialiteWasCalled $socialiteWasCalled)
    {
        $socialiteWasCalled->extendSocialite('geobuilder', __NAMESPACE__.'\GeobuilderProvider');
    }
}
