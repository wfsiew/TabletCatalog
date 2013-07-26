function pager(total, pagenum, pagesize) {
  this.total = total;
  this.pagenum = pagenum;
  this.pagesize = pagesize;
  
  this.setPageSize(pagesize);
}

pager.prototype.set = function(total, pagenum, pagesize) {
  this.total = total;
  this.pagenum = pagenum;
  this.pagesize = pagesize;
  
  this.setPageSize(pagesize);
}

pager.prototype.lowerBound = function() {
  return (this.pagenum - 1) * this.pagesize;
}

pager.prototype.upperBound = function() {
  var upperBound = this.pagenum * this.pagesize;
  if (this.total < upperBound)
    upperBound = this.total;
	
  return upperBound;
}

pager.prototype.hasNext = function() {
  return (this.total > this.upperBound() ? true : false);
}

pager.prototype.hasPrev = function() {
  return (this.lowerBound() > 0 ? true : false);
}

pager.prototype.totalPages = function() {
  var x = this.total / this.pagesize;
  return Math.ceil(x);
}

pager.prototype.setPageSize = function(pagesize) {
  if ((this.total < pagesize || pagesize < 1) && this.total > 0)
    this.pagesize = this.total;
	
  else
    this.pagesize = pagesize;
	
  if (this.totalPages() < this.pagenum)
    this.pagenum = this.totalPages();
	
  if (this.pagenum < 1)
    this.pagenum = 1;
}