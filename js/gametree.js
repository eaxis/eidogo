/**
 * EidoGo -- Web-based SGF Replayer
 * Copyright (c) 2006, Justin Kramer <jkkramer@gmail.com>
 * Code licensed under the BSD license:
 * http://www.opensource.org/licenses/bsd-license.php
 *
 * This file contains GameTree and related structures GameNode and GameCursor.
 */

/**
 * For uniquely identifying trees and nodes. Should work even if we have
 * multiple Player instantiations.
 */
eidogo.gameTreeIdCounter = 1;
eidogo.gameNodeIdCounter = 1;

/**
 * @class GameNode holds the information for a specific node in the game tree,
 * such as moves, labels, game information, and variations.
 */
eidogo.GameNode = function(properties) {
	this.init(properties);
};
eidogo.GameNode.prototype = {
	reserved: ['parent', 'nextSibling', 'previousSibling'],
	/**
	 * @constructor
	 * @param {Object} properties A JSON object to load into the node
	 */
	init: function(properties) {
		properties = properties || {};
		this.id = eidogo.gameNodeIdCounter++;
		this.parent = null; // a tree, not a node
		this.nextSibling = null;
		this.previousSibling = null;
		this.loadJson(properties);
	},
	setProperty: function(property, value) {
		if (!this.reserved.contains(property)) {
			this[property] = value;
		}
	},
	loadJson: function(jsonNode) {
		for (var propName in jsonNode) {
			this.setProperty(propName, jsonNode[propName]);
		}
	},
	getProperties: function() {
		var properties = {};
		for (var propName in this) {
			if (propName != "reserved" && (typeof this[propName] == "string"
				|| this[propName] instanceof Array)) {
				properties[propName] = this[propName];
			}
		}
		return properties;
	},
	getMove: function() {
		if (typeof this.W != "undefined") {
			return this.W;
		} else if (typeof this.B != "undefined") {
			return this.B;
		}
		return null;
	},
	getPosition: function() {
		for (var i = 0; i < this.parent.nodes.length; i++) {
			if (this.parent.nodes[i].id == this.id) {
				return i;
			}
		}
		return null;
	}
};

/**
 * @class GameTree holds all of the game's moves and variations
 */
eidogo.GameTree = function(jsonTree) {
	this.init(jsonTree);
};
eidogo.GameTree.prototype = {
	/**
	 * @constructor
	 * @param {Object} jsonTree A JSON object to load into the tree
	 */
	init: function(jsonTree) {
		this.id = eidogo.gameTreeIdCounter++;
		this.nodes = [];
		this.trees = [];
		this.parent = null;
		this.preferredTree = 0;
		if (typeof jsonTree != "undefined") {
			this.loadJson(jsonTree);
		}
		if (!this.nodes.length) {
			// must have at least one node
			this.appendNode(new eidogo.GameNode());
		}
	},
	appendNode: function(node) {
		node.parent = this;
		if (this.nodes.length) {
			node.previousSibling = this.nodes.last();
			node.previousSibling.nextSibling = node;
		}
		this.nodes.push(node);
	},
	appendTree: function(tree) {
		tree.parent = this;
		this.trees.push(tree);
	},
	loadJson: function(jsonTree) {
		for (var i = 0; i < jsonTree.nodes.length; i++) {
			this.appendNode(new eidogo.GameNode(jsonTree.nodes[i]));
		}
		for (var i = 0; i < jsonTree.trees.length; i++) {
			this.appendTree(new eidogo.GameTree(jsonTree.trees[i]));
		}
		if (jsonTree.id) {
			// overwrite default id
			this.id = jsonTree.id;
		}
	},
	getPosition: function() {
		if (!this.parent) return null;
		for (var i = 0; i < this.parent.trees.length; i++) {
			if (this.parent.trees[i].id == this.id) {
				return i;
			}
		}
		return null;
	}
};

/**
 * @class GameCursor is used to navigate among the nodes of a game tree.
 */
eidogo.GameCursor = function(node) {
	this.init(node);
}
eidogo.GameCursor.prototype = {
	/**
	 * @constructor
	 * @param {eidogo.GameNode} A node to start with
	 */
	init: function(node) {
		this.node = node;
	},
	nextNode: function() {
		if (this.node.nextSibling != null) {
			this.node = this.node.nextSibling;
			return true;
		} else {
			return false;
		}
	},
	next: function(treeNum) {
		if (!this.hasNext()) return false;
		if ((typeof treeNum == "undefined" || treeNum == null)
			&& this.node.nextSibling != null) {
			this.node = this.node.nextSibling;
		} else if (this.node.parent.trees.length) {
			// remember the last line followed
			if (typeof treeNum == "undefined" || treeNum == null) {
				treeNum = this.node.parent.preferredTree;
			} else {
				this.node.parent.preferredTree = treeNum;
			}
			this.node = this.node.parent.trees[treeNum].nodes.first();
		}
		return true;
	},
	previous: function() {
		if (!this.hasPrevious()) return false;
		if (this.node.previousSibling != null) {
			this.node = this.node.previousSibling;
		} else {
			// ascend one level
			this.node = this.node.parent.parent.nodes.last();
		}
		return true;
	},
	hasNext: function() {
		return this.node && (this.node.nextSibling != null ||
			(this.node.parent && this.node.parent.trees.length));
	},
	hasPrevious: function() {
		return this.node && ((this.node.parent.parent
			&& this.node.parent.parent.nodes.length
			&& this.node.parent.parent.parent) ||
			(this.node.previousSibling != null));
	},
	getPath: function() {
		var path = [];
		var pathCursor = new eidogo.GameCursor(this.node);
		var treeId = prevId = pathCursor.node.parent.id;
		path.push(pathCursor.node.getPosition());
		path.push(pathCursor.node.parent.getPosition());
		while (pathCursor.previous()) {
			treeId = pathCursor.node.parent.id;
			if (prevId != treeId) {
				path.push(pathCursor.node.parent.getPosition());
				prevId = treeId;
			}
		}
		return path.reverse();
	}
};