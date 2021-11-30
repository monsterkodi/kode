![banner](./bin/banner.png)

**kode** is a programming language that transpiles to JavaScript.

It is highly inspired by and *tries* to be compatible with [CoffeeScript](http://coffeescript.org), while adding a few enhancements.

Right now (end of 2021) it is a work in progress and not yet fully functional.

# A list of things that work already:

## Constructor shortcut

```coffeescript
class C
    @: ->
```

... is an *optional* shortcut for ...

```coffeescript
class C
    constructor: ->
```

## Negative indexing

```coffeescript
"abc"[-2]    # -> 'b'
[1,2,3][-2]  # -> 2
```

`v[-n]` is a shortcut for `v[-n..-n][0]` for number literals `n`

## for ...

```coffeescript

a = 1..3
for i in 0..5

```

Square brackets around ranges are optional.

## Console shortcuts

```coffeescript
log 'hello'       # -> hello
error 'world!'    # -> world!
```

Simple shortcuts for `log`, `warn` and `error` methods of `console`.

## Ternary condition operator

```coffeescript
false ? 1 : 2     # -> 2
```

A nifty `if` `then` `else` shortcut, which I have always been missing in CoffeeScript.
It introduces some ambiguity in a few corner cases, which can be resolved by different spacing:

```coffeescript
null ? a: 'b'     # -> {a:'b'}
```

## Optional commata

CoffeeScript has a very nice way of initializing arrays:

```coffeescript
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

```coffeescript
a = [ 1 2 3 ]
a = { b:1 c:2 d:3 }
a =   b:1 c:2 d:3
a =   b:[ c:2 'd' 3 ]
a = [ [1 2] [d:3] ]

describe 'something' ->
    it 'should' ->

on 'event' @myCallback

log 'a:' a , 'd:' 3            # some commas still make sense :-)
```

# Planned stuff that does not work yet:

- string interpolation
- error messages
- sourcemaps
- super
- rhs for?

## BigInt

```coffeescript
a = 12345678901234567890n
log a*a  # -> 152415787532388367501905199875019052100n
```

### Debug and profiling support

```coffeescript
                               # log file position and object
dbg 'my object' a:1 b:2        # -> file:1 my object { a: 1, b: 2 }

assert 'message' condition     # log file position and message and exits if condition isn't truish
assert condition               # similar, but without specifying a message

                               # log execution times
profile 'sum'                  # -> 8_4 1ms          line_column prefix
    profile s1()               # -> 9_4 2ms          if not named
    profile s2()               # -> sum 3ms

profile_start 'a'              # like profile, but lets you control
f = -> profile_end 'a'         # when to start and stop timing
f()                            # -> a 824μs
```

# Compatibility

While my first CoffeeScript clone [**koffee**](http://github.com/monsterkodi/koffee) is backwards compatible with CoffeeScript v1,
I don't intend to do the same with **kode**, but converting coffee to kode shouldn't be too painful.

## Future plans

Since I will most likely be the only person using **kode**, it's probably wise to ditch the stuff I don't need:

- REPL
- *cake* / *kake*
- literal coffeescript / ▸doc macro
- `unless`  `until`  `is`  `or=` ...
- `when` outside of `switch`
- **koffee** macros in general?
- wrapper code
- implicitly returning arrays if last expression is a loop

Just in case I manage to get it to work, this is what I would like to add instead:

- native tests
- keywords `empty` and `valid`
- 🥚 `ei` 🥚
- `include` keyword to merge source files
- native `dbg`  `assert`  `profile` instead of macros
- `profile` in same scope
- option to use both: new `class` and old school `function` style classes
- optional square brackets in `(a for a in ...)`
- `await`?


