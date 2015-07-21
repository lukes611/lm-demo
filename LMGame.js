

function LMGame(canvasName, sizeIn, dataIn)
{
	this.players = new Array();
	this.dice = new Dice();
	this.graphx = new LMGraphics(canvasName, sizeIn.w, sizeIn.h, dataIn);
	this.drawDice = false;
	this.gameData = dataIn;
	this.playersTurn = 0;
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
		var max_times = 50;
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
			st += '<div class="player_statSel">';
		}else
		{
			st += '<div class="player_stat">';
		}
		st += '<img class="player_statim" src="ims/'+this.players[index].idol+'.png">';
		st += '<div class="player_statname">'+this.players[index].name+'</div>';
		st += '<div class="player_statloc">@ '+this.gameData.map.list[Math.floor(this.players[index].position)].name+'</div>';
		st += '<div class="player_statmoney"> $  '+this.players[index].money+' </div>';
		st += '<div class="player_stathouse">';
		st += '<img class="player_stathouseim" src="ims/propertylogo.png"> x M';
		st += '<img class="player_stathouseim" src="ims/houselogo.png"> x N';
		st += '<img class="player_stathouseim" src="ims/hotellogo.png"> x T';
		st += '</div></div>';
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