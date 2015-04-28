// Lifted from http://victorblog.com/2014/01/12/fixing-autocomplete-autofill-on-angularjs-form-submit/
angular.module('gb.utils')
.directive('autofillFix', ['$timeout', function ($timeout) {
  return function (scope, element, attrs) {
    element.prop('method', 'post');
    if (attrs.ngSubmit) {
      $timeout(function () {
        element
          .unbind('submit')
          .bind('submit', function (event) {
            event.preventDefault();
            element
              .find('input, textarea, select')
              .trigger('input')
              .trigger('change')
              .trigger('keydown');
            scope.$apply(attrs.ngSubmit);
          });
      });
    }
  };
}]);
