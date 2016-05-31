angular.module('app').controller('FacilityCalculatorCtrl', ['$scope', '$rootScope', '$location', '$state', 'common', 'SharedFunctionsCommonData', '_', FacilityCalculatorCtrl]);

function FacilityCalculatorCtrl($scope, $rootScope, $location, $state, common, SharedFunctionsCommonData, _) {
    $scope.search = {
        population: $scope.selectedFeatureData === undefined ? 0 : $scope.selectedFeatureData.properties.Pop11
    };

    $scope.Facilities = undefined;

    $scope.DoCalculations = function () {
        if ($scope.Facilities !== null && $scope.Facilities !== undefined) {
            _.forEach($scope.Facilities, function (n, key) {
                n.calculatedFacilities = _.round(($scope.search.population / n.calculation_population) * n.calculation_units, 1);
                if (isNaN(n.calculatedFacilities)) {
                    n.calculatedFacilities = 1;
                }
            });
        }
    }

    $scope.DoSearch = function () {
        $scope.Facilities = getFacilities();
        $scope.DoCalculations();
    };

    function getFacilities() {
        return $scope.getFacilities($scope.search);
    }
}
