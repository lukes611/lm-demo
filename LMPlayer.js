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
	};
	this.construct(nameIn, idolIn);
}

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
		if(this.properties[i].set == set_id)
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



