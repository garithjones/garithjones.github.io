angular.module('app').controller('CatchmentDetailCtrl', ['$scope', '$rootScope', '$location', '$state', 'common', 'SharedFunctionsCommonData', 'lodash', 'leafletData', 'leafletMapEvents', '$pouchDB', '_', CatchmentDetailCtrl]);

function CatchmentDetailCtrl($scope, $rootScope, $location, $state, common, SharedFunctionsCommonData, lodash, leafletData, leafletMapEvents, $pouchDB, _) {
    $scope.featureProperties = {};
    if ($scope.selectedFeatureData === null || $scope.selectedFeatureData === undefined) {
        $state.go('MapBrowser');
    } else {
        console.log($scope.selectedFeatureData.properties);

        $scope.featureProperties = $scope.selectedFeatureData.properties;
    }

    function InitPopulationCensusChart() {
        $scope.optionsPopulationCensus = {
            chart: {
                type: 'discreteBarChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value + (1e-10);
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.2f')(d);
                },
                duration: 500,
                xAxis: {
                    axisLabel: 'Years'
                },
                yAxis: {
                    axisLabel: 'Population',
                    axisLabelDistance: -10
                }
            }, title: {
                enable: true,
                text: "Population Census Data",
                className: 'h4'
            }
        };

        if ($scope.featureProperties !== null && $scope.featureProperties !== undefined) {
            if ($scope.featureProperties._censusPopulation !== null && $scope.featureProperties._censusPopulation !== undefined) {
                //$scope.dataPopulationCensus = featureProperties._censusPopulation;
                $scope.dataPopulationCensus = [];
                var keyValueObject = {
                    key: 'Population',
                    values: $scope.featureProperties._censusPopulation
                };
                $scope.dataPopulationCensus.push(keyValueObject);

                $scope.isPopulationCensusChartReady = true;
            }
        }


        console.log($scope.dataPopulationCensus);

        /*            console.log(test);

                    $scope.dataPopulationCensus = [];
                    $scope.dataPopulationCensus = [
                        {
                            key: "Cumulative Return",
                            values: [
                                {
                                    "label": "A",
                                    "value": -29.765957771107
                                    },
                                {
                                    "label": "B",
                                    "value": 0
                                    },
                                {
                                    "label": "C",
                                    "value": 32.807804682612
                                    },
                                {
                                    "label": "D",
                                    "value": 196.45946739256
                                    },
                                {
                                    "label": "E",
                                    "value": 0.19434030906893
                                    },
                                {
                                    "label": "F",
                                    "value": -98.079782601442
                                    },
                                {
                                    "label": "G",
                                    "value": -13.925743130903
                                    },
                                {
                                    "label": "H",
                                    "value": -5.1387322875705
                                    }
                                ]
                            }
                        ];*/
    }

    function InitPopulationRadiusChart() {
        $scope.optionsPopulationRadius = {
            chart: {
                type: 'pieChart',
                height: 450,
                donut: true,
                x: function (d) {
                    return d.rangeName;
                },
                y: function (d) {
                    return d.population;
                },
                showLabels: true,
                labelType: 'value',
                pie: {
                    startAngle: function (d) {
                        return d.startAngle / 2 - Math.PI / 2
                    },
                    endAngle: function (d) {
                        return d.endAngle / 2 - Math.PI / 2
                    }
                },
                duration: 500,
                legend: {
                    margin: {
                        top: 5,
                        right: 70,
                        bottom: 5,
                        left: 0
                    }
                }
            }, title: {
                enable: true,
                text: "Population Distance Data",
                className: 'h4'
            }

        };

        if ($scope.featureProperties !== null && $scope.featureProperties !== undefined) {
            if ($scope.featureProperties._populationRadius !== null && $scope.featureProperties._populationRadius !== undefined) {
                //$scope.dataPopulationCensus = featureProperties._censusPopulation;
                //$scope.dataPopulationRadius = [];
                /*                    var keyValueObject = {
                                        key: 'Population',
                                        values: $scope.featureProperties._populationRadius
                                    };*/
                console.log($scope.featureProperties._populationRadius);
                $scope.dataPopulationRadius = $scope.featureProperties._populationRadius;

                $scope.isPopulationRadiusChartReady = true;
            }
        }



    }

    function InitSlopeChart() {
        $scope.optionsSlope = {

            chart: {
                type: 'pieChart',
                x: function (d) {
                    return d.name;
                },
                y: function (d) {
                    return d.area;;
                },
                height: 500,
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }, title: {
                enable: true,
                text: "Slope",
                className: 'h4'
            }
        };

        //$scope.isPopulationSlopeChartReady = true;
        console.log($scope.featureProperties);
        if ($scope.featureProperties !== null && $scope.featureProperties !== undefined) {
            if ($scope.featureProperties._slope !== null && $scope.featureProperties._slope !== undefined) {
                console.log($scope.featureProperties._slope);
                $scope.dataSlope = $scope.featureProperties._slope;

                $scope.isSlopeChartReady = true;
            }
        }
    }

    function InitGVAChart() {
        $scope.optionsGVA = {

            chart: {
                type: 'pieChart',
                x: function (d) {
                    return d.secCode;
                },
                y: function (d) {
                    return d.percentage;;
                },
                height: 500,
                //showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                legend: {
                    rightAlign: true,

                    margin: {
                        top: 0,
                        right: 35,
                        bottom: 80,
                        left: 0
                    }
                }
            },
            title: {
                enable: true,
                text: "GVA",
                className: 'h4',
            }
        };

        //$scope.isPopulationSlopeChartReady = true;
        console.log($scope.featureProperties);
        if ($scope.featureProperties !== null && $scope.featureProperties !== undefined) {
            if ($scope.featureProperties._gva !== null && $scope.featureProperties._gva !== undefined) {
                console.log($scope.featureProperties._gva);
                $scope.dataGVA = $scope.featureProperties._gva;

                $scope.isGVAChartReady = true;
            }
        }
    }


    function Init() {
        $scope.isPopulationCensusChartReady = false;
        $scope.isPopulationRadiusChartReady = false;
        $scope.isSlopeChartReady = false;
        $scope.isGVAChartReady = false;


        new InitPopulationCensusChart();
        new InitPopulationRadiusChart();
        new InitSlopeChart();
        new InitGVAChart();
    }

    new Init();
}
