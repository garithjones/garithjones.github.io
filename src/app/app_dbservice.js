
angular.module('app').service('$pouchDB', ['$rootScope', '$q', 'pouchDB', 'common', dbService]);

function dbService($rootScope, $q, pouchDB, common) {
    var self = this;
    //var database;
    var changeListener;


    var localDB;
    var remoteDB;
    var syncHandler;

    self.InitDatabases = function () {
        localDB = new PouchDB("csir");
        remoteDB = new PouchDB('https://imaidearserverroustasone:04dd108d58c8fe363773f1005d9f1889b09e9dbb@retrorabbitsupplychain.cloudant.com/csir', {
            auth: {
                username: 'imaidearserverroustasone',
                password: '04dd108d58c8fe363773f1005d9f1889b09e9dbb'
            }
        });

        //self.StartListening();
    };

    /*self.SetDatabase = function (databaseName) {
        console.log(databaseName);
        database = new PouchDB(databaseName);
        console.log(database);
    };*/

    self.StartListening = function () {
        changeListener = remoteDB.changes({
            since: 'now', /* This is important because otherwise it lsts ALL changes since the beginning */
            live: true,
            include_docs: true /* When getting changes from the DB, our controller will do another check/download the document */
        }).on("change", function (change) {
            console.log(change);
            if (!change.deleted) {
                $rootScope.$broadcast("$pouchDB:change", change);
                console.log(change);
                common.logger.logSuccess('Remote DB Updated: Replicating', 'Test', null, true);
                //self.ReplicateToLocal();
            } else {
                $rootScope.$broadcast("$pouchDB:delete", change);
            }
        });
    };

    self.StopListening = function () {
        changeListener.cancel();
    };

    /*self.Sync = function (remoteDatabase) {
        database.sync(remoteDatabase, {
            live: true,
            retry: true
        });
    };*/
    self.StopReplicatingToLocal = function () {
        if (syncHandler !== null && syncHandler !== undefined) {
            syncHandler.cancel();
        }
    }


    self.StartReplicatingToLocal = function () {
        syncHandler = remoteDB.replicate.to(localDB, {
            live: true,
            retry: true
        }).on('change', function (change) {
            // yo, something changed!
            console.log('Local DB Updated: Replication Completed');
            common.logger.logSuccess('Local DB Updated: Replication Completed', null, null, true);
        }).on('paused', function (info) {
            // replication was paused, usually because of a lost connection
            common.logger.logWarning('Local DB Updated: Replication Paused', null, null, true);
        }).on('active', function (info) {
            // replication was resumed
            common.logger.logSuccess('Local DB Updated: Replication Active', null, null, true);
        }).on('error', function (err) {
            // totally unhandled error (shouldn't happen)
            common.logger.logError('Local DB Updated: Replication ERROR', null, null, true);
        });

        syncHandler.on('complete', function (info) {
            // replication was canceled!
            common.logger.logWarning('Local DB Updated: Replication Stopped', null, null, true);

        });

        /*try {
            remoteDB.replicate.to(localDB, {
                live: true,
                retry: true
            }).on('complete', function () {
                // yay, we're done!
                console.log('Local DB Updated: Replication Completed');
                common.logger.logSuccess('Local DB Updated: Replication Completed', null, null, true);
            }).on('error', function (err) {
                // boo, something went wrong!
                console.log('Local DB NOT Updated: Replication ERROR');
                common.logger.logWarning('Local DB Not Updated: Replication Delayed', err, null, true);
            });
        } catch (e) {
            common.logger.logError('Local DB Not Updated: Replication Error', err, null, true);
        }*/
    };

    /*self.Save = function (jsonDocument) {
        var deferred = $q.defer();
        if (!jsonDocument._id) {
            database.post(jsonDocument).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error);
            });
        } else {
            database.put(jsonDocument).then(function (response) {
                deferred.resolve(response);
            }).catch(function (error) {
                deferred.reject(error);
            });
        }
        return deferred.promise;
    };

    self.Delete = function (documentId, documentRevision) {
        return database.remove(documentId, documentRevision);
    };*/

    self.Get = function (documentId) {
        return localDB.get(documentId);
    };

    self.GetAllDocs = function () {
        console.log("DB Service: Get All Docs");
        return localDB.allDocs();
    };

    self.Destroy = function () {
        localDB.destroy();
    };
}
