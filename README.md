js.metaret
==========

lightweight mutual tail recursion optimization without trampoline

These are the sources for the article http://glat.info/js.metaret/

.

Background: Implementing mutual tail recursion optimization without trampoline [1] - for good performance - led me to write quite insane code [2]. Here is a lighter approach, that extends JavaScript with two keywords `metafun` and `metaret`, implementing one tiny bit of Backus' metacomposition [3].

[0] http://glat.info

[1] http://glat.info/jscheck/tomrec.xhtml

[2] http://glat.info/jscheck/tool.tailopt.js

[3] http://www.stanford.edu/class/cs242/readings/backus.pdf