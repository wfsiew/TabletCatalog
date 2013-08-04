var utils = (function() {
  function toNumber(value) {
    value = value * 1;
    return isNaN(value) ? 0 : value;
  }
  
  function toFixNumber(value) {
    var v = toNumber(value).toFixed(2) * 1;
    return v;
  }
  
  function toFixNumberStr(value) {
    var v = toFixNumber(value).toFixed(2);
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
  
  function itemMsg(total, pagenum, pagesize) {
    var x = (pagenum - 1) * pagesize + 1;
    var y = pagenum * pagesize;
    
    if (total < y)
      y = total;
      
    if (total < 1)
      return "";
      
    var s = x + ' to ' + y + ' of ' + total;
    return s;
  }
  
  return {
    toNumber: toNumber,
    toFixNumber: toFixNumber,
    toFixNumberStr: toFixNumberStr,
    customerDialogOpts: customerDialogOpts,
    itemMsg: itemMsg
  }
}());
