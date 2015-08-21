

function LMGame(canvasName, sizeIn, dataIn)
{
	this.gameData = dataIn;
	this.players = new Array();
	this.dice = new Diced();
	this.graphx = new LMGraphics(canvasName, sizeIn.w, sizeIn.h, this.gameData);
	this.drawDice = false;
	this.playersTurn = 0;
	this.state = 0; //beginning state
}

//add a new player
LMGame.prototype.add_player = function(nameIn,idol)
{
	this.players.push(new LMPlayer(nameIn,idol));
};











