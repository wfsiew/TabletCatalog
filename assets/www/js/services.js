'use strict';

angular.module('myappServices', []).
  factory('DataService', function() {
    var myCart = new cart('TabletCatalog');
  
    return {
      cart: myCart
    };
  });