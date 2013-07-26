function customer(name, accno) {
  this.name = name;
  this.accno = accno;
}

function order() {
  this.customer = {};
  this.clearOrder = false;
  
  this.load();
  
  var self = this;
  $(window).unload(function() {
	if (self.clearOrder) {
      self.clear();
	}
    
	self.save();
	self.clearOrder = false;
  });
}

order.prototype.load = function() {
  var cus = localStorage != null ? localStorage['customer'] : null;
  if (cus != null && JSON != null) {
    try {
      this.customer = JSON.parse(cus);
    }
	
    catch (err) {
      
	}
  }
}

order.prototype.save = function() {
  if (localStorage != null && JSON != null) {
    localStorage['customer'] = JSON.stringify(this.customer);
  }
}

order.prototype.clear = function() {
  this.customer = {};
  this.save();
}