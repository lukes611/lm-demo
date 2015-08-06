
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
	this.vset = [2,5,8,12,16];
	this.index = 0;
	this.roll = function()
	{
		this.val1 = this.vset[this.index];
		this.val2 = 0;
		this.index++;
		this.index %= this.vset.length;
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
