angular.module('myapp', ['myappServices', 'ui.bootstrap', 'ui.utils']).
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
      when('/cart/files', {
        templateUrl: 'partials/cart-files.html',
        controller: 'CartFilesCtrl'
      }).
      when('/cart/files/arc', {
        templateUrl: 'partials/cart-files.html',
        controller: 'CartFilesArcCtrl'
      }).
      otherwise({
        redirectTo: '/catalog'
      });
  }]);
