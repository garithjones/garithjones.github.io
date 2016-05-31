angular.module('app').factory('SharedFunctionsCommonData', ['$rootScope', '$resource', '$q', 'SharedFactory', function SharedFunctionsCommonData($rootScope, $resource, $q, SharedFactory) {
    console.log("Shared Functions: Common Data");

    var arrayOfVariables = [];

    var factory = {
        GetCompanyID: getCompanyID,
    };


    function getCompanyID(forceRefresh) {
        //if they specifiy a force refresh it will reload the data from the GET
        if (forceRefresh === null || forceRefresh === undefined) {
            forceRefresh = false;
        }

        var deferred = $q.defer();

        var fk_companyID = 0;

        //First check if it's not in RootScope, if it is, then don't do a lookup for it - else get it and set it
        if ($rootScope.fk_companyID === undefined || $rootScope.fk_companyID === null || $rootScope.fk_companyID <= 0 || forceRefresh === true) {
            var getCompanyParams = {
                fields: 'fk_companyID'
            };

            SharedFactory.Company().get(getCompanyParams, function (data) {
                $rootScope.fk_companyID = data.record[0].fk_companyID;
                console.log("rootscope company id:" + $rootScope.fk_companyID);
                deferred.resolve($rootScope.fk_companyID);
            }, function () {
                fk_companyID = 0;
                deferred.reject($rootScope.fk_companyID);
            });
        } else {
            deferred.resolve($rootScope.fk_companyID);
        }

        return deferred.promise;
    }



    return factory;

}]);