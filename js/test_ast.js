// koffee 1.14.0
var ast;

ast = require('./test_utils').ast;

describe('ast', function() {
    it('simple', function() {
        ast('a', 'a');
        ast('1', '1');
        ast('no', 'no');
        return ast('1;2', '1\n2');
    });
    return it('operation', function() {
        ast('a and b', "operation\n    lhs\n        a\n    operator\n        and\n    rhs\n        b");
        ast('1 + 2', "operation\n    lhs\n        1\n    operator\n        +\n    rhs\n        2");
        ast('++a', "operation\n    operator\n        ++\n    rhs\n        a");
        ast('not a', "operation\n    operator\n        not\n    rhs\n        a");
        ast('a = b + 1', "operation\n    lhs\n        a\n    operator\n        =\n    rhs\n        operation\n            lhs\n                b\n            operator\n                +\n            rhs\n                1");
        ast('a = b = c', "operation\n    lhs\n        a\n    operator\n        =\n    rhs\n        operation\n            lhs\n                b\n            operator\n                =\n            rhs\n                c");
        return ast('for a in l then a', "for\n    vals\n        a\n    inof\n        in\n    list\n        l\n    then\n        a");
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9hc3QuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJ0ZXN0X2FzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQU9BLElBQUE7O0FBQUMsTUFBTyxPQUFBLENBQVEsY0FBUjs7QUFFUixRQUFBLENBQVMsS0FBVCxFQUFlLFNBQUE7SUFFWCxFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUE7UUFFUixHQUFBLENBQUksR0FBSixFQUFTLEdBQVQ7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEdBQVQ7UUFDQSxHQUFBLENBQUksSUFBSixFQUFTLElBQVQ7ZUFDQSxHQUFBLENBQUksS0FBSixFQUFVLE1BQVY7SUFMUSxDQUFaO1dBT0EsRUFBQSxDQUFHLFdBQUgsRUFBZSxTQUFBO1FBRVgsR0FBQSxDQUFJLFNBQUosRUFDSSw4RUFESjtRQVdBLEdBQUEsQ0FBSSxPQUFKLEVBQ0ksNEVBREo7UUFXQSxHQUFBLENBQUksS0FBSixFQUNJLHlEQURKO1FBU0EsR0FBQSxDQUFJLE9BQUosRUFDSSwwREFESjtRQVNBLEdBQUEsQ0FBSSxXQUFKLEVBQ0kscU1BREo7UUFpQkEsR0FBQSxDQUFJLFdBQUosRUFDSSxxTUFESjtlQWlCQSxHQUFBLENBQUksbUJBQUosRUFDSSwwRkFESjtJQTVFVyxDQUFmO0FBVFcsQ0FBZiIsInNvdXJjZXNDb250ZW50IjpbIlxuIyAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuXG57YXN0fSA9IHJlcXVpcmUgJy4vdGVzdF91dGlscydcblxuZGVzY3JpYmUgJ2FzdCcgLT5cblxuICAgIGl0ICdzaW1wbGUnIC0+XG4gICAgICAgIFxuICAgICAgICBhc3QgJ2EnICAnYSdcbiAgICAgICAgYXN0ICcxJyAgJzEnXG4gICAgICAgIGFzdCAnbm8nICdubydcbiAgICAgICAgYXN0ICcxOzInICcxXFxuMidcbiAgICAgICAgXG4gICAgaXQgJ29wZXJhdGlvbicgLT5cbiAgICAgICAgXG4gICAgICAgIGFzdCAnYSBhbmQgYicsIFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBvcGVyYXRpb25cbiAgICAgICAgICAgICAgICBsaHNcbiAgICAgICAgICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgIGFuZFxuICAgICAgICAgICAgICAgIHJoc1xuICAgICAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBhc3QgJzEgKyAyJyxcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgb3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgbGhzXG4gICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICBvcGVyYXRvclxuICAgICAgICAgICAgICAgICAgICArXG4gICAgICAgICAgICAgICAgcmhzXG4gICAgICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFzdCAnKythJyxcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgb3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgb3BlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgKytcbiAgICAgICAgICAgICAgICByaHNcbiAgICAgICAgICAgICAgICAgICAgYVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgYXN0ICdub3QgYScsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG9wZXJhdGlvblxuICAgICAgICAgICAgICAgIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgIG5vdFxuICAgICAgICAgICAgICAgIHJoc1xuICAgICAgICAgICAgICAgICAgICBhXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIFxuICAgICAgICBhc3QgJ2EgPSBiICsgMScsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG9wZXJhdGlvblxuICAgICAgICAgICAgICAgIGxoc1xuICAgICAgICAgICAgICAgICAgICBhXG4gICAgICAgICAgICAgICAgb3BlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgPVxuICAgICAgICAgICAgICAgIHJoc1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGxoc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgcmhzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgYXN0ICdhID0gYiA9IGMnLFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBvcGVyYXRpb25cbiAgICAgICAgICAgICAgICBsaHNcbiAgICAgICAgICAgICAgICAgICAgYVxuICAgICAgICAgICAgICAgIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgID1cbiAgICAgICAgICAgICAgICByaHNcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBsaHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJoc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGFzdCAnZm9yIGEgaW4gbCB0aGVuIGEnLFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBmb3JcbiAgICAgICAgICAgICAgICB2YWxzXG4gICAgICAgICAgICAgICAgICAgIGFcbiAgICAgICAgICAgICAgICBpbm9mXG4gICAgICAgICAgICAgICAgICAgIGluXG4gICAgICAgICAgICAgICAgbGlzdFxuICAgICAgICAgICAgICAgICAgICBsXG4gICAgICAgICAgICAgICAgdGhlblxuICAgICAgICAgICAgICAgICAgICBhXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICJdfQ==
//# sourceURL=../coffee/test_ast.coffee