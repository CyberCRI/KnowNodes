'use strict';

/* Directives */

angular.module('KnowNodesApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).directive('userAutoComplete', ['$http', function($http) {
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
