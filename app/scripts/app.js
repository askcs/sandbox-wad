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
  'ApplicationWadl',
  [
    '$http', 'categories',
    function ($http, categories)
    {
      return {
        get: function (callback)
        {
          $http.get(
            'http://dev.ask-cs.com/application.wadl',
            {
              transformResponse: function (_data)
              {
                var xmlParser = new X2JS();
                _data = xmlParser.xml_str2json(_data);

                var paths = _data.application.resources.resource;

                var data = {
                  dictionary: {}
                };

                _.each(
                  paths,
                  function (node)
                  {
                    node.broken = node._path.split('/');

                    node.broken.shift();

                    node.proxy = node.broken[0];

                    if (! node.method.request.hasOwnProperty('param'))
                    {
                      node.method.request = {
                        param: []
                      };
                    }

                    if (! angular.isArray(node.method.request.param))
                    {
                      var tmp = [];

                      tmp.push(node.method.request.param);

                      node.method.request.param = tmp;
                    }

                    data.dictionary[node._path] = node;
                  }
                );

                console.log('data ->', data);

                var indexed = _.sortBy(paths, function (path) { return path.proxy });

                indexed = _.groupBy(indexed, 'proxy');

                // console.log('oaths ->', paths);


                //                var indexed = {};
                //
                //                _.each(
                //                  categories,
                //                  function (interfaces, category)
                //                  {
                //                    if (! indexed.hasOwnProperty(category)) { indexed[category] = [] }
                //
                //                    _.each(
                //                      paths,
                //                      function (proxies)
                //                      {
                //                        _.each(
                //                          proxies,
                //                          function (path)
                //                          {
                //
                //                            console.log('path ->', path);
                //
                //                            var index = interfaces.indexOf(path.proxy);
                //
                //                            if (index > -1)
                //                            {
                //                              indexed[category].push(path);
                //
                //                              paths.splice(index, 1);
                //                            }
                //                          }
                //                        )
                //                      }
                //                    )
                //                  }
                //                );
                //
                //                console.log('indexed ->', indexed);


                return {
                  all: paths,
                  indexed: indexed
                };
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
      $rootScope.init = (function ()
      {
        ApplicationWadl.get(
          function (paths)
          {
            $rootScope.paths = paths.indexed;

            // console.log('all ->', paths.all);
            $rootScope.setPath(Object.keys($rootScope.paths)[0]);
          }
        );
      })();

      $rootScope.q = '';

      $rootScope.$watch(
        'q',
        function (value)
        {
          if (value != '')
          {
            console.log('some value here ->');
            
//            ApplicationWadl.get(
//              function (paths)
//              {
//                console.log('paths ->', paths);
//
//                $rootScope.paths = paths.all;
//              }
//            );
          }
          else
          {
            // $rootScope.init();
          }
        }
      );

      $rootScope.setPath = function (path)
      {
        $rootScope.path = $rootScope.paths[path];
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