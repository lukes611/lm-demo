


//the primary render function
LMGame.prototype.render = function()
{
	this.graphx.clear_vsmall();
	this.graphx.drawBG();
	if(this.drawDice)
	{
		this.graphx.clear_dice();
		this.graphx.drawDice(1, this.dice.val1);
		this.graphx.drawDice(0, this.dice.val2);
	}
	var i = 0;
	for(; i < this.players.length; i++)
	{
		this.graphx.draw_playerf(this.players[i].position, this.players[i].idol, i);
	}
};

//function to move a player (selected by player_index) xtimes forward, the players actual position is then changed and cb is called after
LMGame.prototype.move_player = function(player_index,xtimes, cb)
{
	var i = 0;
	if(xtimes == 0){ return; }
	var th = this;
	th.move_player_single(player_index, function myCb()
	{
		i++;
		if(i < xtimes)
		{
			th.move_player_single(player_index, myCb);
		}else
		{
			if(cb != undefined){cb();}
		}
	});
};

//play the roll the dice animation, then actually roll the dice to produce some random numbers
LMGame.prototype.roll_animation = function(cb)
{
	var th = this;
	this.drawDice = true;
	var max_times = 12;
	var i = 0;
	(function tmp_dice()
	{
		th.dice.roll_random();
		i++;
		if(i < max_times) { setTimeout(tmp_dice, 50); }
		else { if(cb != undefined) { cb(); } }
	})();
};

//animate a players (selected by playerId) monitary amount and add amount * scalar to it, cb is called after the function completes
LMGame.prototype.money_change_animation = function(playerId, amount, scalar, cb)
{
	var player = this.players[playerId];
	var len = Math.floor(amount / 10);
	var dec_am = 10 * scalar;
	var new_amount = player.money - amount * scalar;
	if(amount <= 50)
	{
		dec_am = 1 * scalar;
		len = amount;
	}
	var i = 0;
	setTimeout(function reduce_money()
	{
		if(i < len)
		{
			player.money += dec_am;
			setTimeout(reduce_money, 50);
		}else
		{
			player.amount = new_amount;
			cb();
			return;
		}
		i++;
	}, 50);
};


//function to clear the dice from the screen and make sure they are not drawn in the render loop
LMGame.prototype.clear_dice = function()
{
	this.grapx.clear_dice();
	this.drawDice = false;
};

//moves a player by a single position, used by the move_player function
LMGame.prototype.move_player_single = function(index, cb, speed)
{
	var ntimes = 10;
	var nseconds = (speed == undefined) ? 300 : speed;
	var incer = 1 / ntimes;
	var original = this.players[index].position;
	var th = this;
	var ftmp = function()
	{
		th.players[index].position += incer;
		if(Math.abs((th.players[index].position-original) - 1) < incer)
		{
			th.players[index].position = (original + 1) % th.graphx.boxes.length;
			if(cb != undefined) { cb(); }
		}else
		{
			setTimeout(ftmp, nseconds / ntimes);
		}
	};
	setTimeout(ftmp, nseconds / ntimes);
};


