angular.module('gb.auth')
	.factory('AuthInterceptor', ['$injector', '$log', '$rootScope', '$q', 'AUTH_EVENTS', 'HttpBuffer',
		function($injector, $log, $rootScope, $q, AUTH_EVENTS, HttpBuffer) {
			return {
				responseError: function(rejection) {
					// If the route has a truthy 'allowAnonymous' field on it
					// then we don't invoice the usual auth event nonsense
					var $route = $injector.get('$route');
					if ($route.current.$$route.allowAnonymous) {
						$log.log("Anonymous access okay");
						return $q.reject(rejection);
					}
					if (rejection.config && rejection.config.ignoreAuthModule) {
						$log.log("Ignoring auth interceptor due to request hint");
						return $q.reject(rejection);
					}
					switch (rejection.status) {
						case 0: // Needed for IE10
						case 401:
							var deferred = $q.defer();
							HttpBuffer.append(rejection.config, deferred);
							$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, rejection);
							return deferred.promise;
						case 403:
							$rootScope.$broadcast(AUTH_EVENTS.notAuthorized, rejection);
							break;
						// TODO: More status codes?
					}
					// Fall through to default behaviour
					return $q.reject(rejection);
				}
			};
		}
	]);
