function CategoryListCtrl($scope, $http, $dialog, DataService) {
  $scope.cart = DataService.cart;
  $scope.order = DataService.order;
  $scope.db;
  
  $scope.init = function() {
    var opts = utils.customerDialogOpts();
    if ($scope.order.customer.name == null) {
      $dialog.dialog(opts)
        .open()
        .then(function(result) {
          if (result) {
            $scope.saveCustomer(result);
            $scope.waitDevice();
          }
        });
    }

    else {
      $scope.waitDevice();
    }
  }
  
  $scope.saveCustomer = function(result) {
    $scope.order.customer = new customer(result.name, result.accno);
    $scope.order.save();
  }
  
  $scope.waitDevice = function() {
    document.addEventListener("deviceready", $scope.onDeviceReady, true);
  }
  
  $scope.onDeviceReady = function() {
    $scope.db = window.sqlitePlugin.openDatabase({name: 'category'});
    $scope.loadData();
  }
  
  $scope.loadData = function() {
    $scope.db.transaction(function(tx) {
      tx.executeSql('select * from category order by name;', [], function(tx, res) {
        var n = res.rows.length;
        var a = [];
        for (var i = 0; i < n; i++) {
          var r = res.rows.item(i);
          a.push({id: r.id, name: r.name});
        }
    
        $scope.categories = a;
        $scope.orderProp = 'name';
        $scope.$apply();
      });
    });
  }
  
  $scope.init();
  
//  $http.get('categories/categories.json').success(function(data) {
//    $scope.categories = data;
//    $scope.orderProp = 'name';
//  });
}

CategoryListCtrl.$inject = ['$scope', '$http', '$dialog', 'DataService'];

function ProductListCtrl($scope, $routeParams, $http, $filter, $dialog, DataService) {
  $scope.cart = DataService.cart;
  $scope.db;
  $scope.total;
  $scope.pagesize = 20;
  $scope.pager;
  $scope.product;
  
  $scope.init = function() {
    document.addEventListener("deviceready", $scope.onDeviceReady, true);
  }
  
  $scope.onDeviceReady = function() {
    $scope.db = window.sqlitePlugin.openDatabase({name: 'product.' + $routeParams.catId});
    $scope.loadData();
  }
  
  $scope.loadData = function() {
    $scope.db.transaction(function(tx) {
      tx.executeSql('select count(id) as cnt from product;', [], function(tx, res) {
        $scope.total = res.rows.item(0).cnt;
        $scope.pager = new pager($scope.total, 1, $scope.pagesize);
        $scope.loadPage(tx);
      });
    });
  }
  
  $scope.gotoPage = function(page) {
    $scope.db.transaction(function(tx) {
      $scope.pager.set($scope.total, page, $scope.pagesize);
      $scope.loadPage(tx);
    });
  }
  
  $scope.loadPage = function(tx) {
    tx.executeSql('select * from product order by sku limit ' + $scope.pager.lowerBound() + ', ' + $scope.pager.pagesize + ';', [], function(tx, res) {
      var n = res.rows.length;
      var a = [];
      for (var i = 0; i < n; i++) {
        var r = res.rows.item(i);
        var uom = [];
        if (JSON != null) {
          uom = JSON.parse(r.uom);
        }
        a.push({id: r.id, sku: r.sku, name: r.name, price: r.price, image: '', uom: uom});
      }
        
      $scope.products = a;
      $scope.catId = $routeParams.catId;
      $scope.number = /^\d+$/;
      
      $scope.noOfPages = $scope.pager.totalPages();
      $scope.currentPage = $scope.pager.pagenum;
      $scope.maxSize = 10;
      
      $scope.$apply();
    });
  }
  
  $scope.checkPending = function(product) {
    return $scope.isPending(product);
  }
  
  $scope.isPending = function(product) {
    if ($scope.product == null) {
      $scope.product = product;
      return false;
    }
    
    else {
      if ($scope.product.sku != product.sku) {
        product.quantity = null;
        $scope.showMessage('Product ' + $scope.product.sku + ' is not added to cart yet. Please add it to cart or remove the quantity before you continue.');
        return true;
      }
            
      else {
        if (product.quantity == null) {
          $scope.product = null;
        }
      }
    }
        
    return false;
  }
  
//  $http.get('categories/products.' + $routeParams.catId + '.json').success(function(data) {
//    $scope.products = data;
//    $scope.catId = $routeParams.catId;
//    $scope.number = /^\d+$/;
//  });
  
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
    
    $scope.product = null;
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
  
  $scope.init();
}

ProductListCtrl.$inject = ['$scope', '$routeParams', '$http', '$filter', '$dialog', 'DataService'];

function ShoppingCartCtrl($scope, $dialog, DataService) {
  $scope.cart = DataService.cart;
  $scope.order = DataService.order;
  $scope.fileSystem;
  
  $scope.exportCart = function() {
    $scope.createDir('TabletOrder');
  }
  
  $scope.setCustomer = function() {
    var opts = utils.customerDialogOpts();
    $dialog.dialog(opts)
      .open()
      .then(function(result) {
        if (result) {
          $scope.saveCustomer(result);
        }
      });
  }
  
  $scope.saveCustomer = function(result) {
    $scope.order.customer = new customer(result.name, result.accno);
    $scope.order.save();
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
    var file = 'order_' + new Date().getTime() + '.csv';
    parent.getFile(file, {create: true, exclusive: false}, 
    $scope.beginWrite, $scope.fail);
  }
  
  $scope.beginWrite = function(f) {
    f.createWriter(function(w) {
      w.onwrite = function() {
        $scope.cart.clearItems();
        $scope.showMessage('Export complete');
      }
      
      $scope.cart.customer = $scope.order.customer;
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

function CartFilesCtrl($scope, $dialog, DataService) {
  $scope.fileSystem;
  $scope.mainDir;
  $scope.files = [];
  $scope.networkState;
  $scope.hasNetwork = false;
  $scope.order = DataService.order;
  
  $scope.init = function() {
    document.addEventListener("deviceready", $scope.onDeviceReady, true);
  }
  
  $scope.onDeviceReady = function() {
    $scope.networkState = navigator.connection.type;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, $scope.successGetFS, $scope.fail);
  }
  
  $scope.successGetFS = function(fileSystem) {
    $scope.fileSystem = fileSystem;
    $scope.getDir('TabletOrder');
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
    $scope.orderProp = '-createTime';
    if ($scope.networkState != Connection.NONE && $scope.networkState != Connection.UNKNOWN)
      $scope.hasNetwork = true;

    else
      $scope.hasNetwork = false;

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
    var cb = function(a) {};
    
    var cus = $scope.order.customer;
    var msg = 'Please find the order attached.' +
    '<br/>Customer name: <b>' + cus.name + '</b>' +
    '<br/>Acc/No: <b>' + cus.accno + '</b>';

    window.plugins.emailComposer.showEmailComposerWithCallback(
      cb,
      'Order ' + $scope.getDateStr(f),
      msg,
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

CartFilesCtrl.$inject = ['$scope', '$dialog', 'DataService'];

function CustomerDialogCtrl($scope, dialog) {
  $scope.close = function(result) {
  if (result.name != null && result.accno != null)
    dialog.close(result);
  }
}

CustomerDialogCtrl.$inject = ['$scope', 'dialog'];
