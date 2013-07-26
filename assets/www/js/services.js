'use strict';

angular.module('myappServices', []).
  factory('DataService', function() {
    var myCart = new cart('TabletCatalog');
    var myOrder = new order();
  
    return {
      cart: myCart,
      order: myOrder
    };
  });