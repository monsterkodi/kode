###
 0000000   00     00   0000000   00000000   000   000  
000   000  000   000  000   000  000   000  000  000   
000 00 00  000000000  000000000  0000000    0000000    
000 0000   000 0 000  000   000  000   000  000  000   
 00000 00  000   000  000   000  000   000  000   000  
###

{ cmp, evl } = require './utils'

describe 'qmark' ->

    # 000   000  000   000  000      000       0000000  00     00  00000000   
    # 0000  000  000   000  000      000      000       000   000  000   000  
    # 000 0 000  000   000  000      000      000       000000000  00000000   
    # 000  0000  000   000  000      000      000       000 0 000  000        
    # 000   000   0000000   0000000  0000000   0000000  000   000  000        

    it 'nullcmp' ->
            
        cmp "a?"                    ";(a != null)"
        cmp "a.b.c?"                ";(a.b.c != null)"
        cmp "a.b().c?"              ";(a.b().c != null)"
        cmp "if a.b().c?"           "if ((a.b().c != null))\n{\n}"
        
        cmp "-> m?",
            """
            (function ()
            {
                return (m != null)
            })
            """
        cmp "r.filter (m) -> m?",
            """
            r.filter(function (m)
            {
                return (m != null)
            })
            """
            
        cmp "matches = matches.filter (m) -> m[1]?",
            """
            matches = matches.filter(function (m)
            {
                return (m[1] != null)
            })
            """
            
    it '?=' ->
        
        cmp "t.a ?= {}",
            """
            t.a = ((_1_4_=t.a) != null ? _1_4_ : {})
            """
        
        cmp "x = t.b ?= {}",
            """
            x = t.b = ((_1_8_=t.b) != null ? _1_8_ : {})
            """
            
    #  0000000    0000000   0000000  00000000  00000000   000000000  
    # 000   000  000       000       000       000   000     000     
    # 000000000  0000000   0000000   0000000   0000000       000     
    # 000   000       000       000  000       000   000     000     
    # 000   000  0000000   0000000   00000000  000   000     000     
    
    it 'assert' ->
        
        cmp "e?.d"                  ";(e != null ? e.d : undefined)"
        cmp "e?()"                  ';(typeof e === "function" ? e() : undefined)'
        cmp "e?[1]"                 ";(e != null ? e[1] : undefined)"
        cmp "e?[1].f"               ";(e != null ? e[1].f : undefined)"
        cmp "e?[1]?.g"              ";(e != null ? e[1] != null ? e[1].g : undefined : undefined)"
        cmp "e?.f?.d"               ";(e != null ? (_1_4_=e.f) != null ? _1_4_.d : undefined : undefined)"
        
        evl "e=1;e?[1]?.g"          undefined
        
    #  0000000   0000000   00     00  0000000    000  000   000  00000000  0000000    
    # 000       000   000  000   000  000   000  000  0000  000  000       000   000  
    # 000       000   000  000000000  0000000    000  000 0 000  0000000   000   000  
    # 000       000   000  000 0 000  000   000  000  000  0000  000       000   000  
    #  0000000   0000000   000   000  0000000    000  000   000  00000000  0000000    
    
    it 'combined' ->
        
        cmp "e?.col?"               ";((e != null ? e.col : undefined) != null)"
        
        cmp """
            (a.b?.c.d?.e == 2)
            """ """
            ;(((_1_4_=a.b) != null ? (_1_9_=_1_4_.c.d) != null ? _1_9_.e : undefined : undefined) === 2)
            """ 

        cmp """
            x = a[1]?.b()?.c?().d?.e
            """ """
            x = (a[1] != null ? (_1_13_=a[1].b()) != null ? typeof (_1_16_=_1_13_.c) === "function" ? (_1_21_=_1_16_().d) != null ? _1_21_.e : undefined : undefined : undefined : undefined)
            """ 

        cmp """
            x = a.b?[222]?(333)?.e
            """ """
            x = ((_1_7_=a.b) != null ? typeof _1_7_[222] === "function" ? (_1_19_=_1_7_[222](333)) != null ? _1_19_.e : undefined : undefined : undefined)
            """ 
            
    it 'functions' ->
        
        cmp "f c ? '', 4"   "f((c != null ? c : ''),4)"
        
        cmp """
            a = ->
                if b?.e?.l
                    hua
                oga
            """ """

            a = function ()
            {
                var _2_11_
            
                if ((b != null ? (_2_11_=b.e) != null ? _2_11_.l : undefined : undefined))
                {
                    hua
                }
                return oga
            }
            """
    
                    