'use strict';

/* Directives */
var directives = angular.module('gbDashboard.directives', []);

directives.directive('openDialog', function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attr, Controller) {
            var dialogId = '#' + attr.openDialog;
            elem.bind('click', function(e) {
                $(dialogId).modal('show');
            });
        }
    };
});
