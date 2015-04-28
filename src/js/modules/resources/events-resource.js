/**
 * {
 * 	"id": 123,
 * 	"timestamp": "Wed Jul 02 2014 00:00:00 GMT+0100 (BST)",
 * 	"entry": "This is the text of the event",
 * 	"source": "Ginsberg",
 * 	"tags": ["foo", "bar"]
 * }
 * EXPERIMENTAL: This resource unescapes &lt; and &gt; from the backend. I think
 * that's probably okay.
 */
angular.module('gb.resources')
	.factory('Events', ['$resource', '$log',
		function($resource, $log) {
			'use strict';

			var unescapeOne = function(evt) {
				// FIXME: Timestamp muning probably isn't necessary
				if (angular.isDefined(evt.timestamp))
					evt.timestamp = moment(evt.timestamp).local().startOf("day").toDate();
				if (angular.isDefined(evt.entry))
					evt.entry = evt.entry.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
				return evt;
			};

			var unescapeAll = function(evts) {
				return _.map(evts, unescapeOne);
			};

			var resource = $resource('/data/o/events/:id', {id: '@id'},
			{
				get: {
					method: 'GET',
					isArray: false,
					transformResponse: function(body) {
						if (!body) return body;
						return unescapeOne(angular.fromJson(body));
					}
				},
				query: {
					method: 'GET',
					isArray: true,
					transformResponse: function(body) {
						if (!body) return body;
						return unescapeAll(angular.fromJson(body));
					}
				},
			});

			// Extract the tags from the provided text. Note that tags DO NOT
			// include the leading hash symbol.
			// NB The server does deduplication, so that's not necessary
			resource.extractTags = function(text) {
				return _.map(text.match(/[#]+[A-Za-z0-9-_:!?]+/g), function(tag) { return tag.replace('#','');});
			};

			return resource;
		}
	]);
