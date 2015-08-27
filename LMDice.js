
function Dice()
{
	this.val1 = 1;
	this.val2 = 1;
	this.num_doubles = 0;
	this.roll = function()
	{
		this.val1 = Math.floor(Math.random() * 6);
		this.val2 = Math.floor(Math.random() * 6);
		this.val1 += 1;
		this.val2 += 1;
		this.num_doubles = (this.doubles())? this.num_doubles+1 : 0;
	};

	this.roll_random = function()
	{
		this.val1 = Math.floor(Math.random() * 6);
		this.val2 = Math.floor(Math.random() * 6);
		this.val1 += 1;
		this.val2 += 1;
	};

	this.total = function()
	{
		return this.val1 + this.val2;
	};
	this.doubles = function()
	{
		return this.val1 == this.val2;
	};
	this.too_many_doubles = function()
	{
		return this.num_doubles >= 3;
	};

	this.reset_doubles = function()
	{
		this.num_doubles = 0;
	};
}



function Diced()
{
	this.val1 = 1;
	this.val2 = 1;
	this.num_doubles = 0;
	this.vset = [2,38,33,4,16];
	this.index = 0;
	this.roll = function()
	{
		this.val1 = 2;
		this.val2 = 1;

		//this.val1 += 1;
		//this.val2 += 1;
		this.num_doubles = (this.doubles())? this.num_doubles+1 : 0;
	};

	this.roll_random = function()
	{
		this.val1 = Math.floor(Math.random() * 6);
		this.val2 = Math.floor(Math.random() * 6);
		this.val1 += 1;
		this.val2 += 1;
	};

	this.total = function()
	{
		var rv = this.vset[this.index];
		this.index++;
		this.index %= this.vset.length;
		return rv;
	};
	this.doubles = function()
	{
		return this.val1 == this.val2;
	};
	this.too_many_doubles = function()
	{
		return this.num_doubles >= 3;
	};

	this.reset_doubles = function()
	{
		this.num_doubles = 0;
	};
}
