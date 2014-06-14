'use strict';

/**
 * @ngdoc function
 * @name restApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the restApp
 */
angular.module('restApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
