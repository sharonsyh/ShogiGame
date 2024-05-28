'use strict';
const os = require('os');
const Piece = require('./Piece');

class Player{
    constructor(playerStatus){
        this.playerStatus = playerStatus; // lower or Upper // 1 or -1
        this.turn = 0;  // turn <= 200
        this.currentPiece = [];
        this.capturedPiece = [];
        this.initalizePlayerPiece();
    }

    initalizePlayerPiece() {
        var currentPiece = new Array();

        if(this.playerStatus == 1){
            this.currentPiece.push(new Piece(4,0,2)); //n
            this.currentPiece.push(new Piece(3,0,3)); //g
            this.currentPiece.push(new Piece(2,0,5)); //r
            this.currentPiece.push(new Piece(1,0,4)); //s
            this.currentPiece.push(new Piece(0,0,1)); //d
            this.currentPiece.push(new Piece(0,1,6)); //p
        } else {
            this.currentPiece.push(new Piece(0,4,2)); //N
            this.currentPiece.push(new Piece(1,4,3)); //G
            this.currentPiece.push(new Piece(2,4,5)); //R
            this.currentPiece.push(new Piece(3,4,4)); //S
            this.currentPiece.push(new Piece(4,4,1)); //D
            this.currentPiece.push(new Piece(4,3,6)); //P
        }
        
        return currentPiece;
    }

    resetAndInitializePieces(newPieces = null) {
        this.currentPiece = [];
        this.capturedPiece = []; 
    }

    findPiece(fromCol, fromRow){
        for(var i = 0; i < this.currentPiece.length; i ++){
            if(this.currentPiece[i].col == fromCol && this.currentPiece[i].row == fromRow) {
                return this.currentPiece[i];
            }
        }
        return null;
    }

    findPieceFromList(type,list){

        for(var i = 0; i < list.length; i ++){
            if(list[i].type === type) {
                return list[i];
            }
        }
        return null;
    }

    findAllPath(piece,board){
		
        var possibleList = new Array();
		
		var index = 0;
        
		for(var i = 0; i < piece.direction.length; i ++){

			if((piece.type == 2 || piece.type == 3) && piece.promote){
				index = Math.floor(i/4); 
                //unpromoted gov and unpromoted notes have 4 elements
                //promoted gov and promoted notes hav 6,8 elements each
                //if divided by 4 
                //index = 0 --> size[0] for the original moves which is 10 (should be able to move all the way to the border lines) 
                //index = 1 --> size[1] for the added directions which is 1 (should only be allowed to move 1 step)
			}
            // console
            var size = piece.size[index]; 
			var nextCol = piece.col + piece.direction[i][0];
			var nextRow = piece.row + piece.direction[i][1] * this.playerStatus;


            var doNotJump = false;
            
			while(size > 0 && (doNotJump == false)){

                // console.log(`CHECKING ${nextCol}, ${nextRow}`);

				if(nextCol > 4 || nextCol < 0) break;
					
				if(nextRow > 4 || nextRow < 0) break;

				if(board.typeBoard[nextCol][nextRow] * this.playerStatus > 0) { // Same Player   
                    break;
                } 

                if(piece.type == 1 && this.isCheckmate(nextCol,nextRow,board)) {
                    break;
                }

				possibleList.push([nextCol,nextRow]);

                if(board.typeBoard[nextCol][nextRow] * this.playerStatus != 0) {
                    doNotJump = true;
                }

                nextCol += piece.direction[i][0];
                nextRow += piece.direction[i][1] * this.playerStatus;
                
                size--;
            }
		}

        return possibleList;
	}

    remove(piece,list){
        const index = list.indexOf(piece);
        if (index > -1) { // only splice array when item is found
            list.splice(index, 1); // 2nd parameter means remove one item only
        }
    }

    isIllegalMove(piece, toCol, toRow, board){
        
        var list = this.findAllPath(piece, board);

        for(var i = 0; i < list.length; i ++) {
            if(list[i][0] == toCol && list[i][1] == toRow) return false;
        }
        return true;
    }

    checkPromote(piece,toCol,toRow){

        if((this.playerStatus == -1 && toRow == 0) || (this.playerStatus == 1 && toRow == 4)) {
            piece.setPromote(true);
        }
    }

    isCheckmate(toCol,toRow,board){

        if(board.upperBoard == null || board.lowerBoard == null) return false; // initialize case

        if(this.playerStatus == -1){ //upper
            if(board.lowerBoard[toCol][toRow]) return true;
        } else { //lower
            if(board.upperBoard[toCol][toRow]) return true;
        }

        return false;
    }

    move(fromCol, fromRow, toCol, toRow, board){

        let piece = this.findPiece(fromCol, fromRow); 

        if(piece == null) {
            return false;
        }

        if(this.isIllegalMove(piece, toCol, toRow, board)) {
            
            return false;
        }
        //check if upper or lower isin the promotion zone
        if(piece.type == 6) this.checkPromote(piece,toCol,toRow);
        
        piece.move(toCol,toRow);

        return true;
    }

    drop(type,toCol,toRow,board){
       
        var piece = this.findPieceFromList(type, this.capturedPiece); 
        
        if (piece) {

            if(board.typeBoard[toCol][toRow] != 0) {
                return false;
            }

            if(type == 6){ //type preview

                //The Box Preview piece may not be dropped into the promotion zone or onto a square that results in an immediate checkmate.
                if((this.playerStatus == -1 && toRow == 0) || (this.playerStatus == 1 && toRow == 4)) {
                    return false;
                }
                
                for(var i = 0; i < 5; i++){
                    //Two unpromoted Box Preview pieces may not lie in the same column when they belong to the same player 
                    if(board.typeBoard[toCol][i] * this.playerStatus == type) return false;
                }
            }

            piece.promote = false;
            piece.move(toCol,toRow);
            this.currentPiece.push(piece);
            
        } else {
            return false;
        }

        return true;
    }
}

module.exports = Player;