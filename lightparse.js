(function (global)
 {
     var RESERVED_ARR = [     // ECMAScript 5, Section 7.6
         
         "break", "case", "catch", "continue", "debugger", "default", "delete", "do", "else", "finally", "for", "function", "if", "in", "instanceof"
         , "new", "return", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with"
         
         , "class", "const", "enum", "export", "extends", "import", "super"
         
         , "implements", "interface", "let", "package", "private", "protected", "public", "static", "yield"
     ]
     , EXTRA_BRACKET_ARR = [
         { open : 'return', close : ';', typebracket : 'return', ignore_unbalanced : true }
     ]
     ;
     
     global.lightparse = lightparse;
     
     lightparse.getDefaultReservedArr = getDefaultReservedArr; 

     // --- Implementation
     
     function getDefaultReservedArr() { return [].concat( RESERVED_ARR ); }

     // In the implementation of `lightparse`, the small comments
     // /*sc*/, /**/ etc. delimitate beginnings and ends of strings,
     // comments and regexps, for unit testing: ./lightparse_test.js

     function lightparse( /*sc*//*string*//**/code, /*sc*//*?object?*//**/opt )
     /*{0*/{
         var /*vd*/reservedArr/**/ = ((opt  &&  opt.reservedArr)  ||  RESERVED_ARR).concat( (opt  &&  opt.extraReservedArr)  ||  [] )
         ,   /*vd*/extraBracketArr/**/ = EXTRA_BRACKET_ARR.concat( (opt  &&  opt.extraBracketArr)  ||  [] )
         ,   /*vd*/ret/**/ = /*{1*/{
             strArr : []
             , commentArr  : []
             , regexpArr   : []
             , reservedArr       : []
             , callArr           : []
             , dotArr            : []
             , dotcallArr        : []
             , identifierArr     : []

             /*dc*/// The last three are derived from `identifierArr`, for convenience.
             , identifierArrReverse : []
             , identifierObj        : /*{1.1*/{}/*}1.1*/
             , identifierObjReverse : /*{1.2*/{}/*}1.2*/

             /*dc*/// Bracket pairs
             , bracketcurlyArr          : []
             , bracketroundArr          : []
             , bracketsquareArr         : []
             , bracketextraArr          : []

             /*dc*/// Brackets: derived values
             , bracketArr               : []
             , bracketTree              : []

         }/*}1*/
         ;

         /*dc*/// Detect comments and strings, and produce a "nakedCode"
         /*dc*/// string where they've all been replaced with spaces.

         var /*vd*/sA/**/ = ret.strArr
         ,   /*vd*/cA/**/ = ret.commentArr
         ,  /*vd*/rxA/**/ = ret.regexpArr
         , /*vd*/nakedCodeArr/**/   = []
         , /*vd*/searchPosition/**/ = 0
         ;
         while (true)
         /*{2*/{
             /*dc*/// Search for a string or comment, whichever comes first

             var /*vd*/sq/**/ = code.indexOf( /*dq*/"'"/**/ , searchPosition )
             ,   /*vd*/dq/**/ = code.indexOf( /*sq*/'"'/**/ , searchPosition )
             ,   /*vd*/sc/**/ = code.indexOf( /*sq*/'/*'/**/, searchPosition )
             ,   /*vd*/dc/**/ = code.indexOf( /*sq*/'//'/**/, searchPosition )
             ,   /*vd*/rr/**/ = code.indexOf( /*sq*/'/'/**/,  searchPosition )

             ,   /*vd*/four/**/ = [ sq, dq, sc, dc, rr ]
             ,   /*vd*/begin/**/ = +Infinity
             ,   /*vd*/ind/**/  = -1
             ;
             for (var /*vd*/n/**/ = four.length, /*vd*/i/**/ = 0; i < n; i++)
             /*{2.1*/{
                 var /*vd*/v/**/ = four[ i ];
                 if (-1 < v  &&  v < begin)
                 /*{2.1.1*/{
                     begin = v;
                     ind   = i;
                 }/*}2.1.1*/
             }/*}2.1*/

             if (ind < 0)
             /*{2.2*/{
                 /*dc*/// Not found

                 nakedCodeArr.push( code.substring( searchPosition ) );
                 break;
             }/*}2.2*/

             /*dc*/// Found: find its end

             var /*vd*/rest/**/  = code.substring( begin )

             , /*vd*/rx/**/ =   ind === 0  ?  /*rr*//^[\s\S]*?[^\\]\'//**/
                 :    ind === 1  ?  /*rr*//^[\s\S]*?[^\\]\"//**/
                 :    ind === 2  ?  /*rr*//^\/\*[\s\S]*?\*\///**/
                 :    ind === 3  ?  /*rr*//^\/\/([^\r\n])*//**/
                 :                  /*rr*//^\/.*?[^\\]\/[gmi]?//**/

             , /*vd*/mo/**/    = rx.exec( rest )
             , /*vd*/delta/**/ = mo  ?  mo.index + mo[ 0 ].length  :  rest.length
             , /*vd*/end/**/   = begin + delta
             ;
             
             /*dc*/// Store

             (ind < 2  ?  sA  :  ind < 4  ?  cA  :  rxA).push( /*{2.3*/{ begin : begin,  str : code.substring( begin, end ) }/*}2.3*/ );

             /*dc*/// Prepare for identifier search

             nakedCodeArr.push(
                 code.substring( searchPosition, begin )
                 , str_repli( /*sq*/' '/**/, delta )
             );

             /*dc*/// Prepare for the next search

             searchPosition = end;

         }/*}2*/
         
         /*dc*/// Detect identifiers and reserved words
         
         var /*vd*/reservedObj/**/ = /*{2a*/{}/*}2a*/;
         for (var /*vd*/i/**/ = reservedArr.length; i--;)  
             reservedObj[ reservedArr[ i ] ] = 1;
         
         var /*vd*/resA/**/      = ret.reservedArr
         ,   /*vd*/caA/**/       = ret.callArr
         ,   /*vd*/dA/**/        = ret.dotArr
         ,   /*vd*/dcaA/**/      = ret.dotcallArr
         ,   /*vd*/iA/**/        = ret.identifierArr
         ,   /*vd*/nakedCode/**/ = nakedCodeArr.join( /*sq*/''/**/ )
         ,   /*vd*/rx/**/        = /*rr*//(\.\s*)?(\b[_a-zA-Z]\w*\b)(\s*\()?/g/**/

         /*dc*/// rx_varDecl_*: Good but not 100% sure -> xxx at some
         /*dc*/// point we need to parse a bit more the var
         /*dc*/// statements. In particular, this RegExp "solution"
         /*dc*/// requires to close var with a ";".
         ,   /*vd*/rx_varDecl_before/**/ = /*rr*//\bvar[\s\r\n]+([^;]*,\s*)?$//**/
         ,   /*vd*/rx_varDecl_after/**/  = /*rr*//^\s*(=[^=]|,|;)//**/
         ,   /*vd*/rx_notVarDecl_after/**/ = /*rr*//^[^=;]*[\)\}\]]//**/
         
         ,   /*vd*/rx_forIn_before/**/  = /*rr*//for\s*\(\s*var\s+$//**/
         ,   /*vd*/rx_forIn_after/**/   = /*rr*//^\s+in\s+//**/

         ,   /*vd*/mo/**/
         ;
         while (mo = rx.exec( nakedCode ))
         /*{3*/{
             var  /*vd*/str/**/ = mo[ 0 ]
             ,    /*vd*/dot/**/ = mo[ 1 ]
             ,   /*vd*/name/**/ = mo[ 2 ]
             ,   /*vd*/call/**/ = mo[ 3 ]
             ,   /*vd*/arr/**/  = (
                 name in reservedObj  ?  resA  
                     : dot && call    ?  dcaA
                     : dot            ?    dA
                     : call           ?   caA
                     :                     iA
             )
             ,   /*vd*/begin/**/ = mo.index
             ,   /*vd*/x/**/     = /*{3.a1*/{ str : str,  begin : begin , name : name }/*}3.a1*/ 
             ;
             if (arr === iA)
             /*{3.1*/{
                 var /*vd*/codeBefore/**/ = nakedCode.substring( 0, begin )
                 ,   /*vd*/codeAfter/**/  = nakedCode.substring( begin + name.length )
                 ;
                 
                 x.isVardecl = (
                     rx_varDecl_after.test( codeAfter )  &&  
                         !rx_notVarDecl_after.test( codeAfter )  &&  
                         rx_varDecl_before.test( codeBefore )
                 )  ||  (
                     rx_forIn_before.test( codeBefore )  &&  
                      rx_forIn_after.test( codeAfter )
                 );
             }/*}3.1*/
             
             arr.push( x );

         }/*}3*/
         
         /*dc*/// Identifiers: a few derived values, for convenience

         var /*vd*/iA/**/ = ret.identifierArr
         ,   /*vd*/iR/**/ = ret.identifierArrReverse = reversed( iA )
         ,  /*vd*/vdA/**/ = ret.vardeclArr = []
         
         ,   /*vd*/iO/**/  = ret.identifierObj = /*{3a*/{}/*}3a*/
         ;
         for (var /*vd*/n/**/ = iA.length, /*vd*/i/**/ = 0; i < n; i++)
         /*{4*/{
             var /*vd*/x/**/ = iA[ i ];
             (
                 iO[ x.str ]  ||  (iO[ x.str ] = [])
             )
                 .push( x.begin )
             ;

             if (x.isVardecl)
                 vdA.push( x );
         }/*}4*/
         
         var /*vd*/iOR/**/ = ret.identifierObjReverse = /*{a5*/{}/*}a5*/;
         for (var /*vd*/str/**/ in iO) /*{5*/{ if (!(str in iOR)) /*{5.1*/{

             iOR[ str ] = reversed( iO[ str ] );
             
         }/*}5.1*/}/*}5*/
         
         
         /*dc*/// Curly brackets (blocks of code or objects).
         
         /*dc*/// - First, white out each regexp.
         var /*vd*/nakedCodeNoRx/**/ = nakedCode;
         for (var /*vd*/i/**/ = rxA.length; i--;)
         /*{6*/{
             var /*vd*/x/**/ = rxA[ i ]
             , /*vd*/len/**/ = x.str.length
             ;
             nakedCodeNoRx = nakedCodeNoRx.substring( 0, x.begin ) + 
                 str_repli( /*sq*/' '/**/, len ) + 
                 nakedCodeNoRx.substring( x.begin + len )
             ;
         }/*}6*/
         
         /*dc*/// - Second, find bracket pairs.

         var /*vd*/bcA/**/ = ret.bracketcurlyArr
         ,   /*vd*/brA/**/ = ret.bracketroundArr
         ,   /*vd*/bsA/**/ = ret.bracketsquareArr
         ,   /*vd*/beA/**/ = ret.bracketextraArr

         ,    /*vd*/bA/**/ = ret.bracketArr

         , /*vd*/find_bracket_cfg/**/ = [
             /*{7a*/{
                 out_arr : bcA
                 , open  : /*sq*/'{'/**/
                 , close : /*sq*/'}'/**/
                 , typebracket  : /*sq*/'curly'/**/
             }/*}7a*/
             , /*{7b*/{
                 out_arr : brA
                 , open  : /*sq*/'('/**/
                 , close : /*sq*/')'/**/
                 , typebracket  : /*sq*/'round'/**/
             }/*}7b*/
             , /*{7c*/{
                 out_arr : bsA
                 , open  : /*sq*/'['/**/
                 , close : /*sq*/']'/**/
                 , typebracket  : /*sq*/'square'/**/
             }/*}7c*/
         ].concat( extraBracketArr.map( function (x) /*{7d*/{
             
             var /*vd*/ret/**/ = Object.create( x ); 
             ret.out_arr = beA; 
             return ret; 
             
         }/*}7d*/ ) )
         ;
         
         find_bracket( find_bracket_cfg, nakedCodeNoRx, code, bA );
                 
         build_bracket_tree( bA, ret.bracketTree );
         build_bracket_sep_split( bA, nakedCodeNoRx, code, reservedArr );

         /*dc*/// All elements, in both first-to-last and reverse orders.
         /*dc*/// Also add a `type` field to each element.

         var /*vd*/all/**/ = ret.all = [];
         
         for (var /*vd*/k/**/ in ret) /*{8*/{
             
             var /*vd*/mo/**/ = k.match( /*rr*//^(.+)Arr$//**/ );
             if (mo)
             /*{8.1*/{
                 var /*vd*/arr/**/ = ret[ k ]
                 ,  /*vd*/type/**/ = mo[ 1 ]
                 ;
                 for (var /*vd*/i/**/ = arr.length; i--;)
                     arr[ i ].type = type;

                 all.push.apply( all, arr );                 
             }/*}8.1*/
         }/*}8*/
       
         all.sort( compare_begin );
         
         ret.allReverse = reversed( all );
         
         return ret;
             
     }/*}0*/

     // --- Detail

     function compare_begin (a,b) { return a.begin < b.begin  ?  -1  :  +1; }

     function build_bracket_tree( /*array*/inArr, /*array*/outTree )
     {
         var pile = [];
         for (var n = inArr.length, i = 0; i < n; i++)
         {
             var x = inArr[ i ];
             x.bracketchildren = [];

             // Close
             
             var last;
             while ((last = pile[ pile.length - 1])  &&  last.end < x.begin)
                 pile.pop();
             
             // Append

             x.bracketparent   = last  ?  last  :  null;
             x.bracketdepth    = pile.length;
             
             if (last  &&  x.begin < last.end)
                 last.bracketchildren.push( x );

             else
                 outTree.push( x );
             
             // Open

             pile.push( x );
         }
     }


     function build_bracket_sep_split( /*array*/bA, /*string*/nakedCodeNoRx, /*string*/code, /*array of string*/reservedArr )
     {
         for (var i = bA.length; i--;)
         {
             var      x = bA[ i ]
             ,     kids = x.bracketchildren
             , nakedOne = nakedCodeNoRx.substring( x.begin, x.end )
             ,   offset = x.begin;
             ;
             // Whitespace open and close
             nakedOne = str_repli( ' ', x.open.length ) + 
                 nakedOne.substring( x.open.length, nakedOne.length - x.close.length ) + 
                 str_repli( ' ', x.close.length )
             ;

             // Whitespace all brackedchildren
             for (var j = kids.length; j--;)
             {
                 var  kid = kids[ j ];
                 nakedOne = nakedOne.substring( 0, kid.begin - offset ) + 
                     str_repli( ' ', kid.end - kid.begin ) 
                     + nakedOne.substring( kid.end - offset )
                 ;
             }
             // Now we can look for comma/semicolon splits without risking to
             // match any comma/semicolon within a kid.

             var rx = new RegExp(
                 [ ',', ';' ]
                     .concat( reservedArr.map( function (w) { return '\\b' + w + '\\b' } ) )
                     .join( '|' )
                 , 'g' 
             )
             ,   sA = x.sepArr = []
             ,   mo
             ;
             while (mo = rx.exec( nakedOne ))
                 sA.push( { index : offset + mo.index, type : mo[ 0 ] } );

             var FIRST = '<first>'
             ,   LAST  = '<last>'
             ,   arr = [ { index : offset + x.open.length, type : FIRST } ]
                 .concat( sA )
                 .concat( [ { index : offset + nakedOne.length - x.close.length, type : LAST } ] )
             ,   sS  = x.sepSplit = []
             ;
             for (var n = -1 + arr.length, j = 0; j < n; j++)
             {
                 var before = arr[ j ]
                 ,   after  = arr[ j + 1 ]
                 ,   begin  = before.index + (before.type !== FIRST  &&  before.type !== LAST  ?  before.type.length  :  1)
                 ,   end    = after .index
                 ,   str    = code.substring( begin, end )
                 ;
                 sS.push( { 
                     begin : begin
                     , end : end
                     , str : str
                     , sep_begin : before
                     , sep_end   : after
                 } );
             }
             
         }
     }


     function find_bracket( /*array*/cfgA, /*string*/nakedCodeNoRx, /*string*/code, /*array*/bA )
     {
         // First, find all open & close occurences, in a single pass
         // to keep the order they appear from in `nakedCodeNoRx`.
         
         var rx = new RegExp(
             cfgA.map( function (o) { 
                 return '(' + o.open.replace( /(\W)/g, '\\$1' ) + ')' + 
                     '|' + 
                     '(' + o.close.replace( /(\W)/g, '\\$1' ) + ')'
                 ; 
             } )
                 .join( '|' )
             , 'g'
         )
         ,   arr = []
         ,   mo
         ,   error
         ;
         while (mo = rx.exec( nakedCodeNoRx ))
         {
             var ind2 = -1;
             for (var i = mo.length; i--;)
             {
                 if (mo[ i ])
                 {
                     ind2 = i-1;
                     break;
                 }
             }
             
             if (!(-1 < ind2))
                 error.bug;  // Sanity check
             
             var is_close = 1 & ind2
             ,   cfgA_ind = ind2 >> 1
             ;
             
             if (mo[0] !== cfgA[ cfgA_ind ][ is_close  ?  'close'  :  'open' ])
                 error.bug;  // Sanity check

             var one = {
                 begin : mo.index
                 , end : mo.index + mo[ 0 ].length
                 , cfg      : cfgA[ cfgA_ind ]
             };

             one[ is_close  ?  'close'  :  'open' ] = mo[ 0 ];

             arr.push( one );
         }

         // Second, walk through open/close instances and pair them,
         // using a pile to take care of encapsulation
         //
         // Store (1) into the array specific to each `typebracket`
         // and (2) into the global array of all brackets: `bA`.
         //
         // Here too, we do a single pass to preserve order.

         var pile = [];
         for (var n = arr.length, i = 0; i < n; i++)
         {
             var one = arr[ i ];

             if (one.open)
             {
                 var x = { begin         : one.begin
                           , typebracket : one.cfg.typebracket
                           , open        : one.cfg.open
                           , close       : one.cfg.close 
                         };
                 one.cfg.out_arr.push( x ); // Specific to this typebracket.
                 bA             .push( x ); // All types together, in order.
                 pile           .push( x ); // Used below to close.
             }
             else
             {
                 var last = pile[ pile.length - 1 ];
                 if (!last)
                 {
                     if (!one.cfg.ignore_unbalanced)
                         throw new Error( 'Unbalanced brackets: missing an opening "' + one.cfg.open + '".' );
                 }
                 else if (last.close !== one.cfg.close)
                 {
                     if (!one.cfg.ignore_unbalanced)
                     {
                         throw new Error( 
                             'Unbalanced brackets: opening typebracket "' + last.typebracket + '" (' + last.begin + ')' + 
                                 ' does not match closing typebracket "' + one.cfg.typebracket + '" (' + one.begin + ').' 
                         );
                     }
                 }
                 else
                 {                 
                     var x = pile.pop();
                     x.end = one.end;
                     x.str = code.substring( x.begin, x.end );
                 }
             }
         }
         
         if (pile.length !== 0)
             throw new Error( 'Unbalanced brackets: missing a closing "' + pile[ pile.length - 1 ].close + '".' );
     }
          

     function reversed( arr )
     {
         var ret = [].concat( arr );
         ret.reverse();
         return ret;
     }


     function str_repli(/*string*/s, /*positive number*/n) 
     {
         return str_filler(s, n)();
     }


     function str_trim(/*string*/s) 
     {
         return s.replace(/(^\s*|\s*$)/g, '');
     }
     
     function str_filler(/*?string?*/f, /*number, negative to fill on the left, positive to fill on the right*/n) 
     {
         
         if (typeof f === 'number') {
             n = f;
             f = null;
         }

         f = f || ' ';

         var target = Math.abs( n ) * f.length;

         return function (/*string*/s) {

             s = s || '';

             s = s + ''; // Force conversion to string

             var remaining = Math.max( 0, target - s.length )
             ,   tmp = f
             ,   fill = []
             ;

             for (var p = Math.floor( remaining / f.length ) + (((remaining % f.length) > 0) ? 1 : 0);
                  p > 0;
                  tmp += tmp, p >>= 1) {
                 
                 if (p && 1)
                     fill.push( tmp );
             }
             
             fill = fill.join( '' );

             if (fill.length > remaining)
                 fill = (n < 0) ? fill.substring( fill.length - remaining ) : fill.substring( 0, remaining );
             
             if (fill.length !== remaining)
                 throw new Error( 'str.filler() is buggy!' );

             return (n < 0) ? (fill + s) : (s + fill);
         };
     }

})(this);
