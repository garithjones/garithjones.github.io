angular.module('app').controller('MapBrowserCtrl', ['$scope', '$rootScope', '$location', '$state', '$q', 'common', 'SharedFunctionsCommonData', 'lodash', 'leafletData', 'leafletMapEvents', '$pouchDB', 'CONST_SIC', 'CONST_STRUCTURE', 'CONST_PROVINCE', 'CONST_ORDER', MapBrowserCtrl]);

function MapBrowserCtrl($scope, $rootScope, $location, $state, $q, common, SharedFunctionsCommonData, lodash, leafletData, leafletMapEvents, $pouchDB, CONST_SIC, CONST_STRUCTURE, CONST_PROVINCE, CONST_ORDER) {

    $scope.$state = $state;
    $scope.isBusyLoading;
    $scope.numTotal = 0;

    //This is the list of all records in the PouchDB - not the documents themselves
    var listOfAllRecords = [];
    //This is the list of all documents in the PouchDB
    var listOfAllDocuments = [];
    //The list of all Features
    var listOfAllFeatures = [];
    $scope.numCatchments = 0;
    //The list of all Services
    var Services = {};

    /*
    Way of working:
    1. Load All Documents
    2. Classify Documents
    3. Generate Stat Data + Build Relationships Between Catchments
    4. Add to Map
    */

    $scope.numAllCatchment = 0;

    var getLogFn = common.logger.getLogFn;
    var log = getLogFn('MapBrowserCtrl');

    var originatorEv;
    $scope.isOffline = true;
    $scope.map = {};
    $scope.selectedFeatureData = undefined;

    var geojson;

    $scope.defaults = {
        scrollWheelZoom: true,
        //tileLayer: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
        maxZoom: 14,
        path: {
            weight: 1,
            color: '#800000',
            opacity: 1
        }
    }

    $scope.center = {
        //-28.4440832,24.7934476,6
        lat: -28.4440832,
        lng: 24.7934476,
        zoom: 6
    };

    function InitMap() {
        leafletData.getMap().then(initMapSuccess, initMapFailure);

        function initMapSuccess(map) {
            console.log(map);
            console.log(map);

            $scope.map = map;
            //map.addControl(searchControl); //inizialize search control

            $scope.eventDetected = "No events yet...";
            var mapEvents = leafletMapEvents.getAvailableMapEvents();
            for (var k in mapEvents) {
                //console.log(mapEvents[k]);
                var eventName = 'leafletDirectiveMap.' + mapEvents[k];
                $scope.$on(eventName, function (event) {
                    $scope.eventDetected = event.name;
                });

                var eventNameGEOJSON = 'leafletDirectiveGeoJson.' + mapEvents[k];
                $scope.$on(eventName, function (event) {
                    $scope.eventDetected = event.name;
                });
            }

            map.addControl(new L.Control.Search({
                url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
                jsonpParam: 'json_callback',
                propertyName: 'display_name',
                propertyLoc: ['lat', 'lon'],
                circleLocation: false,
                markerLocation: false,
                autoType: false,
                autoCollapse: true,
                minLength: 2
            }));
        }

        function initMapFailure(data) { }
    }

    function LoadAllDocuments() {
        var arrayOfPromises = [];
        $pouchDB.GetAllDocs().then(getAllDocsSuccess, getAllDocsFailure);

        function getAllDocsSuccess(success) {
            console.log("test");
            console.log(success);
            listOfAllRecords = success.rows;

            var numTotal = listOfAllRecords.length;
            var numProcessed = 0;

            //console.log(listOfAllRecords);

            //listOfAllFeatures = data.rows;

            lodash.forEach(listOfAllRecords, function (n, key) {
                arrayOfPromises.push($pouchDB.Get(n.id).then(loadedDocumentSuccess, loadedDocumentFailure));
                numProcessed++;

                if (numProcessed === numTotal) {
                    new completedRequestingAllDocs();
                }
            });
        }

        function completedRequestingAllDocs() {
            console.log("Completed Requesting All The Docs");
            $q.all(arrayOfPromises).then(completedLoadingAllDocsSuccess, completedLoadingAllDocsFailure)
        }

        function loadedDocumentSuccess(success) {
            //console.log(success);
            listOfAllDocuments.push(success);
            //new GenerateStatData(catchmentDocument);
            //console.log(listOfAllCatchmentFeatures);
            //new UpdateMapFeatures($scope.map,catchmentDocument);

        }

        function loadedDocumentFailure(failure) { }

        function getAllDocsFailure(failure) { }

        function completedLoadingAllDocsSuccess(success) {
            console.log("Finished Loading All the Docs", listOfAllDocuments);
            $scope.isBusyLoading = false;

            //Now that we've loaded all the documents, we can classify them according to features and facilities
            new ClassifyDocuments();
        }

        function completedLoadingAllDocsFailure(failure) { }

        function completedAllDocs() {
            //console.log(listOfAllCatchment, listOfAllCatchmentDocuments);
            //var FeatureLayer = _.map(listOfAllCatchmentDocuments, 'features')
            //console.log(FeatureLayer);
        }
    }

    function ClassifyDocuments() {
        var numTotal = listOfAllDocuments.length;
        var numProcessed = 0;


        _.forEach(listOfAllDocuments, function (n, key) {
            //console.log(n);
            if (n.type === 'FeatureCollection') {
                listOfAllFeatures.push(_.first(n.features));
                $scope.numCatchments++;
            } else {
                console.log(n);
                if (n.type === "services") {
                    Services = n;
                    /*console.log("Something Else", listOfAllFacilities);
                    alert("Found a Service");
                    listOfAllFacilities.push(n);*/
                    console.log(Services);
                }
            }

            numProcessed++;
            if (numProcessed === numTotal) {
                new completedClassifyDocuments();
            }
        });

        function completedClassifyDocuments() {
            console.log("Completed Classifying the documents");
            new GenerateStatData();
        }
    }

    function GenerateStatData() {
        var numTotal = listOfAllFeatures.length;
        var numProcessed = 0;

        _.forEach(listOfAllFeatures, function (n, key) {
            new AddToMap(n);
            numProcessed++;
            //console.log(n);
            try {
                n.properties._censusPopulation = [];
                var Pop96 = {
                    label: 1996,
                    value: n.properties.Pop96
                };
                var Pop01 = {
                    label: 2001,
                    value: n.properties.Pop01
                };
                var Pop11 = {
                    label: 2011,
                    value: n.properties.Pop11
                };

                n.properties._censusPopulation.push(Pop96, Pop01, Pop11);

                n.properties._populationRadius = [];
                var pop_0_5 = {
                    rangeName: '0-5km',
                    rangeSeq: 1,
                    population: n.properties.POP_5km,
                    populationPercentage: n.properties.F5km_prop,
                };
                var pop_5_10 = {
                    rangeName: '5-10km',
                    rangeSeq: 1,
                    population: n.properties.pop_10km,
                    populationPercentage: n.properties.prop_5_10,
                };
                var pop_10_15 = {
                    rangeName: '10-15km',
                    rangeSeq: 2,
                    population: n.properties.pop_10_15,
                    populationPercentage: n.properties.Prop_10_15,

                };
                var pop_15_20 = {
                    rangeName: '15-20km',
                    rangeSeq: 3,
                    population: n.properties.pop_15_20,
                    populationPercentage: n.properties.Prop_15_20,

                };
                var pop_20_30 = {
                    rangeName: '20-30km',
                    rangeSeq: 4,
                    population: n.properties.pop_20_30,
                    populationPercentage: n.properties.Prop_20_30,

                };
                var pop_30_50 = {
                    rangeName: '30-50km',
                    rangeSeq: 5,
                    population: n.properties.Pop_30_50,
                    populationPercentage: n.properties.Prop_30_50,

                };
                var pop_50Plus = {
                    rangeName: 'greater than 50km',
                    rangeSeq: 6,
                    population: n.properties.Pop_50Plus,
                    populationPercentage: n.properties.Prop_50Plu,

                };

                n.properties._populationRadius.push(pop_0_5, pop_5_10, pop_10_15, pop_15_20, pop_20_30, pop_30_50, pop_50Plus);

                var cumulativePopulation = 0;
                _.forEach(n.properties._populationRadius, function (n, key) {
                    cumulativePopulation += n.population;
                    n.populationCumulative = cumulativePopulation;
                });

                n.properties._slope = [];

                var slopeV5 = {
                    name: 'Slope < 5',
                    area: n.properties.slpV5
                }
                var slopeV10 = {
                    name: 'Slope < 10',
                    area: n.properties.slpV10
                }
                var slopeV20 = {
                    name: 'Slope < 20',
                    area: n.properties.slpV20
                }
                var slopeV21 = {
                    name: 'Slope < 21',
                    area: n.properties.slpV21
                }
                var slopeVSum = {
                    name: 'Slope All',
                    area: n.properties.slpVSUM
                }

                /*slpV5: 1277948
                slpV10: 20440
                slpV20: 7337
                slpV21: 5597
                slpVSUM: 1311322*/

                n.properties._slope.push(slopeV5, slopeV10, slopeV20, slopeV21, slopeVSum);

                n.properties._gva = [];

                var High_Sec = {
                    secCode: n.properties.High_Sec,
                    sec: CONST_SIC[n.properties.High_Sec],
                    percentage: n.properties.High_Gva
                }

                var F2nd_Sec = {
                    secCode: n.properties.F2nd_Sec,
                    sec: CONST_SIC[n.properties.F2nd_Sec],
                    percentage: n.properties.F2nd_highGv
                }

                var F3rd_Sec = {
                    secCode: n.properties.F3rd_Sec,
                    sec: CONST_SIC[n.properties.F3rd_Sec],
                    percentage: n.properties.F3rd_highGv
                }

                var Other_Sec = {
                    secCode: 'Other',
                    sec: 'Other',
                    percentage: n.properties.Other_Gva
                }

                n.properties._gva.push(High_Sec, F2nd_Sec, F3rd_Sec, Other_Sec);

                //console.log(n);

                n.properties._structure = CONST_STRUCTURE[n.properties.STRUCTURE];
                n.properties._province = CONST_PROVINCE[n.properties.PR_MDB_C];
                n.properties._province = CONST_PROVINCE[n.properties.PR_MDB_C];
                n.properties._orderDescription = CONST_ORDER[n.properties.Order_];

                //We are going to use this array to hold the child catchments to be gathered during Build Connections
                n.properties._lowerOrderCatchments = [];
                n.properties._lowerOrderCloseCatchments = [];
            } catch (e) {
                console.log(n, e, JSON.stringify(n));

            }


            if (numProcessed === numTotal) {
                new buildConnections();
            }

        });

        function buildConnections() {
            var numTotal = listOfAllFeatures.length;
            var numProcessed = 0;
            console.log("Building Links");

            _.forEach(listOfAllFeatures, function (n, key) {
                //console.log(n);
                //console.log(n.properties.Uniq_2, n.properties.Close_ID, n.properties.HO_ID);

                /*var closeCatchment = _.find(listOfAllFeatures, function (o) {
                    return Number(n.Close_ID) === Number(o.Uniq_2) && Number(o.Close_ID) !== Number(o.Uniq_2);
                });
                console.log(closeCatchment);*/
                numProcessed++;

                try {
                    if (Number(n.properties.Close_ID) !== Number(n.properties.Uniq_2)) {
                        var closeCatchment = _.find(listOfAllFeatures, function (o) {
                            return Number(n.properties.Close_ID) === Number(o.properties.Uniq_2);
                        });

                        if (closeCatchment !== null && closeCatchment !== undefined) {
                            //console.log(n, closeCatchment);
                            closeCatchment.properties._lowerOrderCloseCatchments.push(n);
                        }
                    }

                    if (Number(n.properties.HO_ID) !== Number(n.properties.Uniq_2)) {
                        var higherOrderCatchment = _.find(listOfAllFeatures, function (o) {
                            return Number(n.properties.HO_ID) === Number(o.properties.Uniq_2);
                        });
                        if (higherOrderCatchment !== null && higherOrderCatchment !== undefined) {
                            //console.log(n, higherOrderCatchment);
                            higherOrderCatchment.properties._lowerOrderCatchments.push(n);
                        }
                    }
                } catch (e) {
                    console.log(e, n);
                }



                if (numProcessed === numTotal) {
                    new completedGenerateStatData();
                }

            });
        }

        function completedGenerateStatData() {
            console.log("Completed Stat Data");
            new AddToMap();
        }


        /*
        Pop01:31556.02
        Pop11:27187.42
        Pop96:29349.51
        PopDif96_1:-7.37
        */

        /*
        pop_10_15:375.83
        pop_10km:391.52
        pop_15_20:410.7
        pop_20_30:1853.78
        Pop_30_50:1030.06
        Pop_50Plus:38.41
        */
    }

    function AddToMap(feature) {
        //listOfAllFeatures
        geojson = L.geoJson(feature, {
            style: style/*{
                    "color": "#ff7800",
                    "weight": 5,
                    "opacity": 0.2,
                    "fill": true
                }*/,
            onEachFeature: onEachFeature
        }).addTo($scope.map);
    }

    /* function getColor(d) {
         return d === 1 ? '#800026' :
             d === 2 ? '#BD0026' :
                 d === 3 ? '#E31A1C' :
                     d === 4 ? '#FC4E2A' :
                         d === 5 ? '#FD8D3C' :
                             d === 6 ? '#FEB24C' :
                                 d === 7 ? '#FED976' :
                                     d === 8 ? '#FED976' :
                                         '#FFEDA0';
     } */

    //(a===b)? 'yes':'no';

    function getColor(d) {
        switch (d) {
            case 1:
                return '#9e9e9e';
            case 2:
                return '#ffe0b2';
            case 3:
                return '#ffcc80';
            case 4:
                return '#ffb74d';
            case 5:
                return '#ffa726';
            case 6:
                return '#ff9800';
            case 7:
                return '#fb8c00';
            case 8:
                return '#f57c00';
            case 9:
                return '#ef6c00';
            case 10:
                return '#e65100';
        };
    }

    function style(feature) {
        return {
            fillColor: getColor(feature.properties.Order_),
            weight: 0.5,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    function onEachFeature(feature, layer) {
        var label = L.marker(layer.getBounds().getCenter(), {
            icon: L.divIcon({
                className: 'label',
                html: feature.properties.NAME,
                iconSize: [100, 40]
            })
        });
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: clickFeature

        });

        /*
        console.log(feature, layer);
        layer.on('mouseover', function (e) {
            console.log(e);
            try {
                console.log(e.target);
                console.log(e.target.options);
                console.log(e.target.options.color);
                e.target.options.color = "green";

                e.target._options.style.fillOpacity = 0.65;
            } catch (ex) {
                console.log(ex);
            }
        });*/

        //bind click
        /*layer.on({
            //click: alert("YEAH"),
            mouseover: alert("YEAH - Mouse Over")
        });*/
    }

    $scope.ToggleOffline = function () {
        $scope.isOffline = !$scope.isOffline;
        if ($scope.isOffline === false) {
            //Start Replicating
            $pouchDB.StartReplicatingToLocal();
        } else {
            //Stop Replicating
            $pouchDB.StopReplicatingToLocal();
        }
    };


    function clickFeature(e) {
        console.log(e);
        console.log($scope.map);
        $scope.selectedFeatureData = e.target.feature;
        $scope.map.fitBounds(e.target.getBounds());
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 2,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
    }

    $scope.ShowDetails = function (featureData) {
        //console.log(featureData);
        $state.go('MapBrowser.CatchmentDetail');
    };

    $scope.ShowFacilityCalculator = function (featureData) {
        console.log(featureData);
        $state.go('MapBrowser.FacilityCalculator');
    };

    $scope.BackToMapBrowser = function () {
        $state.go('MapBrowser');
    };

    $scope.RefreshPage = function () {
        $state.reload();
    };

    function Init() {
        $scope.isBusyLoading = true;
        //alert("Loaded Catchment Browser");
        console.log($pouchDB);
        console.log($scope.map);
        new InitMap();

        $scope.isBusyLoading = false;
        new LoadAllDocuments();

        //new GetAllCatchmentDocuments();


        //console.log($pouchDB.GetAllDocs());

    }

    new Init();


    $scope.getFacilities = function (search) {
        return lodash.result(lodash.find(Services.services, function (obj) {
            return obj.minPopulation <= search.population && obj.maxPopulation >= search.population;
        }), 'facilities');
    };

}