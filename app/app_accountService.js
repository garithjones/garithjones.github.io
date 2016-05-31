angular.module('app').service('AccountService', ['$rootScope', '$http', '$q', '$cookies', '$browser', '$window', 'DSP_REQUEST_URL_USER',
    function ($rootScope, $http, $q, $cookies, $browser, $window, DSP_REQUEST_URL_USER) {
        // Handle response from DreamFactory for login and register
        var handleResult = function (result) {
            // set header X-DreamFactory-Session-Token for all api calls
            $http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.data.session_token;

            console.log(result.data);
            //set user in localStorage and $rootScope for future use. 
            try {
                //$window.localStorage.user = JSON.parse(result.data);
            } catch (e) { }
        };

        // Login
        this.Login = function (creds) {
            var deferred = $q.defer();
            console.log("in login function");

            $http.post(DSP_REQUEST_URL_USER + 'session/', creds).then(loginSuccess, loginFailure);

            function loginSuccess(result) {
                console.log(result);
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.data.session_token;

                //$cookies.putObject("session_token", result.data.session_token);
                $rootScope.session_token = result.data.session_token;

                //$cookies.putObject("user", result.data);
                $rootScope.user = result.data;


                //$cookies.putObject('isLoggedIn', true);
                $rootScope.isLoggedIn = true;

                try {
                    $window.localStorage.isLoggedIn = true;
                    $window.localStorage.session_token = result.data.session_token;
                    $window.localStorage.user = JSON.stringify(result.data);
                } catch (e) { }

                deferred.resolve();

            }

            function loginFailure(data) {
                console.log(data);
                var rejectMessage = data.data.error.message;

                deferred.reject(rejectMessage);
            }

            return deferred.promise;
        };

        this.Logout = function () {
            var deferred = $q.defer();

            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];

            console.log("Remove Variables");
            $rootScope.isLoggedIn = false;
            $rootScope.user = {};
            $rootScope.session_token = '';

            window.localStorage.clear();


            deferred.resolve();


            return deferred.promise;
        };

        // Register
        this.Register = function (creds) {
            var deferred = $q.defer();

            $http.post(DSP_REQUEST_URL_USER + 'register?login=true', creds).then(function (result) {
                console.log(result);
                deferred.resolve();
            }, deferred.reject);

            return deferred.promise;
        };
    }]);
