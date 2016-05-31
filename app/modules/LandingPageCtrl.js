angular.module('app').controller('LandingPageCtrl', ['$scope', '$rootScope', '$location', '$state', 'common', 'SharedFunctionsCommonData', LandingPageCtrl]);

function LandingPageCtrl($scope, $rootScope, $location, $state, common, SharedFunctionsCommonData) {
   $scope.state = $state;
    $scope.GoToMapBrowser = function () {
        $state.go('MapBrowser');
    };
    $scope.state = $state;
    $scope.GoToFacilityCalculator = function () {
        $state.go('MapBrowser.FacilityCalculator');
    };
}

