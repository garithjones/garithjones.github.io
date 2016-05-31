angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('LandingPage', {
                url: '/',
                templateUrl: 'app/modules/LandingPageView.html',
                controller: 'LandingPageCtrl'
            })
            .state('MapBrowser', {
                url: '/MapBrowser',
                templateUrl: 'app/modules/Browser/MapBrowserView.html',
                controller: 'MapBrowserCtrl'
            })
            .state('MapBrowser.CatchmentDetail', {
                url: 'CatchmentDetail',
                templateUrl: 'app/modules/Browser/CatchmentDetail/CatchmentDetailView.html',
                controller: 'CatchmentDetailCtrl'
            })
            .state('MapBrowser.FacilityCalculator', {
                url: 'FacilityCalculator',
                templateUrl: 'app/modules/Browser/FacilityCalculator/FacilityCalculatorView.html',
                controller: 'FacilityCalculatorCtrl'
            });

    }]);