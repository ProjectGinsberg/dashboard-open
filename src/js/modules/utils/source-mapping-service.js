// This augments the standard exception handler with one that understands
// source maps.
// Based on http://stackoverflow.com/questions/19420604/angularjs-stack-trace-ignoring-source-map
// FIXME: Share the cache -- why not?
angular.module('gb.utils').factory('SourceMappingService', ['$log', '$window', '$injector', function($log, $window, $injector) {
	'use strict';
	var cache = {};

	var getSourceMappedStackTrace = function(exception) {
		var $q = $injector.get('$q'),
			$http = $injector.get('$http'),
			SMConsumer = $window.sourceMap.SourceMapConsumer;

		if (!exception.stack) {
			return $q.when(exception.message + ' (no stacktrace)');
		}

		// Retrieve a SourceMap object for a minified script URL
		var getMapForScript = function(url) {
			if (cache[url]) {
				return cache[url];
			} else {
				var promise = $http.get(url).then(function(response) {
					var m = response.data.match(/\/\/# sourceMappingURL=(.+\.map)/);
					if (m) {
						var path = url.match(/^(.+)\/[^/]+$/);
						path = path && path[1];
						return $http.get(path + '/' + m[1]).then(function(response) {
							try {
								return new SMConsumer(response.data);
							} catch (err) {
								$log.error("Error fetching source map", err);
								$log.error(exception);
							}
							return $q.reject();
						});
					} else {
						return $q.reject();
					}
				});
				cache[url] = promise;
				return promise;
			}
		};

		return $q.all(_.map(exception.stack.split(/\n/), function(stackLine) {
			var match = stackLine.match(/^(.+)(http.+):(\d+):(\d+)/);
			if (match) {
				var prefix = match[1],
					url = match[2],
					line = match[3],
					col = match[4];
				return getMapForScript(url).then(function(map) {
					var pos = map.originalPositionFor({
						line: parseInt(line, 10),
						column: parseInt(col, 10)
					});
					var mangledName = prefix.match(/\s*(at)?\s*(.*?)\s*(\(|@)/);
					mangledName = (mangledName && mangledName[2]) || '';
					return '    at ' + (pos.name ? pos.name : mangledName) + ' ' +
						$window.location.origin + '/' + pos.source + ':' + pos.line + ':' +
						pos.column;
				}, function() {
					return stackLine;
				});
			} else {
				return $q.when(stackLine);
			}
		})).then(function(lines) {
			return lines.join('\n');
		});
	};

	var service = {};

	/**
	 * Print the exception to $log, using source maps to provide meaningful
	 * line numbers.
	 */
	service.printStacktrace = function(exception) {
		try {
			var env = $injector.get('Environment');
			if (env.isProduction) {
				$log.error(exception);
			} else {
				getSourceMappedStackTrace(exception).then($log.error);
			}
		} catch (err) {
			$log.error("Failed to map stacktrace", err);
			$log.error(exception);
		}
	};

	return service;
}]);
