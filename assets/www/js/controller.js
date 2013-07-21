function CategoryListCtrl($scope, $http, DataService) {
  $scope.cart = DataService.cart;
  
  $http.get('categories/categories.json').success(function(data) {
    $scope.categories = data;
    $scope.orderProp = 'name';
  });
}

CategoryListCtrl.$inject = ['$scope', '$http', 'DataService'];

function ProductListCtrl($scope, $routeParams, $http, $filter, $dialog, DataService) {
  $scope.cart = DataService.cart;
  
  $http.get('categories/products.' + $routeParams.catId + '.json').success(function(data) {
    $scope.products = data;
    $scope.catId = $routeParams.catId;
    $scope.number = /^\d+$/;
  });
  
  $scope.addToCart = function(product) {
    if (product.selecteduom == null) {
      $scope.showMessage('Please select UOM');
      return;
    }
    
    var quantity = product.quantity * 1;
    
    if (isNaN(quantity)) {
      $scope.showMessage('Please enter numeric value for Quantity');
      return;
    }
    
    $scope.cart.addItem(product.sku, product.name, product.price, quantity, product.selecteduom, $routeParams.catId);
  }
  
  $scope.removeFromCart = function(product) {
    var uomlist = product.uom;
    for (var i = 0; i < uomlist.length; i++) {
      $scope.cart.addItem(product.sku, product.name, product.price, -10000, uomlist[i], $routeParams.catId);
    }
  }
  
  $scope.showMessage = function(msg) {
    var title = 'Add To Cart';
    var btns = [{result:'ok', label: 'OK', cssClass: 'btn-primary'}];

    $dialog.messageBox(title, msg, btns)
      .open()
      .then(function(result) {
    });
  }
  
  $scope.selected = function() {
    return $filter('filter')($scope.products, {selected: true});
  }
  
  $scope.process = function() {
    var list = $scope.selected();
  }
  
  $scope.disable = function() {
    var list = $scope.selected();
    if (list == null)
      return true;
      
    return list.length > 0 ? false : true;
  }
}

ProductListCtrl.$inject = ['$scope', '$routeParams', '$http', '$filter', '$dialog', 'DataService'];

function ShoppingCartCtrl($scope, DataService) {
  $scope.cart = DataService.cart;
  
  
}

ShoppingCartCtrl.$inject = ['$scope', 'DataService'];
