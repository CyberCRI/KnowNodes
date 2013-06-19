'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('KnowNodesApp.services', [])
    .factory('userService', function ($rootScope) {
        var serviceReturned = {};

        serviceReturned.isUserLoggedIn = function () {
            return $rootScope.user ? true : false;
        };

        serviceReturned.getConnectedUser = function () {
            if ($rootScope.user) {
                $rootScope.user.displayName = serviceReturned.getUserDisplayName();
            }
            return $rootScope.user;
        };

        serviceReturned.getUserDisplayName = function () {
            if ($rootScope.user) {
                return $rootScope.user.firstName + " " + $rootScope.user.lastName;
            }
            return '';
        };

        return serviceReturned;
    })
    .factory('PassKnownode', function () {
        var currentEdge;
        var PassKnownodeService = {};
        PassKnownodeService.changeCurrent = function (data) {
            currentEdge = data;
        };
        PassKnownodeService.showCurrent = function () {
            return currentEdge;

        };
        return PassKnownodeService;
    })
    .factory('broadcastService', function ($rootScope) {
        var serviceReturned = {};

        serviceReturned.message = '';

        serviceReturned.prepForBroadcast = function (msg) {
            this.message = msg;
            this.broadcastItem();
        };

        serviceReturned.broadcastItem = function () {
            $rootScope.$broadcast('handleBroadcast');
        };

        return serviceReturned;
    })
    .factory('nowTime', ['$timeout', function ($timeout) {
        var nowTime;
        (function updateTime() {
            nowTime = Date.now();
            $timeout(updateTime, 1000);
        }());
        return function () {
            return nowTime;
        };
    }])

    .factory('hybridSearch', ['$http', '$q', function ($http, $q) {

        var wikiBaseUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srprop=&callback=JSON_CALLBACK&srsearch=';

        return {
            search: function (query) {

                var handleResultsFromKnownodes = function (result) {
                    return result.data.success;
                };

                var handleResultsFromWikipedia = function (result) {
                    if (result.data.query != null)
                        return result.data.query.search;
                    else return {};
                };

                console.log('Searching KnowNodes And Wikipedia...');
                var deferred = $q.defer();
                $q.all([$http.get('/knownodes/:' + query + '/getNodesByKeyword'),
                        $http.jsonp(wikiBaseUrl + query)])
                    .then(function (results) {
                        var nodes = handleResultsFromKnownodes(results[0]);
                        var articles = handleResultsFromWikipedia(results[1]);
                        deferred.resolve({nodes: nodes, articles: articles});
                    });
                // TODO Handle Errors
                return deferred.promise;

            }
        };
    }])
    .factory('PassKnownodeToGraph', function () {
        var currentCentralKnownode;
        var currentRelatedKnownodes;

        var PassKnownodeToGraphService = {};
        PassKnownodeToGraphService.setCentralNode = function (data) {
            currentCentralKnownode = data;
        };
        PassKnownodeToGraphService.setRelatedNodes = function (data) {
            currentRelatedKnownodes = data;
        };

        PassKnownodeToGraphService.getCentralNode = function () {
            return currentCentralKnownode;
        };
        PassKnownodeToGraphService.getRelatedNodes = function () {
            return currentRelatedKnownodes;
        };
        return PassKnownodeToGraphService;
    })
    .value('version', '0.2');
