/**
 * EidoGo -- Web-based SGF Replayer
 * Copyright (c) 2006, Justin Kramer <jkkramer@gmail.com>
 * Code licensed under the BSD license:
 * http://www.opensource.org/licenses/bsd-license.php
 */

/**
 * @class Applies rules (capturing, ko, etc) to a board.
 */
eidogo.Rules = function(board) {
	this.init(board);
};
eidogo.Rules.prototype = {
	/**
	 * @constructor
	 * @param {eidogo.Board} board The board to apply rules to
	 */
	init: function(board) {
		this.board = board;
		this.pendingCaptures = [];
	},
	apply: function(pt, color) {
		var captures = this.doCaptures(pt, color);
		color = color == this.board.WHITE ? "W" : "B";
		this.board.captures[color] += captures;
	},
	/**
	 * Thanks to Arno Hollosi for the capturing algorithm
	 */
	doCaptures: function(pt, color) {
		var captures = 0;
		captures += this.doCapture({x: pt.x-1, y: pt.y}, color);
		captures += this.doCapture({x: pt.x+1, y: pt.y}, color);
		captures += this.doCapture({x: pt.x, y: pt.y-1}, color);
		captures += this.doCapture({x: pt.x, y: pt.y+1}, color);
		// check for suicide
		captures += this.doCapture(pt, -color);
		return captures;
	},
	doCapture: function(pt, color) {
		var x, y;
		var boardSize = this.board.boardSize;
		if (pt.x < 0 || pt.y < 0 || pt.x >= boardSize || pt.y >= boardSize) {
			return 0;
		}
		if (this.board.getStone(pt) == color) {
			return 0;
		}
		this.pendingCaptures = [];
		if (this.doCaptureRecurse(pt, color))
			return 0;
		var caps = this.pendingCaptures.length;
		while (this.pendingCaptures.length) {
			this.board.addStone(this.pendingCaptures.pop(), this.board.EMPTY);
		}
		return caps;
	},
	doCaptureRecurse: function(pt, color) {
		// out of bounds?
		if (pt.x < 0 || pt.y < 0 ||
			pt.x >= this.board.boardSize || pt.y >= this.board.boardSize)
			return 0;

		// found opposite color
		if (this.board.getStone(pt)== color)
			return 0;

		// found a liberty
		if (this.board.getStone(pt) == this.board.EMPTY)
			return 1;

		// already visited?
		for (var i = 0; i < this.pendingCaptures.length; i++) {
			if (this.pendingCaptures[i].x == pt.x
					&& this.pendingCaptures[i].y == pt.y)
				return 0;
		}
		
		this.pendingCaptures.push(pt);

		if (this.doCaptureRecurse({x: pt.x-1, y: pt.y}, color))
			return 1;
		if (this.doCaptureRecurse({x: pt.x+1, y: pt.y}, color))
			return 1;
		if (this.doCaptureRecurse({x: pt.x, y: pt.y-1}, color))
			return 1;
		if (this.doCaptureRecurse({x: pt.x, y: pt.y+1}, color))
			return 1;

		return 0;
	}
}