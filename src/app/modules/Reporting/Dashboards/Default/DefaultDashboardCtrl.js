angular.module('app').controller(DefaultDashboardCtrl, ['$scope', 'common', '$rootScope', '$location', 'SharedFunctionsCommonData', DefaultDashboardCtrl]);

function DefaultDashboardCtrl($scope, common, $rootScope, $location, SharedFunctionsCommonData) {
    $scope.title = 'DefaultDashboardCtrl';
    var getLogFn = common.logger.getLogFn;
    var log = getLogFn(controllerID);

    function Init() { }

    new Init();
}
