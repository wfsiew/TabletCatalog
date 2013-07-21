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

function ShoppingCartCtrl($scope, $dialog, DataService) {
  $scope.cart = DataService.cart;
  $scope.fileSystem;
  
  $scope.exportCart = function() {
	$scope.createDir('TabletCart');
  }
  
  $scope.init = function() {
    document.addEventListener("deviceready", $scope.onDeviceReady, true);
  }
  
  $scope.onDeviceReady = function() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $scope.onGetFSSuccess, $scope.fail);
  }
  
  $scope.onGetFSSuccess = function(fileSystem) {
    $scope.fileSystem = fileSystem;
  }
  
  $scope.fail = function(error) {
    alert('Error: ' + error.toString());
  }
  
  $scope.createDir = function(dir) {
	$scope.fileSystem.root.getDirectory(dir, 
	  {create: true, exclusive: false}, 
	  $scope.successCreateDir, $scope.fail);
  }
  
  $scope.successCreateDir = function(parent) {
	var file = 'cart_' + new Date().getTime() + '.csv';
	parent.getFile(file, {create: true, exclusive: false}, 
	  $scope.beginWrite, $scope.fail);
  }
  
  $scope.beginWrite = function(f) {
	f.createWriter(function(w) {
      w.onwrite = function() {
	    $scope.showMessage('Export complete');
	  }
      
      var s = $scope.cart.toCsv();
      w.write(s);
	});
  }
  
  $scope.showMessage = function(msg) {
	var title = 'Export Cart';
	var btns = [{result:'ok', label: 'OK', cssClass: 'btn-primary'}];

	$dialog.messageBox(title, msg, btns)
	  .open()
	  .then(function(result) {
	});
  }
  
  $scope.init();
}

ShoppingCartCtrl.$inject = ['$scope', '$dialog', 'DataService'];
