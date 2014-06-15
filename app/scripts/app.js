'use strict';

var app = angular.module(
  'restApp', [
    'ngResource',
    'ngRoute'
  ]
);

app.
  constant(
  'categories',
  {
    StandBy: [
      'askatars',
      'calc_planning',
      'calendar',
      'divisions',
      'capcodes',
      'groups',
      'network',
      'node',
      'p2000',
      'p2000guard',
      'slots'
    ],
    TeamUp: [
      'avatar',
      'client',
      'clients',
      'team',
      'teams',
      'clientGroup',
      'tasks'
    ],
    AskFast: [
      'askfast',
      'channels'
    ]
  }
);

app
  .config(
  [
    '$locationProvider', '$routeProvider',
    function ($locationProvider, $routeProvider)
    {
      $routeProvider
        .when(
        '/guide',
        {
          templateUrl: 'views/guide.html',
          controller: 'guideController',
          resolve: {
            data: [
              'DataSource',
              function (DataSource)
              {
                return DataSource.get();
              }
            ]
          }
        })
        .otherwise(
        {
          redirectTo: '/guide'
        });
    }
  ]
);

app.
  factory(
  'DataSource',
  [
    '$q', '$http',
    function ($q, $http)
    {
      return {
        get: function ()
        {
          var deferred = $q.defer();

          $http.get(
            'http://dev.ask-cs.com/application.wadl',
            {
              transformResponse: function (rawXML)
              {
                var xmlParser = new X2JS();
                rawXML = xmlParser.xml_str2json(rawXML);

                return rawXML.application.resources.resource;
              }
            }
          ).success(
            function (paths)
            {
              var data = {
                dictionary: {},
                proxies: {}
              };

              _.each(
                paths,
                function (path)
                {
                  path.broken = path._path.split('/');

                  path.broken.shift();

                  path.proxy = path.broken[0];

                  if (! path.method.request.hasOwnProperty('param'))
                  {
                    path.method.request = {
                      param: []
                    };
                  }

                  if (! angular.isArray(path.method.request.param))
                  {
                    var tmp = [];

                    tmp.push(path.method.request.param);

                    path.method.request.param = tmp;
                  }
                }
              );

              paths = _.sortBy(paths, function (path) { return path.proxy });

              _.each(
                paths,
                function (path)
                {
                  var key = path._path + '-' + path.method._name;

                  data.dictionary[key] = path;

                  if (! data.proxies[path.proxy])
                  {
                    data.proxies[path.proxy] = [];
                  }

                  data.proxies[path.proxy].push(key);
                }
              );

              deferred.resolve(data);
            }
          );

          return deferred.promise;
        }
      }
    }
  ]
);

app.run(
  [
    '$rootScope',
    function ($rootScope)
    {
      // $rootScope.query = '';

      $rootScope.setSearchFocus = function () { $rootScope.$broadcast('showAll') };

      $rootScope.$on(
        '$routeChangeStart',
        function () {}
      );

      $rootScope.$on(
        '$routeChangeSuccess',
        function () {}
      );

      $rootScope.$on(
        '$routeChangeError',
        function (event, current, previous, rejection) {}
      );
    }
  ]
);

app.controller(
  'guideController',
  [
    '$rootScope', '$scope', 'data',
    function ($rootScope, $scope, data)
    {
      $scope.data = data;

      function showAll ()
      {
        $scope.active = {
          proxy: 'all',
          paths: $scope.data.dictionary
        };
      }

      $rootScope.$on(
        'showAll',
        function () { showAll() }
      );

      $scope.setProxy = function (proxy)
      {
        angular.element(window).scrollTop(0);

        if (proxy == 'all')
        {
          showAll();

          return true;
        }

        var paths = [];

        _.each(
          $scope.data.proxies[proxy],
          function (path)
          {
            paths.push($scope.data.dictionary[path]);
          }
        );

        $scope.active = {
          proxy: proxy,
          paths: paths
        };
      };

      // Select the first one
      // $scope.setProxy(Object.keys(data.proxies)[0]);

      showAll();
    }
  ]
);

app.directive(
  'method',
  function ()
  {
    return {
      restrict: 'E',
      transclude: true,
      template: '<span class="label label-{{type}} pull-right">{{name}}</span>',
      scope: {
        name: '='
      },
      link: function (scope)
      {
        switch (scope.name)
        {
          case 'GET':
            scope.type = 'success';
            break;
          case 'POST':
            scope.type = 'info';
            break;
          case 'PUT':
            scope.type = 'warning';
            break;
          case 'DELETE':
            scope.type = 'danger';
            break;
        }
      }
    }
  }
);

app.directive(
  'sideBar',
  function ()
  {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'views/sidebar.html',
      require: 'sideBar',
      controller: function ($scope, categories)
      {
        var proxies = [],
            indexed = {};

        _.each(
          $scope.data.proxies,
          function (list, proxy) { proxies.push(proxy) }
        );

        _.each(
          categories,
          function (interfaces, category)
          {
            indexed[category] = _.intersection(proxies, interfaces);

            proxies = _.difference(proxies, indexed[category]);
          }
        );

        indexed['General'] = proxies;

        $scope.indexed = indexed;
      },
      link: function (scope, element, attrs, ctrl) {}
    }
  }
);

app.directive(
  'request',
  function ()
  {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'views/request.html',
      scope: {
        data: '='
      },
      link: function (scope) { scope._params = _.groupBy(scope.data.param, '_type') }
    }
  }
);

app.directive(
  'response',
  function ()
  {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'views/response.html',
      scope: {
        data: '='
      },
      link: function (scope)
      {
        scope.response = scope.data.representation._mediaType;

        scope.state = (/java/.test(scope.response)) ? 'danger' : 'info';
      }
    }
  }
);