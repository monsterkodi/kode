<img src="./bin/kode.svg" />

**kode** is a programming language that transpiles to JavaScript.

It is highly inspired by and *tries* to be compatible with [CoffeeScript](http://coffeescript.org), while adding some features and further its minimalistic approach:

## ...

```kode
a = 1...3
for i in 0..5
```

Square brackets around ranges are optional.

## console

```kode
log 'hello'     ▸ hello
error 'world!'  ▸ world!
```

Simple shortcuts for `log`, `warn` and `error` methods of `console`.

## negative indexing

```kode
"abc"[-2]       ▸ 'b'
[1,2,3][-2]     ▸ 2
```

`v[-n]` is a shortcut for `v[-n..-n][0]` for number literals `n`

## if

```kode
if  a ➜ X
    b ➜ Y
      ➜ Z
```
is a shortcut for

```kode
if      a then X
else if b then Y
          else Z
```

## switch

```kode
switch x
    1
    2 3   ➜ X
    'abc' ➜ Y
          ➜ Z      
```
is a shortcut for

```kode
switch x
    when 1,2,3 then X
    when 'abc' then Y
    else            Z
```

## is

```kode
1 is 'number' and '' is 'string' and {} is Object and [] is Array   ▸ true
1 is Number or '' is String or [] is 'array'                        ▸ false
```

`is` is a shortcut for `typeof` and `instanceof`. 
The first is used, when the right hand side is a string.

### num str obj

```kode
"0xFF" is num and "-4.536" is num and 42 is num                     ▸  true
'' is str and "a" is str and new String("abc") is str               ▸  true
{} is obj and new Object() is obj                                   ▸  true
null is obj or new Map() is obj or [] is obj                        ▸  false
```

`is num` does a string coersion via `parseFloat` in the test.
`is str` checks both, type == 'string' or instanceof String.
`is obj` evaluates to true for plain Objects only.

## empty

```kode
empty [] and empty {} and empty '' and empty null and empty NaN     ▸ true
empty 0 or empty 'a' or empty [null] or empty Infinity              ▸ false
```

Returns true for null, undefined, NaN and empty array, object or string.

## valid

```kode
valid 0 and valid 'a' and valid [null] and valid Infinity           ▸ true
valid [] or valid {} or valid '' or valid null or valid NaN         ▸ false
```

Just the negation of `empty`.

## each

```kode
obj each (k,v) -> [k,v]
obj each (v) -> v
```

The `each` operator takes an object, array or string on the left hand side and 
a function on the right hand side.
The function is called for each key/value, index/item, index/character pair.
A new object, array or string is build from the results and returned:

```kode
'hello'   each (c) -> c+c                                           ▸ 'hheelllloo'
[1,3]     each (i,v) -> [1-i,v*v]                                   ▸ [9,1]
{a:1,b:3} each (k,v) -> ['▸'+k, k+v]                                ▸ { '▸a': 'a1', '▸b': 'b3' }
```

If the function takes only one argument, 
it is the value/item/character and a single return value is expected.

## for

```kode
x = null
for a in x
    log 'hello'
```

The above code would throw an exception at runtime in CoffeeScript.
**kode** generates code that doesn't fail if x is not an array.

## constructor

```kode
class C
    @: ->
```

is a shortcut for

```kode
class C
    constructor: ->
```

## list comprehension

```kode
l = [1,2,3]
a = [x for x in l]                                                  ▸ [1,2,3]
a = (x for x in l)                                                  ▸ [1,2,3]
````

**kode** doesn't distuinguish between round and square brackets around list comprehensions.

## ternary

```kode
false ? 1 : 2                                                       ▸ 2
```

A nifty `if` `then` `else` shortcut.
It introduces some ambiguity in a few corner cases, which can be resolved by different spacing:

```kode
null ? a: 'b'                                                       ▸ {a:'b'}
```

## old school

**kode** gives you the option to use the old school `function` style classes of CoffeeScript v1:

```kode
function C
    @: ->
```

The generated code might be a bit more ugly, but the function based classes don't suffer from some of the limitations of the new class syntax.
For example, keywords can be used as method names and super doesn't have to be called first in the constructor.
New and old school styles can be used in the same module, but obviously not in the same class hierarchy.

## optional commata

CoffeeScript has a very nice way of initializing arrays:

```kode
a = [
        1
        2
        3
    ]
```

If you decide to join these into a single line, you have a problem: 
for each of the lines a comma must be inserted.
The same goes for objects that span over multiple lines.

In **kode**, you don't need to insert commata after number or string literals and POD structures.
Those are all valid expressions:

```kode
a = [ 1 2 3 ]
a = { b:1 c:2 d:3 }
a =   b:1 c:2 d:3
a =   b:[ c:2 'd' 3 ]
a = [ [1 2] [d:3] ]

test 'something' ->
    it 'should' ->

on 'event' @myCallback

log 'a:' a , 'd:' 3                     # some commas still make sense :-)
```

## noon

```kode
s = noon a:1 b:2
log s                                   ▸ a   1
                                        ▸ b   2
```

Operator that converts argument into string in [noon](https://github.com/monsterkodi/noon) notation.
Handles recursion, unlike `JSON.stringify`.

## dbg

```kode
myObj = a:1 b:2 c:d:3
dbg myObj                               ▸ file.kode:2:0 myObj
                                        ▸ a   1
                                        ▸ b   2
                                        ▸ c
                                        ▸     d   3
dbg '1st' 0 '2nd' myObj.c               ▸ file.kode:7:0
                                        ▸ 1st 0 2nd d   3
```

Logs file and position followed by arguments in [noon](https://github.com/monsterkodi/noon) notation.
If first argument is an identifier, appends its name to the file position.

## assert

```kode
f = (a) -> ▴ a ; a                      ▸ file.kode:1:11 ▴ assert failed! a
▴ 'good' f 1                            
▴ 'bad'  f 0                            ▸ file.kode:3:0 ▴ bad f(0)
```

Logs file position, message and condition code if condition isn't truish. 
If message is omitted, 'assert failed!' will be used.

## profile

```kode
●▸ sunny times

fun = ->                              
    ● funny times                     
    Math.sqrt x for x in 0..100000    
                                      
fun() for i in 1..2                     ▸ funny times 12 ms
                                        ▸ funny times 11 ms
●▪ sunny times                          ▸ sunny times 26 ms
```

Logs time difference between matching `●▸` `●▪` pairs.

`●` is a shortcut that can be used in functions: `●▪` is inserted automatically before the function returns.
    
## copy & clone

```
a = copy b                              # shallow copy of b
a = clone b                             # deep copy of b
```

Operators that return a shallow or deep copy of their argument. 
Only plain Objects, Arrays and Strings are copied. Functions, Maps, Sets, etc. are not copied.

# Compatibility

**kode** is *mostly* compatible with CoffeeScript. Converting to **kode** shouldn't be too painful.

Stuff I rarely used and therefore didn't bother to re-implement:

- literal coffeescript
- `unless`  `until` `or=` `by` ...
- `when` outside of `switch`
- wrapper code
- string interpolation in object keys
- implicitly returning arrays if last expression is a loop

# Future plans

- `include` keyword to merge source files
- render comments
- sourcemaps
- error messages

