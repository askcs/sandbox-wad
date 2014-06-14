'use strict';

/**
 * @ngdoc function
 * @name restApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the restApp
 */
angular.module('restApp')
  .controller('internController', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
