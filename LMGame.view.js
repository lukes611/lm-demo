

//gets the HTML for a single status based on a player's index and whther or not they are selected (it is their turn)
LMGame.prototype.player_stats_injection = function(index, isSel)
{
	var st = '';
	if(isSel != undefined && isSel == true)
	{
		st += '<div class="container-fluid player_statSel">';
	}else
	{
		st += '<div class="container-fluid">';
	}
	//first row:
	st += '<div class="row">';
	st += '<div class="col-xs-2"><img class="BootStrapFitIm" src="ims/'+this.players[index].idol+'.png"></div>';
	st += '<div class="col-xs-3">'+this.players[index].name+'</div>';
	st += '<div class="col-xs-7">@ '+this.gameData.map.list[Math.floor(this.players[index].position)].name+'</div>';
	st += '</div>';

	//second row:
	st += '<div class="row">'
	st += '<div class="col-xs-6"> $  '+this.players[index].money+' </div>';
	st += '<div class="col-xs-2"><img class="BootStrapFitIm" src="ims/propertylogo.png"> x '+this.players[index].properties.length+'</div>';
	st += '<div class="col-xs-2"><img class="BootStrapFitIm" src="ims/houselogo.png"> x N</div>';
	st += '<div class="col-xs-2"><img class="BootStrapFitIm" src="ims/hotellogo.png"> x T</div>';
	st += '</div>';
	st += '</div>';
	return st;
};


//returns the HTML view for the player status'
LMGame.prototype.get_player_stats_injection = function()
{
	var st = '';
	var i = 0;
	for(; i < this.players.length; i++)
	{
		if(this.playersTurn == i)
			st += this.player_stats_injection(i, true);
		else
			st += this.player_stats_injection(i, false);
	}
	return st;
};


