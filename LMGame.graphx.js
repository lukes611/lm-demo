


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
LMGame.prototype.move_player = function(player_index, xtimes, cb)
{
	
	if(xtimes == 0){ return; }
	var th = this;
	var incer = xtimes < 0 ? -1 : 1;
	var i = 0;
	th.move_player_single(player_index, function myCb()
	{
		i+=incer;
		if(i != xtimes)
		{
			th.move_player_single(player_index, myCb, undefined, incer);
		}else
		{
			if(cb != undefined){cb();}
		}
	}, undefined, incer);
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
	if(amount == 0) cb();
	var player = this.players[playerId];
	var len = Math.floor(amount / 10);
	var dec_am = 10 * scalar;
	var new_amount = player.money + amount * scalar;
	if(amount <= 50)
	{
		dec_am = scalar;
		len = amount;
	}
	var i = 0;
	setTimeout(function reduce_money()
	{
		if(i < len)
		{
			player.money += dec_am;
			i++;
			setTimeout(reduce_money, 50);
		}else
		{
			player.money = new_amount;
			cb();
			return;
		}
	}, 50);
};


//animate the exchange of money from player1 to player2 and perform the actual exchange, cb is called after the function completes
LMGame.prototype.money_player_exchange = function(player1, player2, amount, cb)
{
	var comp = [false, false];
	var compf = function()
	{
		if(comp[0] && comp[1]) cb();
	};
	this.money_change_animation(player1, amount, -1, function()
	{
		comp[0] = true;
		compf();
	});
	this.money_change_animation(player2, amount, 1, function()
	{
		comp[1] = true;
		compf();
	});
};

//function to clear the dice from the screen and make sure they are not drawn in the render loop
LMGame.prototype.clear_dice = function()
{
	this.grapx.clear_dice();
	this.drawDice = false;
};

//moves a player by a single position either backwards or forwards, direction is either 1 or -1
LMGame.prototype.move_player_single = function(index, cb, speed, direction)
{
	if(direction == undefined) //legacy
	{
		direction = 1;
	}
	if(direction==1) this.move_player_single_forwards(index, cb, speed);
	else this.move_player_single_backwards(index, cb, speed);
};

//moves a player by a single position, used by the move_player function (forwards)
LMGame.prototype.move_player_single_forwards = function(index, cb, speed)
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

//moves a player by a single position, used by the move_player function (backwards)
LMGame.prototype.move_player_single_backwards = function(index, cb, speed)
{
	var ntimes = 10;
	var nseconds = (speed == undefined) ? 300 : speed;
	var incer = 1 / ntimes;
	var original = this.players[index].position;
	var new_pos = original - 1;
	new_pos = new_pos < 0 ? new_pos + this.graphx.boxes.length: new_pos;
	var th = this;
	var ftmp = function()
	{
		var np = th.players[index].position;
		np -= incer;
		np = np < 0 ? np + th.graphx.boxes.length : np;
		th.players[index].position = np;
		var diff = Math.abs(th.players[index].position-new_pos);
		if(diff < incer)
		{
			th.players[index].position = new_pos;
			console.log('ending single back');
			if(cb != undefined) { cb(); }
		}else
		{
			setTimeout(ftmp, nseconds / ntimes);
		}
	};
	setTimeout(ftmp, nseconds / ntimes);
};




