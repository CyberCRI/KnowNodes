'use strict';

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
        var wikiBaseUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srprop=snippet&format=json&callback=JSON_CALLBACK&srsearch=';

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

                var deferred = $q.defer();
                $q.all([$http.get('/knownodes/:' + query + '/getNodesByKeyword'),
                        $http.jsonp(wikiBaseUrl + query)])
                    .then(function (results) {
                        var resources = handleResultsFromKnownodes(results[0]);
                        var wikipediaArticles = handleResultsFromWikipedia(results[1]);
                        deferred.resolve({resources: resources, wikipediaArticles: wikipediaArticles});
                    });
                // TODO Handle Errors
                return deferred.promise;

            }
        };
    }])

    .factory('resource', ['$http', '$q', 'wikipedia', function ($http, $q, wikipedia) {

        var getResourceWithWikipediaLinks = function (id) {
            return $http.get('/knownodes/' + id).then(addWikipediaLinks);
        }

        var addWikipediaLinks = function (result) {
            var resource = result.data.success;
            var deferred = $q.defer();
            wikipedia.getArticle(resource.title).then(function (article) {
                if (article != null) {
                    resource.wikipediaLinks = article.links;
                }
                deferred.resolve(resource);
            });
            return deferred.promise;
        }

        var getRelations = function (id) {
            return $http.get('/concepts/:' + id + '/getRelatedKnownodes');
        }

        function binarySearch(title, inputArray) {
            var low = 0,
                high = inputArray.length - 1,
                mid;

            while (low <= high) {
                mid = low + (high - low) / 2;
                if ((mid % 1) > 0) {
                    mid = Math.ceil(mid);
                }

                if (title < inputArray[mid]) {
                    high = mid - 1;
                }
                else if (title < inputArray[mid]) {
                    low = mid + 1;
                }
                else {
                    return mid;
                }
            }

            return null;
        }

        return {
            get: function (id) {
                var deferred = $q.defer();

                $q.all([getResourceWithWikipediaLinks(id),
                        getRelations(id)])
                    .then(function (results) {
                        var resource = results[0];
                        var relations = results[1].data.success;
                        resource.relations = relations;
                        deferred.resolve(resource);
                    });
                // TODO Handle Errors
                return deferred.promise;
            }
        }
    }])

    .factory('wikipedia', ['$http', '$q', function ($http, $q) {

        var baseUrl = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts|links&pllimit=500&format=json&redirects&callback=JSON_CALLBACK&titles=';

        var getFirstParagraph = function (extract) {
            var regex = /<p>.+<\/p>/;
            var split = regex.exec(extract);
            if (split == null || split.length == 0) return '';
            else return split[0];
        }

        return {
            getArticle: function (title) {
                var deferred = $q.defer();
                $http.jsonp(baseUrl + title)
                    .success(function (data) {
                        var article = data.query.pages[Object.keys(data.query.pages)[0]];
                        article.extract = getFirstParagraph(article.extract)
                        deferred.resolve(article);
                    })
                    .error(function (data, status, headers) {
                        // TODO explicit
                        deferred.resolve(null);
                    });
                return deferred.promise;
            }
        };
    }])
    .value('version', '0.2');
