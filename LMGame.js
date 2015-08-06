

function LMGame(canvasName, sizeIn, dataIn)
{
	this.gameData = dataIn;

	this.gameData.prop_index_from_pos = function(pos)
	{
		if(this.map.list[pos].type == 0)
		{
			var val = this.map.list[pos].value;
			var i = 0;
			for(; i < this.properties.list.length; i++)
			{
				if(this.properties.list[i].id == val)
				{
					return i;
				}
			}
		}
		return -1;
	};

	this.players = new Array();
	this.dice = new Diced();
	this.graphx = new LMGraphics(canvasName, sizeIn.w, sizeIn.h, this.gameData);
	this.drawDice = false;

	this.playersTurn = 0;
	this.state = 0; //beginning state

	this.play = function(optionIn, cb)
	{
		switch(this.state)
		{
			case 0:
			{
				this.state = 1;
				cb({'list':[{'name': 'roll', 'id' : 0}], 'desc' : 'roll the dice...'});
				return;
			} break;
			case 1:
			{
					var th = this;
					this.roll_animation(function()
					{
							th.dice.roll();
							var dice_amount = th.dice.total();
							th.move_player(th.playersTurn, dice_amount, function()
							{
								th.state = 2;
								th.play(undefined, cb);
							})
					});
			}break;
			//case 2: left player know what they got, give options
			case 2:
			{
				if(this.gameData.map.list[this.players[this.playersTurn].position].type == 0) //is property they can buy
				{
					this.state = 3;
					cb({'desc':'you landed on: ' + this.gameData.map.list[this.players[this.playersTurn].position].name,
					'list':[{'name':'buy', 'id':0}, {'name': 'auction', 'id' : 1}]});
				}else{this.nextPlayer();this.state=0;this.play(undefined, cb);}
			} break;
			

		}


	};

	this.nextPlayer = function(){ this.playersTurn = (this.playersTurn+1) % this.players.length; };

	this.current_player = function()
	{
		return this.players[this.playersTurn];
	};

	this.add_player = function(nameIn,idol)
	{
		this.players.push(new LMPlayer(nameIn,idol));
	};

	this.render = function()
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

	this.move_player_single = function(index, cb, speed)
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

	this.move_player = function(player_index,xtimes, cb)
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

	this.roll_animation = function(cb)
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



	this.clear_dice = function()
	{
		this.grapx.clear_dice();
		this.drawDice = false;
	};

	this.player_stats_injection = function(index, isSel)
	{
		var st = '';
		if(isSel != undefined && isSel == true)
		{
			st += '<div class="container-fluid player_statSel">';
		}else
		{
			st += '<div class="container-fluid">';
		}
		//first row:
		st += '<div class="row">';
		st += '<div class="col-xs-2"><img class="BootStrapFitIm" src="ims/'+this.players[index].idol+'.png"></div>';
		st += '<div class="col-xs-3">'+this.players[index].name+'</div>';
		st += '<div class="col-xs-7">@ '+this.gameData.map.list[Math.floor(this.players[index].position)].name+'</div>';
		st += '</div>';

		//second row:
		st += '<div class="row">'
		st += '<div class="col-xs-6"> $  '+this.players[index].money+' </div>';
		st += '<div class="col-xs-2"><img class="BootStrapFitIm" src="ims/propertylogo.png"> x M</div>';
		st += '<div class="col-xs-2"><img class="BootStrapFitIm" src="ims/houselogo.png"> x N</div>';
		st += '<div class="col-xs-2"><img class="BootStrapFitIm" src="ims/hotellogo.png"> x T</div>';
		st += '</div>';
		st += '</div>';
		return st;
	};

	this.get_player_stats_injection = function()
	{
		var st = '';
		var i = 0;
		for(; i < this.players.length; i++)
		{
			if(this.playersTurn == i) { st += this.player_stats_injection(i, true); }
			else { st += this.player_stats_injection(i, false); }
		}
		return st;
	};

}
