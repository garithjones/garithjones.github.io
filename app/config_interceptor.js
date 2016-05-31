
// Authentication interceptor. Executes a function everytime before sending any request.
angular.module('app').factory('httpInterceptor', ['$location', '$q', '$injector', '$cookies', '$rootScope', '$window', 'DSP_URL', 'APP_API_KEY', function ($location, $q, $injector, $cookies, $rootScope, $window, DSP_URL, APP_API_KEY) {

    console.log("INTERCEPTOR WORKS!");
    return {

        request: function (config) {
            //console.log(config);
            //console.log($cookies);
            //config.headers['X-Dreamfactory-API-Key'] = APP_API_KEY;
            // config.headers['X-DreamFactory-Session-Token'] = $rootScope.session_token;
            // Append instance url before every api call
            /*                        if (config.url.indexOf('/api/v2') > -1) {
                                            config.url = DSP_URL + config.url;
                                        }
                */
            // delete x-dreamfactory-session-token header if login
            //if (config.method.toLowerCase() === 'post' && config.url.indexOf('/api/v2/user/session') > -1) {
            //    delete config.headers['X-DreamFactory-Session-Token'];
            //}

            //console.log(config);

            return config;
        },

        responseError: function (result) {
            console.log("An error occurred");
            console.log(result);

            //common.logger.logError("BOOM");

            if (result !== undefined && result !== null) {
                if (result.data !== undefined && result.data !== null) {
                    if (result.data.error !== undefined && result.data.error !== null) {
                        //common.logger.logError(result.data.error.message);
                    }
                }
            }
            // If status is 401 or 403 with token blacklist error then redirect to login 
            if (result.status === 401 || (result.status === 403 && result.data.error.message.indexOf('token') > -1)) {
                /*We need to clear the local storage as well when this happens*/
                window.localStorage.clear();


                $location.path('/Login');
            }

            //var $mdToast = $injector.get('$mdToast');
            //common.logger.logError(result.data.error.message, result.data.error, null, true);


            //                        $mdToast.show($mdToast.simple().content('Error: ' + result.data.error.message));

            return $q.reject(result);
        }
    };
}]);
