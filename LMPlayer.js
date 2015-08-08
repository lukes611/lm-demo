

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
	this.buy = function(idIn, pIn) { console.log('adding...');this.properties.push({"id":idIn,"p":pIn, "isMortgaged": false}); };
	
	//checks if the player owns a certain property
	this.owns = function(id){ var i = 0; for(; i < this.properties.length; i++) if(this.properties[i].id==id) return true; return false; };
	
	this.construct(nameIn, idolIn);
}

