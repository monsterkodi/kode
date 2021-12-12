// koffee 1.20.0
var a, l

a = "[object Object]"
l = "xxxx[object Object]xxx"

console.log([].indexOf.call('' + l, a) >= 0);

console.log(''.indexOf.call(l, a));
console.log(typeof l === 'string' && typeof a === 'string' && a.length)
console.log((typeof l === typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a))

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJ0ZXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBQSxDQUFBO0lBQUE7O0FBQUEsQ0FBQSxHQUFJOztBQUF3QixPQUFBLENBQzVCLEdBRDRCLENBQ3hCLGFBQXFCLEVBQUEsR0FBRyxDQUF4QixFQUFBLGlCQUFBLE1BRHdCOztBQUNDLE9BQUEsQ0FDN0IsR0FENkIsQ0FDekIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFYLENBQWdCLENBQWhCLEVBQW1CLGlCQUFuQixDQUR5QiIsInNvdXJjZXNDb250ZW50IjpbImEgPSBcInh4eHhbb2JqZWN0IE9iamVjdF14eHhcIlxubG9nIFwiW29iamVjdCBPYmplY3RdXCIgaW4gJycrYVxubG9nICcnLmluZGV4T2YuY2FsbCBhLCBcIltvYmplY3QgT2JqZWN0XVwiIl19
//# sourceURL=test.coffee