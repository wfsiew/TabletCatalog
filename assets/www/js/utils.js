var utils = (function() {
  function toNumber(value) {
    value = value * 1;
    return isNaN(value) ? 0 : value;
  }
  
  function toFixNumber(value) {
    var v = toNumber(value).toFixed(2) * 1;
    return v;
  }
  
  function customerDialogOpts() {
    var opts = {
      backdrop: true,
      keyboard: false,
      backdropClick: false,
      templateUrl: 'partials/customer.html',
      controller: 'CustomerDialogCtrl'
    };
    return opts;
  }
  
  return {
    toNumber: toNumber,
    toFixNumber: toFixNumber,
    customerDialogOpts: customerDialogOpts
  }
}());
