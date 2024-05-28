'use strict';
const os = require('os');

/**
 * Class that represents the BoxShogi board
 */

class Board {

	constructor(upper,lower) {
		this.BOARD_SIZE = 5;
		this.upper = upper;
        this.lower = lower;
		this.board = this.initializeEmptyBoard();
		this.typeBoard = this.initializeTypeBoard();
		this.lowerBoard = this.initializePlayerBoard(lower); //for checkmate
		this.upperBoard = this.initializePlayerBoard(upper); //for checkmate
	}

	initializeEmptyBoard() {

        var board = new Array(5);
        for(var i = 0; i < 5; i++){
            board[i] = new Array(5).fill('');
        }

		board[0][0] = "d"; 
		board[1][0] = "s";
		board[2][0] = "r";
		board[3][0] = "g";
		board[4][0] = "n";
		board[0][1] = "p";
		
		board[0][4] = "N"; 
		board[1][4] = "G";
		board[2][4] = "R";
		board[3][4] = "S";
		board[4][4] = "D";
		board[4][3] = "P";

		return board;
	}

	initializeTypeBoard() {

		var typeBoard = new Array(5);
		for(var i = 0; i < 5; i++){
            typeBoard[i] = new Array(5).fill(0);
        }
		//lower
		typeBoard[0][0] = 1; //d
		typeBoard[4][0] = 2; //n
		typeBoard[3][0] = 3; //g
		typeBoard[1][0] = 4; //s
		typeBoard[2][0] = 5; //r
		typeBoard[0][1] = 6; //p
		//UPPER
		typeBoard[4][4] = -1; //D
		typeBoard[0][4] = -2; //N
		typeBoard[1][4] = -3; //G
		typeBoard[3][4] = -4; //S
		typeBoard[2][4] = -5; //R
		typeBoard[4][3] = -6; //P

		return typeBoard;
	}

	resetBoard() {

		this.board = new Array(5);
        for(var i = 0; i < 5; i++){
            this.board[i] = new Array(5).fill("");
        }

		this.typeBoard = new Array(5);
        for(var i = 0; i < 5; i++){
            this.typeBoard[i] = new Array(5).fill(0);
        }
    }

	placeBoard(type, col, row) {

		this.board[col][row] = type;
	}

	placeTypeBoard(type, col, row) {
		this.typeBoard[col][row] = type;
	}

	initializePlayerBoard(player) {
		var pathBoard = new Array(5);

		for(var i = 0; i < 5; i++){
			pathBoard[i] = new Array(5).fill(false);
		}
		
		if (!player.currentPiece || !Array.isArray(player.currentPiece)) {
			return pathBoard;
		}
		var list;

		for(var i = 0; i < player.currentPiece.length; i++){

			list = player.findAllPath(player.currentPiece[i], this);

			for(var j = 0; j < list.length; j ++) {
				if(pathBoard[list[j][0]][list[j][1]] == false){
					pathBoard[list[j][0]][list[j][1]] = true;
				}
			}
		}
		return pathBoard;
	}

	updatePlayerBoard(player){
		if(player.playerStatus == -1) {
			this.upperBoard = this.initializePlayerBoard(player);
		} else {
			this.lowerBoard = this.initializePlayerBoard(player);
		}
	}

	getPieceRepresentation(type, playerStatus, isPromoted) {
		// Determine the base letter for the piece based on its type
		let baseLetter;
		switch (Math.abs(type)) {
			case 1: baseLetter = 'd'; break;
			case 2: baseLetter = 'n'; break;
			case 3: baseLetter = 'g'; break;
			case 4: baseLetter = 's'; break;
			case 5: baseLetter = 'r'; break;
			case 6: baseLetter = 'p'; break;
			default: baseLetter = ''; break; 
		}
	
		// Adjust the letter case based on the player
		if (playerStatus == -1) {
			baseLetter = baseLetter.toUpperCase();
		}
	
		if (isPromoted) {
			baseLetter = '+' + baseLetter;
		}
	
		return baseLetter;
	}

	updateBoard(playerStatus,piece,fromCol,fromRow){

		this.board[fromCol][fromRow] = '';

		// Calculate the piece's representation on the board
		let pieceRepresentation = this.getPieceRepresentation(piece.type, playerStatus, piece.promote);

		// Place the piece in the new square
		this.board[piece.col][piece.row] = pieceRepresentation;

		// Update the type board for logical operations
		this.typeBoard[fromCol][fromRow] = 0;
		this.typeBoard[piece.col][piece.row] = piece.type * playerStatus;
	}

	updateDropBoard(playerStatus,piece,charType){

		this.typeBoard[piece.col][piece.row] = piece.type * playerStatus;
		if(playerStatus == -1) this.board[piece.col][piece.row] = charType.toUpperCase();
		else this.board[piece.col][piece.row] = charType;
	}
	
	/**
	 * Utility function for printing the board
	 * @returns {string}
	 **/
	printBoard() {
		let str = '';
		for (let row = this.BOARD_SIZE - 1; row >= 0; row--) {
			str += `${row + 1} |`;
			for (let col = 0; col < this.BOARD_SIZE; col++) {
				str += this.stringifySquare(this.board[col][row]);
			}
			str += os.EOL;
		}
		str += `    a  b  c  d  e${os.EOL}`;
		process.stdout.write(str);
	}
	/**
	 * Utility function for stringifying an individual square on the board
	 * @param square - array of strings
	 * @returns {string}
	 */
	stringifySquare(square) {
	    if (typeof square !== 'string' || square.length > 2) {
	        throw new Error('Board must be an array of strings, e.g., "", "P", or "+P"');
	    }
	    switch(square.length) {
	        case 0:
	            return '__|';
	        case 1:
	            return ` ${square}|`;
	        case 2:
	            return `${square}|`;
	    }
	}
}

module.exports = Board;

