

//finds the owner of a property by property id, returns -1 if unowned
LMGame.prototype.find_owner = function(id)
{
	var i = 0;
	for(; i < this.players.length; i++)
	{
		if(this.players[i].owns(id)) return i;
	}
	return -1;
};

//returns the map data given a position
LMGame.prototype.map_data = function(position)
{
	return this.gameData.map.list[position];
};


//gets the property data based on the property id
LMGame.prototype.properties_data = function(id)
{
	return this.gameData.properties.list[id];
};

//returns the total number of properties in the same set as the property indicated by id
LMGame.prototype.total_in_set = function(id)
{
	var set_id = this.properties_data(id).set;
	var i = 0;
	var count = 0;
	for(; i < this.gameData.properties.list.length; i++)
	{
		if(this.gameData.properties.list[i].set == set_id) count++;
	}
	return count;
};

//changes turn to next player
LMGame.prototype.nextPlayer = function()
{ 
	this.playersTurn = (this.playersTurn+1) % this.players.length;
};

//returns the object representing the current player
LMGame.prototype.current_player = function()
{
	return this.players[this.playersTurn];
};