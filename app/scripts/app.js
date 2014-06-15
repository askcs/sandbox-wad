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
    StandBy: ['calc_planning', 'divisions'],
    TeamUp: ['client', 'clients', 'team', 'teams']
  }
);

app.
  factory(
  'DataSource',
  [
    '$q', '$http', 'categories',
    function ($q, $http, categories)
    {
      return {
        get: function (callback)
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

              console.log('data ->', data);

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
    '$rootScope', 'DataSource',
    function ($rootScope, DataSource)
    {
      DataSource.get()
        .then(
        function (data)
        {
          $rootScope.data = data;

          $rootScope.paths = data.list;

          $rootScope.setProxy(Object.keys(data.proxies)[0]);
        }
      );

      $rootScope.q = '';

      $rootScope.$watch(
        'q',
        function (value)
        {
          if (value != '')
          {
            console.log('some value');
          }
          else
          {
            console.log('defaults');
          }
        }
      );

      $rootScope.setProxy = function (proxy)
      {
        if (proxy == 'all')
        {
          $rootScope.active = {
            proxy: 'all',
            paths: $rootScope.data.dictionary
          };
        }
        else
        {
          var paths = [];

          _.each(
            $rootScope.data.proxies[proxy],
            function (path)
            {
              paths.push($rootScope.data.dictionary[path]);
            }
          );

          $rootScope.active = {
            proxy: proxy,
            paths: paths
          };
        }
      };
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
      controller: function (categories)
      {
        this.Categories = categories;
      },
      link: function (scope, element, attrs, ctrl)
      {
        // sconsole.log('paths ->', ctrl.Categories);
      }
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
      link: function (scope) { scope.response = scope.data.representation._mediaType }
    }
  }
);