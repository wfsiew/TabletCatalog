angular.module('myapp', ['myappServices', 'ui.bootstrap']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/catalog', {
        templateUrl: 'partials/category-list.html',
        controller: 'CategoryListCtrl'
      }).
      when('/catalog/:catId', {
        templateUrl: 'partials/product-list.html',
        controller: 'ProductListCtrl'
      }).
      when('/cart', {
        templateUrl: 'partials/shopping-cart.html',
        controller: 'ShoppingCartCtrl'
      }).
      otherwise({
        redirectTo: '/catalog'
      });
  }]);
