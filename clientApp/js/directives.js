'use strict';

angular.module('KnowNodesApp.directives', [])

    .directive('subtitle', function () {
        return {
            restrict: "A",
            templateUrl: 'partials/directiveTemplates/subtitle',
            replace: true
        };
    })

    .directive('tripletList', function () {
        return {
            restrict: "A",
            templateUrl: 'partials/directiveTemplates/tripletList',
            replace: true
        };
    })

    .directive('infoLine', function () {
        return {
            restrict: "A",
            templateUrl: 'partials/directiveTemplates/infoLine',
            replace: true
        };
    })
    .directive('concept', function () {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/concept',
            replace: true
        };
    })

    .directive('inputNode', function () {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/inputNode',
            replace: true
        };
    })

    .directive('connectionInput', function () {
        return {
            restrict: 'A',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/connectionInput',
            replace: true
        };
    })

    .directive('formatSelector', function () {
        return {
            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope) {
                        scope.resourceFormats = [
                            'Text',
                            'URL',
                            'File'];
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        $(function () {
                            $('#createResourceTabs_' + iAttrs.direction + ' a:first').tab('show');
                        });
                    }
                };
            },
            restrict: 'EAC',
            scope: {
                resourceDirection: '@direction'
            },
            templateUrl: 'partials/directiveTemplates/formatSelector',
            replace: true
        };
    })

    .directive('resourceTypeSelector', function () {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/resource/resourceTypeSelector',
            replace: true
        };
    })

    .directive('knowledgeDomainSelector', function () {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/knowledgeDomainSelector',
            replace: true
        };
    })

    .directive('startResource', function () {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/startResource',
            replace: true
        };
    })

    .directive('fullNode', function () {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/fullNode',
            replace: true
        };
    })

    .directive('endResource', function () {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/endResource',
            replace: true
        };
    })

    .directive('targetArticle', function () {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/targetArticle',
            replace: true
        };
    })

    .directive('connection', function () {
        return {
            restrict: 'A',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/connection',
            replace: true,
            controller: ConnectionCtrl
        };
    })

    .directive('navBarTop', function () {
        return {
            restrict: 'AC',
            transclude: true,
            scope: {
                'title': '@title'
            },
            templateUrl: 'partials/directiveTemplates/navBarTop',
            replace: true
        };
    })

    .directive('navLocation', function ($location) {
        return {
            restrict: 'AC',
            transclude: true,
            scope: {
                'href': '@'
            },
            link: function (scope) {
                scope.location = function (href) {
                    return href.substr(1) === $location.url().substr(1);
                };
            },
            templateUrl: 'partials/directiveTemplates/navLocation',
            replace: true
        };
    })

    .directive('topBarLogin', function ($location, $rootScope) {
        return {
            restrict: 'AC',
            transclude: true,
            scope: {
                'href': '@'
            },
            link: function (scope) {
                scope.location = function (href) {
                    return href.substr(1) === $location.url().substr(1);
                };

                scope.isLoggedIn = function () {
                    return $rootScope.user;
                };

                scope.userDisplayName = function () {
                    return $rootScope.userDisplayName;
                };
                scope.userKN_ID = function () {
                    if (!$rootScope.user) {
                        return ""
                    }
                    else {
                        return $rootScope.user.KN_ID;
                    }
                };
            },
            templateUrl: 'partials/directiveTemplates/topBarLogin',
            replace: true
        };
    })

    .directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])

    .directive('commentSection', ['$http', function ($http) {
        return {
            restrict: 'EAC',
            scope: {
                'knownodeId': '='
            },
            templateUrl: 'partials/directiveTemplates/commentList',
            link: function (scope, iElement, iAttrs, controller) {

            },
            replace: true
        };
    }])

    .directive('chat', ['$http', function ($http) {
        return {
            restrict: 'EAC',
            templateUrl: 'partials/directiveTemplates/chat',
            controller: ChatCtrl,
            replace: true
        };
    }])

    .directive('ngFocus', function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                scope.$watch(attrs.ngFocus, function (val) {
                    if (angular.isDefined(val) && val) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                }, true);

                element.bind('blur', function () {
                    if (angular.isDefined(attrs.ngFocusLost)) {
                        scope.$apply(attrs.ngFocusLost);

                    }
                });
            }
        };
    })

    .directive('userAutoComplete', ['$http', function ($http) {
        return function (scope, element, attrs) {
            element.userAutoComplete({
                minLength: 3,
                source: function (request, response) {
                    $http.get('/api/users/' + request.term).success(function (data) {
                        response(data.results);
                    });
                },
                focus: function (event, ui) {
                    element.val(ui.item.label);
                    return false;
                },
                select: function (event, ui) {
                    scope.myModelId.selected = ui.item.value;
                    scope.$apply;
                    return false;
                },
                change: function (event, ui) {
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
    }])

    .directive('tripletInput', ['$http', function ($http) {
        return {
            restrict: 'A',
            templateUrl: 'partials/directiveTemplates/tripletInput',
            controller: TripletInputCtrl,
            replace: true
        };
    }])

    .directive('resourceInput', function () {
        return {
            restrict: 'A',
            templateUrl: 'partials/directiveTemplates/resourceInput',
            controller: ResourceInputCtrl,
            scope: true,
            link: function ($scope, $element, $attrs) {
                $scope.resourceName = $attrs.resource;
                if ($scope.resourceName != null) {
                    $scope.$watch($scope.resourceName, function(newValue) {
                        $scope.resource = newValue;
                    });
                }
            },
            replace: true
        };
    })

    .directive('vote', function () {
        return {
            restrict: 'AC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/vote',
            replace: true,
            controller: VoteCtrl
        };
    })

    .directive('autoGrow', function() {
        return function(scope, element, attr){
            var minHeight = element[0].offsetHeight,
                paddingLeft = element.css('paddingLeft'),
                paddingRight = element.css('paddingRight');

            var $shadow = angular.element('<div></div>').css({
                position: 'absolute',
                top: -10000,
                left: -10000,
                width: element[0].offsetWidth - parseInt(paddingLeft || 0) - parseInt(paddingRight || 0),
                fontSize: element.css('fontSize'),
                fontFamily: element.css('fontFamily'),
                lineHeight: element.css('lineHeight'),
                resize:     'none'
            });
            angular.element(document.body).append($shadow);

            var update = function() {
                var times = function(string, number) {
                    for (var i = 0, r = ''; i < number; i++) {
                        r += string;
                    }
                    return r;
                }

                var val = element.val().replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/&/g, '&amp;')
                    .replace(/\n$/, '<br/>&nbsp;')
                    .replace(/\n/g, '<br/>')
                    .replace(/\s{2,}/g, function(space) { return times('&nbsp;', space.length - 1) + ' ' });
                $shadow.html(val);

                element.css('height', Math.max($shadow[0].offsetHeight + 10 /* the "threshold" */, minHeight) + 'px');
            }

            element.bind('keyup keydown keypress change', update);

            //update();
        }
    })
    .directive('searchBox', ['$http', function ($http) {
        return {
            restrict: 'EA',
            template: '<input ui-select2="searchBoxOptions" ng-model="selectedResult" data-placeholder="Find or create a resource..." multiple type="hidden" />',
            scope: {},
            controller: SearchBoxCtrl,
            replace: true,
            link: function (scope, element) {
                scope.clear = function () {
                    element.select2('val', '');
                };
            }
        };
    }]);
