
(function() {
  var f;

  (function() {
    var a: string;
    return a = 1;
  });

  (function() {
    var a;
    return a = 2;
  });

  f = function() {
    throw 'doesntwork';
  };

  f();

}).call(this);
