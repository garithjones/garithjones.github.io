var app = angular.module('app', ['ngAnimate', 'ngSanitize', 'ngResource', 'ngCookies', 'common', 'ui.router', 'angular-loading-bar', 'ngCsv', 'ngDialog', 'picardy.fontawesome', 'ngLodash', 'ui-leaflet', 'ngMaterial', 'pouchdb', 'ngLodash', 'nvd3', 'adf', 'adf.structures.base'])
app.run(['$pouchDB', function ($pouchDB) {
    console.log("App Running!");

    $pouchDB.InitDatabases();
    $pouchDB.StartReplicatingToLocal();
    $pouchDB.StartListening();


    //$pouchDB.setDatabase("csir");
    //$pouchDB.sync("https://imaidearserverroustasone:04dd108d58c8fe363773f1005d9f1889b09e9dbb@retrorabbitsupplychain.cloudant.com/csir");

    /*
    This is the code related to the Service Worker!
    */
    //Add code for the Service Worker?
    console.log(navigator);

    navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
    }).then(serviceWorkerRegistrationSuccess, serviceWorkerRegistrationFailure);

    function serviceWorkerRegistrationSuccess(success) {
        console.log('◕‿◕', success);
        var serviceWorker;
        console.log("Installing the Service Worker");

        if (success.installing) {
            serviceWorker = success.installing;
        } else if (success.waiting) {
            serviceWorker = success.waiting;
        } else if (success.active) {
            serviceWorker = success.active;
        }

        if (serviceWorker) {
            console.log(serviceWorker);
            console.log("ServiceWorker phase:", serviceWorker.state);

            serviceWorker.addEventListener('statechange', function (e) {
                console.log("ServiceWorker phase:", e.target.state);
            });
        }
    }

    function serviceWorkerRegistrationFailure(failure) {
        console.log('ಠ_ಠ', failure);
        console.log('ServiceWorker registration failed: ', failure);
    }

}]);
