{function fact(k,acc){var _undef_;_L_fact_:while (true){{acc || (acc=1);if(k > 1) {var _k_=k-1;var _acc_=acc*k;k=_k_;acc=_acc_;continue _L_fact_;}else return acc;}return;}} function gcd(a,b){var _undef_;_L_gcd_:while (true){{if (a > b){var _a1_=a-b;a=_a1_;continue _L_gcd_;}if (b > a){var _a_=b-a;var _b_=a;a=_a_;b=_b_;continue _L_gcd_;}return a;}return;}} (function (global){global.isEven=isEven;global.isOdd=isOdd;function isEven(n){var _undef_;var _switch_ind_=0;_L_switch_:while (true){switch (_switch_ind_){case 0:{if (n > 0) {n=n-1;_switch_ind_=1;continue _L_switch_;}if (n < 0) {n=-n;continue _L_switch_;}return true;}break;case 1:{if (n > 0) {n=n-1;_switch_ind_=0;continue _L_switch_;}if (n < 0) {n=-n;continue _L_switch_;}return false;}break;}return;}}function isOdd(n){var _undef_;var _switch_ind_=0;_L_switch_:while (true){switch (_switch_ind_){case 0:{if (n > 0) {n=n-1;_switch_ind_=1;continue _L_switch_;}if (n < 0) {n=-n;continue _L_switch_;}return false;}break;case 1:{if (n > 0) {n=n-1;_switch_ind_=0;continue _L_switch_;}if (n < 0) {n=-n;continue _L_switch_;}return true;}break;}return;}}})(this);}{function sortedSearch(sortedArray,x,less,equal){var _undef_;var _switch_ind_=0;_L_switch_:while (true){switch (_switch_ind_){case 0:{less || (less=function (a,b){return a < b;});equal || (equal=function (a,b){return a==b;});var first_found=false,last_found=false,i=0 ,j=sortedArray.length-1 ,imax=j,jmin=i;{_switch_ind_=1;continue _L_switch_;}} break;case 1:{if (!first_found){var _undef_1,_ret_;var _sortedArray_=sortedArray;var _i_=i;var _equal_=equal;var _x_=x;do{{_ret_=_equal_(_x_,_sortedArray_[_i_])&& (_i_ < 1 || !_equal_(_x_,_sortedArray_[_i_-1]));break;}} while (false);first_found=_ret_;};if(i > j)return null;if (first_found && last_found)return[i,j];if (!first_found){i++;imax=Math.min(imax,j);var ind=i+((imax-i)>> 1) ,v_ind=sortedArray[ind];if (less(v_ind,x)|| isFirstFound(sortedArray,ind,equal,x))i=ind;else imax=ind;}{_switch_ind_=2;continue _L_switch_;}} break;case 2:{if (!last_found){var _undef_1,_ret_;var _sortedArray_=sortedArray;var _j_=j;var _equal_=equal;var _x_=x;do{{_ret_=_equal_(_x_,_sortedArray_[_j_])&& (_j_ > _sortedArray_.length-2 || !_equal_(_x_,_sortedArray_[_j_+1]));break;}} while (false);last_found=_ret_;};if(!last_found){j--;jmin=Math.max(jmin,i);var ind=j-((j-jmin)>> 1) ,v_ind=sortedArray[ind];if (less(x,v_ind)|| isLastFound(sortedArray,ind,equal,x))j=ind;else jmin=ind;}{_switch_ind_=1;continue _L_switch_;}} break;}return;}function isFirstFound(sortedArray,i,equal,x){return equal(x,sortedArray[i])&& (i < 1 || !equal(x,sortedArray[i-1])); } function isLastFound(sortedArray,j,equal,x){return equal(x,sortedArray[j])&& (j > sortedArray.length-2 || !equal(x,sortedArray[j+1])); } } } {{function to_be_inlined(opt1,opt2){'not doing much, just testing :)';opt1=1 +(opt1 || 0) +(opt2 || 0);if (('undefined' !==typeof console)&& console.log)console.log('to_be_inlined: opt1 result:',opt1);return opt1;this.line.will.never.be.reached();}function to_be_inlined_imbricated(some,optional,parameters){'still testing :)';var arr=[];for (var i=0;i < 3;i++){{var _undef_,_ret_;var _opt1_=_undef_;var _opt2_=_undef_;do{{'not doing much, just testing :)';_opt1_=1 +(_opt1_ || 0) +(_opt2_ || 0);if (('undefined' !==typeof console)&& console.log)console.log('to_be_inlined: opt1 result:',_opt1_);_ret_=_opt1_;break;this.line.will.never.be.reached();}}while (false);var a=_ret_;};arr.push(a);}return arr;}}{var _undef_,_ret_;var _opt1_=_undef_;var _opt2_=_undef_;do{{'not doing much, just testing :)';_opt1_=1 +(_opt1_ || 0) +(_opt2_ || 0);if (('undefined' !==typeof console)&& console.log)console.log('to_be_inlined: opt1 result:',_opt1_);_ret_=_opt1_;break;this.line.will.never.be.reached();}}while (false);};{var _undef_,_ret_;var _some_=_undef_;var _optional_=_undef_;var _parameters_=_undef_;do{{'still testing :)';var _arr_=[];for (var _i_=0;_i_ < 3;_i_++){{var _undef_1,_ret_1;var _opt1_=_undef_1;var _opt2_=_undef_1;do{{'not doing much, just testing :)';_opt1_=1 +(_opt1_ || 0) +(_opt2_ || 0);if (('undefined' !==typeof console)&& console.log)console.log('to_be_inlined: opt1 result:',_opt1_);_ret_1=_opt1_;break;this.line.will.never.be.reached();}}while (false);var _a_=_ret_1;};_arr_.push(_a_);}_ret_=_arr_;break;}} while (false);};} 
