(function () {
    'use strict';
    angular.module('app').factory('SharedFactory', ['$resource', '$q', 'DSP_REQUEST_URL_QUERY', SharedFactory]);

    function SharedFactory($resource, $q, DSP_REQUEST_URL_QUERY) {
        console.log("Shared Factory");

        var factory = {
            ConfigGrid: ConfigGridInternal
        };

        function ConfigGridInternal() {
            console.log("In Factory!");
            return $resource(DSP_REQUEST_URL_QUERY + 'tblconfiggrid', {
                fields: '@fields',
                filter: '@filter',
                order: '@order',
                limit: '@limit',
                offset: '@offset'
            }, {
                    query: {
                        method: 'GET',
                        isArray: false
                    },
                    update: {
                        method: 'PUT'
                    },
                    create: {
                        method: 'POST'
                    },
                    delete: {
                        method: 'DELETE'
                    }
                });
        }



        return factory;



    };

})();
