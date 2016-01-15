/*\
title: $:/plugins/tobibeer/plantuml/wikirule.js
type: application/javascript
module-type: wikirule

Wiki text inline rule for embedding plantuml from http://plantuml.org

[[plantuml[<uml>]]]
[[plantuml width=23 height=24 [<uml>]]]
[[plantuml width={{!!width}} height={{!!height}} tooltip="nice stuff"[<uml>]]]
```

This widget is entirely modeled after the core ImageWidget

@preserve
\*/
(function(){"use strict";exports.name="plantuml";exports.types={inline:true,block:true};exports.init=function(t){this.parser=t};exports.findNextMatch=function(t){this.nextPlantUML=this.findnextPlantUML(this.parser.source,t);return this.nextPlantUML?this.nextPlantUML.start:undefined};exports.parse=function(){this.parser.pos=this.nextPlantUML.end;return[this.nextPlantUML]};exports.findnextPlantUML=function(t,e){var n=/(\[\[plantuml)/g;n.lastIndex=e;var i=n.exec(t);while(i){var r=this.parsePlantUml(t,i.index);if(r){return r}n.lastIndex=i.index+1;i=n.exec(t)}return null};exports.parsePlantUml=function(t,e){var n,i={type:"plantuml",start:e,attributes:{}};e=$tw.utils.skipWhiteSpace(t,e);n=$tw.utils.parseTokenString(t,e,"[[plantuml");if(!n){return null}e=n.end;e=$tw.utils.skipWhiteSpace(t,e);if(t.charAt(e)!=="["){var r=$tw.utils.parseAttribute(t,e);while(r){i.attributes[r.name]=r;e=r.end;e=$tw.utils.skipWhiteSpace(t,e);if(t.charAt(e)!=="["){r=$tw.utils.parseAttribute(t,e)}else{r=null}}}e=$tw.utils.skipWhiteSpace(t,e);n=$tw.utils.parseTokenString(t,e,"[");if(!n){return null}e=n.end;e=$tw.utils.skipWhiteSpace(t,e);n=$tw.utils.parseTokenRegExp(t,e,/([^]+?)\]\]\]/gm);if(!n){return null}e=n.end;i.attributes.source={type:"string",value:(n.match[1]||"").trim()};i.end=e;return i}})();