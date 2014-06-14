'use strict';

var app = angular.module(
  'restApp', [
    'ngResource',
    'ngRoute'
  ]
);

app.
  factory(
  'ApplicationWadl',
  [
    '$http',
    function ($http)
    {
      return {
        get: function (callback)
        {
          $http.get(
            'http://dev.ask-cs.com/application.wadl',
            {
              transformResponse: function (data)
              {
                var xmlParser = new X2JS();
                data = xmlParser.xml_str2json(data);

                var _paths = data.application.resources.resource,
                    paths = {};

                angular.forEach(
                  _paths,
                  function (node)
                  {
                    node.broken = node._path.split('/');

                    node.broken.shift();

                    if (! paths.hasOwnProperty(node.broken[0]))
                    {
                      paths[node.broken[0]] = [];
                    }

                    paths[node.broken[0]].push(node);
                  }
                );

                return paths;
              }
            }
          ).success(
            function (data) { callback(data) }
          );
        }
      }
    }
  ]
);

app.run(
  [
    '$rootScope', 'ApplicationWadl',
    function ($rootScope, ApplicationWadl)
    {
      $rootScope.setPath = function (path)
      {
        $rootScope.path = $rootScope.paths[path];
      };

      ApplicationWadl.get(
        function (paths)
        {
          $rootScope.paths = paths;

          $rootScope.setPath($rootScope.paths[0]);
        }
      );
    }
  ]
);