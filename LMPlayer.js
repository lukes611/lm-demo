function LMPlayer(nameIn, idolIn)
{
	//create / reset the player's attributes
	this.construct = function(nameIn, idolIn)
	{
		this.name = nameIn;
		//properties have the following data: id (property id), p (pointer to property object), isMortgaged(boolean whether the property is mortgaged or not)
		this.properties = new Array();
		this.money = 300;
		this.position = 0;
		this.idol = (idolIn==undefined)? 'dog' : idolIn;
		this.cards = new Array();
		this.collect_go = true;
		this.turns_waited = 0;
		this.in_jail = false;
	};
	this.construct(nameIn, idolIn);
}

//returns true if a player can afford to spend amount dollars
LMPlayer.prototype.has_enough = function(amount)
{
	return this.money >= amount;
};

//purchase a new propertyL give the property id, and a pointer to the particular property objects
LMPlayer.prototype.buy = function(idIn, pIn)
{ 
	this.properties.push({
		"id":idIn,
		"p":pIn,
		"isMortgaged": false,
		'houses' : 0,
		'hotels' : 0
	}); 
};

LMPlayer.prototype.houses_hotels_count = function()
{
	var rv = {
		houses : 0,
		hotels : 0
	};
	var i = 0;
	for(; i < this.properties.length; i++)
	{
		rv.houses += this.properties[i].houses;
		rv.hotels += this.properties[i].hotels;
	}
	return rv;
};

//checks if the player owns a certain property (pass in the property id)
LMPlayer.prototype.owns = function(id)
{ 
	var i = 0;
	for(; i < this.properties.length; i++)
		if(this.properties[i].id==id)
			return true;
	return false; 
};

//checks if a player owns the set of a property (all the blues, all the reds...)
LMPlayer.prototype.owns_set = function(set_id, total_in_set)
{
	var count = 0, i =0;
	for(; i < this.properties.length; i++)
	{
		if(this.properties[i].p.set == set_id)
			count++;
	}
	return count >= total_in_set;
};

//returns the property object based on id
LMPlayer.prototype.property_ob = function(id)
{
	var i = 0;
	for(; i < this.properties.length; i++)
		if(this.properties[i].id == id)
			return this.properties[i];
	return undefined;
};

//returns a list of property objects (from gamedata) which can be traded by this player
LMPlayer.prototype.tradables = function()
{
	var i = 0;
	var rv = [];
	for(; i < this.properties.length; i++)
	{
		if(this.can_trade_property(i))
			rv.push(this.properties[i].p);
	}
	return rv;
};

//can trade: [(if): 0-houses/hotels, owns it(not mortgaged), other sets they own do not have a house/hotel]
LMPlayer.prototype.can_trade_property = function(player_properties_index)
{
	var i = 0, j = 0;
	for(; i < this.properties.length; i++)
	{
		if(this.properties[i].isMortgaged==true) return false;
		if(this.properties[i].houses > 0) return false;
		if(this.properties[i].hotels > 0) return false;
		var set = this.properties[i].p.set;
		for(j = 0; j < this.properties.length; j++)
		{
			if(j != i)
			{
				if(this.properties[j].houses > 0) return false;
				if(this.properties[j].hotels > 0) return false;
			}
		}
	}
	return true;
};

//count the number of Stations owned
LMPlayer.prototype.number_of_stations_owned = function()
{
	var rv = 0, i = 0;
	for(i = 0; i < this.properties.length; i++)
	{
		if(this.properties[i].p.type == 1) rv++;
	}
	return rv;
};

//count the number of Utilities owned
LMPlayer.prototype.number_of_utilities_owned = function()
{
	var rv = 0, i = 0;
	for(i = 0; i < this.properties.length; i++)
	{
		if(this.properties[i].p.type == 2) rv++;
	}
	return rv;
};

