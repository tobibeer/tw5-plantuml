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
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "plantuml";
exports.types = {inline: true, block: true};

exports.init = function(parser) {
	this.parser = parser;
};

exports.findNextMatch = function(startPos) {
	// Find the next tag
	this.nextPlantUML = this.findnextPlantUML(this.parser.source,startPos);
	return this.nextPlantUML ? this.nextPlantUML.start : undefined;
};

exports.parse = function() {
	// Move past the match
	this.parser.pos = this.nextPlantUML.end;
	return [this.nextPlantUML];
};

/*
Find the next image from the current position
*/
exports.findnextPlantUML = function(source,pos) {
	// A regexp for finding candidate HTML tags
	var reLookahead = /(\[\[plantuml)/g;
	// Find the next candidate
	reLookahead.lastIndex = pos;
	var match = reLookahead.exec(source);
	while(match) {
		// Try to parse the candidate as a tag
		var tag = this.parsePlantUml(source,match.index);
		// Return success
		if(tag) {
			return tag;
		}
		// Look for the next match
		reLookahead.lastIndex = match.index + 1;
		match = reLookahead.exec(source);
	}
	// Failed
	return null;
};

/*
Look for an plantuml at the specified position.
Returns null if not found,
otherwise returns {type: "plantuml", attributes: [], isSelfClosing:, start:, end:,}
*/
exports.parsePlantUml = function(source,pos) {
	var token,
		// Create plantuml node scaffold
		node = {
			type: "plantuml",
			start: pos,
			attributes: {}
		};
	// Skip whitespace
	pos = $tw.utils.skipWhiteSpace(source,pos);
	// Look for `[[plantuml`
	token = $tw.utils.parseTokenString(source,pos,"[[plantuml");
	if(!token) {
		return null;
	}
	pos = token.end;
	// Skip whitespace
	pos = $tw.utils.skipWhiteSpace(source,pos);
	// Process attributes
	if(source.charAt(pos) !== "[") {
		var attribute = $tw.utils.parseAttribute(source,pos);
		while(attribute) {
			node.attributes[attribute.name] = attribute;
			pos = attribute.end;
			pos = $tw.utils.skipWhiteSpace(source,pos);
			if(source.charAt(pos) !== "[") {
				// Get the next attribute
				attribute = $tw.utils.parseAttribute(source,pos);
			} else {
				attribute = null;
			}
		}
	}
	// Skip whitespace
	pos = $tw.utils.skipWhiteSpace(source,pos);
	// Look for the `[` after the attributes
	token = $tw.utils.parseTokenString(source,pos,"[");
	if(!token) {
		return null;
	}
	pos = token.end;
	// Skip whitespace
	pos = $tw.utils.skipWhiteSpace(source,pos);
	// Get source up to terminating `]]]`
	token = $tw.utils.parseTokenRegExp(source,pos,/([^]+?)\]\]\]/mg);
	if(!token) {
		return null;
	}
	pos = token.end;
	node.attributes.source = {
		type: "string",
		//URL-encode plantuml
		value: (token.match[1] || "").trim()
	};
	// Update the end position
	node.end = pos;
	return node;
};

})();
