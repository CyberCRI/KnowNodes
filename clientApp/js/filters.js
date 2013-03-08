'use strict';

/* Filters */

angular.module('KnowNodesApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }])
  .filter('timeAgo', ['nowTime', function(now) {
    return function(input) {
      return moment(input).from(now());
    };
}]);