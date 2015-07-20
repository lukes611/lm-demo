

function LMPlayer(nameIn, idolIn)
{

	this.construct = function(nameIn, idolIn)
	{
		this.name = nameIn;
		this.properties = new Array();
		this.money = 5000;
		this.position = 0;
		this.idol = (idolIn==undefined)? 'dog' : idolIn;
	};
	
	this.construct(nameIn, idolIn);
}

