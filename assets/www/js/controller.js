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
	$scope.createDir('TabletInvoice');
  }
  
  $scope.init = function() {
    document.addEventListener("deviceready", $scope.onDeviceReady, true);
  }
  
  $scope.onDeviceReady = function() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $scope.successGetFS, $scope.fail);
  }
  
  $scope.successGetFS = function(fileSystem) {
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
	var file = 'invoice_' + new Date().getTime() + '.csv';
	parent.getFile(file, {create: true, exclusive: false}, 
	  $scope.beginWrite, $scope.fail);
  }
  
  $scope.beginWrite = function(f) {
	f.createWriter(function(w) {
      w.onwrite = function() {
	    $scope.showMessage('Export complete');
	  }
      
      var s = $scope.cart.toCsv();
      w.seek(0);
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

function CartFilesCtrl($scope, $dialog) {
  $scope.fileSystem;
  $scope.mainDir;
  $scope.files = [];
  
  $scope.init = function() {
    document.addEventListener("deviceready", $scope.onDeviceReady, true);
  }
	  
  $scope.onDeviceReady = function() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $scope.successGetFS, $scope.fail);
  }
  
  $scope.successGetFS = function(fileSystem) {
	$scope.fileSystem = fileSystem;
	$scope.getDir('TabletInvoice');
  }
  
  $scope.getDir = function(dir) {
    $scope.fileSystem.root.getDirectory(dir, 
	  {create: false, exclusive: false}, 
	  $scope.successGetDir, null);
  }
	  
  $scope.fail = function(error) {
    alert('Error: ' + error.toString());
  }
  
  $scope.successGetDir = function(parent) {
	var dirReader = parent.createReader();
	$scope.mainDir = parent;
	dirReader.readEntries($scope.successLoadDir, null);
  }
  
  $scope.successLoadDir = function(entries) {
	var n = entries.length;
	$scope.files = [];
	var a = [];
	
	for (var i = 0; i < n; i++) {
	  if (entries[i].isFile) {
		var f = entries[i];
		f.createTime = $scope.getCreateTime(f.name);
	    a.push(f);
	  }
	}
	
	$scope.files = a;
	$scope.orderProp = '-modtime';
	$scope.$apply();
  }
  
  $scope.getCreateTime = function(name) {
	var i = name.indexOf('_');
	var j = name.indexOf('.');
	var val = 0;
	
	if (i >= 0 && j < name.length) {
	  var v = name.substring(i + 1, j);
	  val = parseInt(v);
	}
	
	return val;
  }
  
  $scope.removeFile = function(f) {
	var cb = function() {
	  var n = $scope.files.length;
	  for (var i = 0; i < n; i++) {
		if (f.name == $scope.files[i].name) {
	      $scope.files.splice(i, 1);
	      break;
		}
	  }
	  
	  $scope.$apply();
	}
	
	f.remove(cb, $scope.fail);
  }
  
  $scope.sendEmail = function(f) {
	//window.plugins.emailComposer.showEmailComposerWithCallback(null,"Look at this photo","Take a look at <b>this<b/>:",["example@email.com", "johndoe@email.org"],[],[],true,["_complete_path/image.jpg", "_other_complete_path/file.zip"]);
	var cb = function(a) {
	  alert(a);
	  //$scope.showMessage('The invoice is successfully sent');
	}
	  
	window.plugins.emailComposer.showEmailComposerWithCallback(
	  cb,
	  'Invoice ' + $scope.getDateStr(f),
	  'Please find the invoice attached.',
	  ['siewwingfei@hotmail.com'],
	  [],
	  [],
	  true,
	  [$scope.getFilePath(f)]);
  }
  
  $scope.getDateStr = function(f) {
	var v = $scope.getCreateTime(f.name);
	var dt = new Date(v);
	var s = dt.toLocaleString();
	
	return s;
  }
  
  $scope.showMessage = function(msg) {
    var title = 'Send Invoice';
	var btns = [{result:'ok', label: 'OK', cssClass: 'btn-primary'}];

	$dialog.messageBox(title, msg, btns)
	  .open()
	  .then(function(result) {
	});
  }
  
  $scope.getFilePath = function(f) {
	var s = f.fullPath.replace('file:///', '/');
	return s;
  }
  
  $scope.init();
}

CartFilesCtrl.$inject = ['$scope', '$dialog'];
