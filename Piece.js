'use strict';

/**
 * Class that represents a BoxShogi piece
 */
class Piece {
	constructor(col = null, row = null, type) {
		this.col = col;
		this.row = row;
		this.promote = false;
		this.type = type;
		this.direction = this.setDirection(type,this.promote);
		this.size = this.setSize(type,this.promote); 
		// piece that moves by 1 | piece that moves toward the end of the board
	}

	setDirection(type,promote){
		var direction;
		switch(type){
			//Box Drive (promote X)
			case 1: 
				direction = [[-1,1], [0,1], [1,1], [1,0], [1,-1], [0,-1],[-1,-1], [-1,0]]; 
							//diagupleft up diagupright right diagdownright down diagdownleft left
			break;
			//Box Notes
			case 2:
				direction = [[0,1], [1,0], [0,-1], [-1,0]];  //up, right, down, left
				if(promote){
					var directionDrive = [[-1,1], [0,1], [1,1], [1,0], [1,-1], [0,-1],[-1,-1], [-1,0]]; //diagupleft up diagupright right down left
					var directionDup  = direction.concat(directionDrive);
					direction = this.removeDup(directionDup);
					//[0,1], [0,-1], [1,0], [-1,0], / [-1,1],[1,1]
				}
			break;
			//Box Governace piece
			case 3:
				direction = [[-1,1],[1,1],[1,-1],[-1,-1]];//diagupleft diagupright diagdownright diagupleft
				if(promote){
					var directionDrive = [[-1,1], [0,1], [1,1], [1,0], [1,-1], [0,-1],[-1,-1], [-1,0]]; //diagupleft up diagupright right down left
					var directionDup  = direction.concat(directionDrive);
					direction = this.removeDup(directionDup);
					//[-1,1],[1,1],[1,-1],[-1,-1],/ [0,1],[1,0],[0,-1],[-1,0]
				}
			break;
			// Shield piece (promote X)
			case 4:
				direction = [[-1,1],[0,1],[1,1],[1,0],[0,-1],[-1,0]] //diagupleft up diagupright right down left
			break;
			//Relay piece
			case 5:
				direction = [[-1,1],[0,1],[1,1],[1,-1],[-1,-1]]; //diagupleft up diagupright diagdownright diagdownleft
				if(promote){
					direction = [[-1,1],[0,1],[1,1],[1,0],[0,-1],[-1,0]] //diagupleft up diagupright right down left
				}
			break;
			//Preview piece
			case 6:
				direction = [[0,1]]; // up
				if(promote){
					direction = [[-1,1],[0,1],[1,1],[1,0],[0,-1],[-1,0]] //diagupleft up diagupright right down left
				}
			break;
		}
		// this.direction = direction;
		return direction;
	}

	setPromote(promote){
		this.promote = true;
		this.direction = this.setDirection(this.type, promote);
    	this.size = this.setSize(this.type, this.promote);
	}

	//Removes duplicate movements when combining the movements for promote
	removeDup(arr){
		//Make the array as a set since set doesn't count duplicates
		//Combine the elements as one string with join (ex [[1,1],[2,2],[3,3]] ==> 1,1|2,2|3,3)
		//Split the string by '|'  ==> '1,1' , '2,2' ,'3,3' with split
		//Split by ',' ==> 1,1 to 1 1
		//Convert char 1 to integer 1

		return [...new Set(arr.join("|").split("|"))] 
		.map((v) => v.split(",")) 
		.map((v) => v.map((a) => +a));
	}
	
	setSize(type,promote){

		var size = [1];

		if(type == 2 || type == 3) { //type : notes or governance
			if(promote) {
				size = [10,1]; // move 할때 size index  /4 : size[index/4]; no
			} else {
				size = [10];
			}
		}
		return size;
	}

	move(toCol,toRow){
		this.col = toCol;
		this.row = toRow;
	}

}


module.exports = Piece;
