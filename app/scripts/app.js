'use strict';

/**
 * @ngdoc overview
 * @name restApp
 * @description
 * # restApp
 *
 * Main module of the application.
 */
angular
  .module('restApp', [
    'ngResource',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'mainController'
      })
      .when('/intern', {
        templateUrl: 'views/intern.html',
        controller: 'internController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
