

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
	
	//purchase a new property
	this.buy = function(idIn, pIn) { this.properties.push({"id":idIn,"p":pIn, "isMortgaged": false, 'houses' : 0, 'hotels' : 0}); };
	
	//checks if the player owns a certain property
	this.owns = function(id){ var i = 0; for(; i < this.properties.length; i++) if(this.properties[i].id==id) return true; return false; };
	
	//checks if a player owns the set of a property (all the blues, all the reds...)
	this.owns_set = function(set_id, total_in_set)
	{
		var count = 0;
		this.properties.forEach(function(p)
		{
			if(p.set == set_id) count++;
		});
		return count >= total_in_set;
	};
	
	//returns the property object based on id
	this.property_ob = function(id)
	{
		var i = 0;
		for(; i < this.properties.length; i++) if(this.properties[i].id == id) return this.properties[i];
		return undefined;
	};
	
	this.construct(nameIn, idolIn);
	
	
}

