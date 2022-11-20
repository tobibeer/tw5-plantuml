/*\
title: $:/plugins/tobibeer/plantuml/widget.js
type: application/javascript
module-type: widget

A widget to render plantuml

@preserve
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var PlantUMLWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
PlantUMLWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
PlantUMLWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	var c,h,link,w,
		// Reference to (image) node
		node = this.node,
		// Output parseTree nodes
		nodes = [],
		/*
		Helper function to figure out if editing is allowed
		*/
		noClick = function(el) {
			// Reference to domnode
			var node = el;
			// So long as we have parents
			while(node) {
				// Got a nodeName and it is
				if(node.nodeName && (
					// Either a link
				 	node.nodeName === "a" ||
					// Or a button
					node.nodeName === "button"
				)) {
					// No editing allowed
					return 1;
				}
				// Next parent
				node = node.parentNode;
			}
			//If not inside any button or link, we're ok to edit
			return 0;
		};
	// Depending on output mode
	switch(this.output) {
		// Return source
		case "src":
			// Create codeblock
			node.type = "element";
			node.tag = "pre";
			// Add source text
			node.children = [{
				type: "text",
				text: this.source
			}];
			// Add to output
			nodes.push(node);
			break;
		// Embed svg to be able to click links
		case "svg":
			// Create codeblock
			node.type = "element";
			node.tag = "embed";
			// Set embedded source
			node.attributes.src = {
				type:"string",
				// Encoding the source attribute depending on the specified type, e.g. svg or img
				value:$tw.utils.plantuml.encodePlantUML(this.source,this.output)
			};
			// Add to output
			nodes.push(node);
			break;
		// Render plantuml as text
		case "txt":
			// Create iframe
			node.type = "element";
			node.tag = "iframe";
			// Add source attribute
			node.attributes.src = {
				type:"string",
				// URI-encoded to txt
				value:$tw.utils.plantuml.encodePlantUML(this.source,this.output)
			};
			// Get any defined classed
			c = node.attributes["class"] ? node.attributes["class"].value + " " : "";
			// Set class to
			node.attributes["class"] = {
				type:"string",
				// Defined classes and iframe-text class
				value: c + "tc-plantuml-txt"
			};
			// Get defined height
			h = node.attributes.height ? "height:" + node.attributes.height.value + ";" : "";
			// Get defined width
			w = node.attributes.width ? "width:" + node.attributes.width.value + ";" : "";
			// Got either height or width?
			if(h||w) {
				// Set style
				node.attributes.style = {
					type:"string",
					// To defined height and/or width
					value: h+w
				};
			}
			// Got a tooltip? (and we're not editing? => will handle link creation itself)
			if(node.attributes.tooltip && !this.edit) {
				// Add div before iframe
				nodes.push({
					type:"element",
					tag:"div",
					// With a specific class
					attributes: {
						"class": {type:"string",value:"tc-plantuml-txt-title"}
					},
					// Add text-node
					children: [{
						type: "text",
						// Being the tooltip
						text: node.attributes.tooltip.value
					}]
				});
			}
			// Add iframe to nodes
			nodes.push(node);
			break;
		// Image mode
		default:
			// Set image source
			node.attributes.source = {
				type:"string",
				// Encoding the source attribute depending on the specified type, e.g. svg or img
				value:$tw.utils.plantuml.encodePlantUML(this.source,this.output)
			};
			// Add image node to output
			nodes.push(node);
	}
	// Enable edit and we're allowed to? (not inside another button or link)
	if(this.edit && !noClick(this.parentDomNode)) {
		// Create link
		link = {
			type: "element",
			tag: "a",
			// Set link attributes
			attributes: {
				// Link class
				"class": {type:"string",value:"tc-plantuml-edit tc-tiddlylink-external"},
				// New window
				"target": {type:"string",value:"_blank"},
				// Set href to URI-encoded edit-url
				"href": {type:"string",value:$tw.utils.plantuml.encodePlantUML(this.source,"edit")}
			}
		};
		// If iframe
		if(this.output === "txt"){
			// Add text
			link.children = [{
				type: "text",
				text: this.wiki.getTextReference("$:/plugins/tobibeer/plantuml/lingo/edit-link") + (
					node.attributes.tooltip ? node.attributes.tooltip.value : ""
				)
			}];
			// Prepend link
			nodes.unshift(link);
		// Images or source
		} else {
			// Wrap in link
			link.children = nodes;
			nodes = [link];
		}
	}
	// Construct the child widgets
	this.makeChildWidgets(nodes);
	// Render into the dom
	this.renderChildren(this.parentDomNode,nextSibling);
};

/*
Compute the internal state of the widget
*/
PlantUMLWidget.prototype.execute = function() {
	var self = this;
	// Read defined source
	this.source = this.getAttribute("source","");
	// Read defined output
	this.output = this.getAttribute("output","svg");
	// Create edit link?
	this.edit = this.getAttribute("edit");
	// No edit attribute defined?
	if(this.edit === undefined) {
		// Get edit from global defaults
		this.edit = this.wiki.getTextReference("$:/plugins/tobibeer/plantuml/defaults/edit");
	}
	// Set to true if editing is enabled
	this.edit = ["yes","true"].indexOf((this.edit||"").toLowerCase()) >= 0;
	// Create image node
	this.node = {
		type: "image",
		attributes: {}
	};
	// Loop image widget attributes
	["width","height","class","tooltip","alt"].map(function(attr){
		// Get attribute
		var a = self.getAttribute(attr);
		// Attribute defined?
		if(a !== undefined) {
			// Set attribute at image node
			self.node.attributes[attr] = {
				type: "string",
				// To defined value
				value: a
			};
		}
	});
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
PlantUMLWidget.prototype.refresh = function() {
	// Compute changed attributes
	var changedAttributes = this.computeAttributes();
	// If any of these changed...
	if(
		changedAttributes.source ||
		changedAttributes.width ||
		changedAttributes.height ||
		changedAttributes["class"] ||
		changedAttributes.tooltip ||
		changedAttributes.output ||
		changedAttributes.edit
	) {
		// Refresh
		this.refreshSelf();
		return true;
	} else {
		return false;
	}
};

// Export the widget
exports.plantuml = PlantUMLWidget;

})();
