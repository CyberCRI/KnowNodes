'use strict';

/* Directives */

angular.module('KnowNodesApp.directives', [])
    .directive('navBarTop', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                'title': '@'
            },
            template:
                '<div class="navbar navbar-fixed-top">' +
                    '<div class="navbar-inner">' +
                    '<div class="container">' +
                    '<a class="brand" href="/">{{title}}</a>' +
                    '<div ng-transclude></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>',
            replace: true
        };
    })

    .directive('navLocation', function($location) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                'href': '@'
            },
            link: function (scope) {
                scope.location = function (href) {
                    return href.substr(1) === $location.url().substr(1);
                };
            },
            template: '<li ng-class="{active: location(href)}">' +
                '<a href="{{href}}" ng-transclude></a>' +
                '</li>',
            replace: true
        };
    })

    .directive('navLocationLogin', function($location, $rootScope) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                'href': '@'
            },
            link: function (scope) {
                scope.location = function (href) {
                    return href.substr(1) === $location.url().substr(1);
                };

                scope.isLoggedIn = function() {
                    return $rootScope.user;
                }

                scope.userDisplayName = function() {
                    return $rootScope.userDisplayName;
                }
            },
            template:
                '<li ng-class="{active: location(href)}">' +
                '<a ng-hide="isLoggedIn()" href="{{href}}" ng-transclude></a>' +
                '<div style="float: none; padding: 10px 15px 10px; color: #777; text-decoration: none; text-shadow: 0 1px 0 #fff; display:block" ng-show="isLoggedIn()">Hello {{userDisplayName()}}! ' +
                '<a tabindex="-1" href="/logout">Logout</a>' +
                '</div>' +
                '</li>',
            replace: true
        };
    })

    .directive('appVersion', ['version', function(version)
    {
        return function(scope, elm, attrs) {
          elm.text(version);
        };
    }])

    .directive('userAutoComplete', ['$http', function($http) {
        return function(scope, element, attrs) {
            element.userAutoComplete({
                minLength:3,
                source:function (request, response) {
                    $http.get('/api/users/' + request.term).success( function(data) {
                        response(data.results);
                    });
                },
                focus:function (event, ui) {
                    element.val(ui.item.label);
                    return false;
                },
                select:function (event, ui) {
                    scope.myModelId.selected = ui.item.value;
                    scope.$apply;
                    return false;
                },
                change:function (event, ui) {
                    if (ui.item === null) {
                        scope.myModelId.selected = null;
                    }
                }
            }).data("autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append("<a>" + item.label + "</a>")
                    .appendTo(ul);
            };
            };
    }]);
