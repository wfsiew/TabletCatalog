function cart(cartName) {
  this.cartName = cartName;
  this.clearCart = false;
  this.items = [];
  
  this.loadItems();
  
  var self = this;
  $(window).unload(function() {
    if (self.clearCart) {
      self.clearItems();
    }
      
    self.saveItems();
    self.clearCart = false;
  });
}

cart.prototype.loadItems = function() {
  var items = localStorage != null ? localStorage[this.cartName + "_items"] : null;
  if (items != null && JSON != null) {
    try {
      var items = JSON.parse(items);
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.sku != null && item.name != null && item.price != null && item.quantity != null && item.uom != null && item.catId != null) {
          item = new cartItem(item.sku, item.name, item.price, item.quantity, item.uom, item.catId);
          this.items.push(item);
        }
      }
    }
    
    catch (err) {
      
    }
  }
}

cart.prototype.saveItems = function() {
  if (localStorage != null && JSON != null) {
    localStorage[this.cartName + "_items"] = JSON.stringify(this.items);
  }
}

cart.prototype.addItem = function(sku, name, price, quantity, uom, catId) {
  quantity = this.toNumber(quantity);
  if (quantity != 0) {
    var found = false;
    for (var i = 0; i < this.items.length && !found; i++) {
      var item = this.items[i];
      if (item.sku == sku && uom.code == item.uom.code) {
        found = true;
        item.quantity = this.toNumber(item.quantity + quantity);
        if (item.quantity <= 0) {
          this.items.splice(i, 1);
        }
      }
    }
    
    if (!found) {
      var item = new cartItem(sku, name, price, quantity, uom, catId);
      this.items.push(item);
    }
    
    this.saveItems();
  }
}

cart.prototype.getTotalPrice = function(sku) {
  var total = 0;
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (sku == null || item.sku == sku) {
      total += this.toNumber(item.quantity * item.price * item.uom.unit);
    }
  }
  return total;
}

cart.prototype.getTotalPriceByCategory = function(catId) {
  var total = 0;
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (catId == item.catId) {
      total += this.toNumber(item.quantity * item.price * item.uom.unit);
    }
  }
  return total;
}

cart.prototype.getTotalCount = function(sku) {
  var count = 0;
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (sku == null || item.sku == sku) {
      count += this.toNumber(item.quantity);
    }
  }
  return count;
}

cart.prototype.getTotalCountByCategory = function(catId) {
  var count = 0;
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (catId == item.catId) {
      count += this.toNumber(item.quantity);
    }
  }
  return count;
}

cart.prototype.clearItems = function() {
  this.items = [];
  this.saveItems();
}

cart.prototype.toNumber = function(value) {
  value = value * 1;
  return isNaN(value) ? 0 : value;
}

cart.prototype.toCsv = function() {
  var s = [];
  var content = '';
  var count = 0;
  var total = 0;
  var r = ['Item', 'Quantity', 'UOM', 'Unit Price', 'Nett'];
  s.push(r.join(',') + "\n");
  
  for (var i = 0; i < this.items.length; i++) {
	var item = this.items[i];
	count += this.toNumber(item.quantity);
	total += this.toNumber(item.quantity * item.price * item.uom.unit);
	
	r = [];
	r.push(item.name);
	r.push(this.toNumber(item.quantity));
	r.push(item.uom.code);
	r.push(this.toNumber(item.price));
	r.push(this.toNumber(item.price * item.quantity * item.uom.unit));
	
	s.push(r.join(',') + "\n");
  }
  
  r = ['Total', count, '', '', total];
  s.push(r.join(',') + "\n");
  
  content = s.join('');
  return content;
}

function cartItem(sku, name, price, quantity, uom, catId) {
  this.sku = sku;
  this.name = name;
  this.price = price * 1;
  this.quantity = quantity * 1;
  this.uom = uom;
  this.catId = catId;
}
