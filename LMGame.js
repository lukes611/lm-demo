

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
		var player = this.current_player();
		var location = this.map_data(player.position);
		var th = this;
		switch(this.state)
		{
			case 0:
			{
				this.state = 1;
				cb({"type":0, "buttonList":[{'name': 'roll', 'id' : 0, "buttonStyle": 1}], "desc" : 'roll the dice...'});
				return;
			} break;
			case 1:
			{
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
				if(location.type == 0) //is property they can buy
				{
					
					var property = this.properties_data(location.value);
					var owner = this.find_owner(location.value);
					if(owner == -1)
					{
						this.state = 3;
						var ob_rv = {"type":0, "desc":'you landed on: ' + location.name,
						'buttonList':new Array()};
						//if player has enough money: let them have the option of purchasing
						if(player.money >= property.price) ob_rv.buttonList.push({'name':'buy ($' + property.price + ')' , 'id':0, 'buttonStyle':2});
						ob_rv.buttonList.push({'name': 'auction', 'id' : 1, "buttonStyle":5});
						cb(ob_rv);
					}else //someone owns this property
					{
						if(owner == this.playersTurn)
						{
							this.state = 4;
							this.play('You landed on your own property.', cb);
							return;
						}else
						{
							this.state = 7; //have to pay other player
							var set_total = this.total_in_set(property.id);
							var owns_set = this.players[owner].owns_set(property.set, set_total);
							var their_property = this.players[owner].property_ob(property.id);
							var ob_rv = {"type":0, "desc":'you landed on: ' + location.name + '. Which is owned by ' + this.players[owner].name + '.',
							'buttonList':new Array()};
							if(!owns_set || their_property.houses == 0)
							{
								ob_rv.buttonList.push({'name': 'pay rent ($' + property.rent + ')', 'id' : 0, "buttonStyle":1});
							}else if(their_property.hotels >= 1)
							{
								ob_rv.desc += ' ' + this.players[owner].name + ' owns a hotel!';
								ob_rv.buttonList.push({'name': 'pay rent ($' + property.renthotel + ')', 'id' : 0, "buttonStyle":1});
							}else
							{
								ob_rv.desc += ' ' + this.players[owner].name + ' owns ' + (their_property.houses == 1)? 'a house' : '' + their_property.houses + ' houses!';
								ob_rv.buttonList.push({'name': 'pay rent ($' + property.renthotel + ')', 'id' : 0, "buttonStyle":1});
							}
							cb(ob_rv);
						}
						
					}
				}else{this.nextPlayer();this.state=0;this.play(undefined, cb);}
			} break;
			case 3: //chose to purchase or not
			{
				if(optionIn == 0)
				{//purchase
					var property = this.properties_data(location.value);
					this.money_change_animation(this.playersTurn, property.price, -1, function()
					{
						th.state = 4;
						player.buy(location.value, property);
						th.play(undefined, cb);
						
					});
				}else if(optionIn == 1)
				{//auction
					this.state = 6;
					var ob_rv = {"type":1, "desc" : "auction time!, please enter a bid. A bid of zero counts as no bid. The minimum bid is $0."};
					ob_rv.buttonList = new Array({"name":'end bidding', "id":0, "buttonStyle":2});
					ob_rv.bidRound = 1;
					ob_rv.participantsList = new Array();
					ob_rv.minimum_bid = 1;
					this.players.forEach(function(e, i){if(e.money > 0) ob_rv.participantsList.push(i);});
					cb(ob_rv); return;
				}else{ this.nextPlayer(); this.state=0; this.play(undefined, cb);}
				
			}break;
			case 4: //end turn...
			{
				this.state = 5;
				var msg = (optionIn == undefined )? "end your turn, or complete another task." : optionIn + ' You may now end your turn or complete some other task.';
				cb({"type":0, "buttonList":[{'name': 'end turn', 'id' : 0, "buttonStyle": 1}], "desc" : msg});
				return;
			} break;
			case 5: //switch to new player state
			{
				if(optionIn == 0)
				{
					this.state = 0;
					this.nextPlayer();
					this.play(undefined, cb);
				}
				
			} break;			
			case 6:
			{//process auction input, send for another auction OR purchase for player
				//cases: 0: clear winner, purchase their property, 1: zero winners do nothing, 2: multiple winners
				if(optionIn.id_rv == 1)
				{//reset bid
					this.state = 3;
					this.play(1, cb);
					return;
					
				}else if(optionIn.id_rv == 2)
				{//cancel the bid
					this.state = 4;
					this.play('Auction Cancelled. No one gets the property.', cb);
					return;
				}
				var i = 0;
				var highest_bid = -1;
				var winners_list = [];
				var set_vals = false;
				for(; i < optionIn.participantsList.length; i++)
				{
					//if player has enough money
					if(this.players[optionIn.participantsList[i]].money < optionIn.auction_values[i] || this.players[optionIn.participantsList[i]].money < optionIn.minimum_bid) continue;
					if(optionIn.auction_values[i] > highest_bid || !set_vals)
					{
						winners_list.length = 0; //clear array
						winners_list.push(optionIn.participantsList[i]);
						highest_bid = optionIn.auction_values[i];
						set_vals = true;
					}else if(optionIn.auction_values[i] == highest_bid) winners_list.push(optionIn.participantsList[i]);
				}
				
				if((winners_list.length == 0 || highest_bid == 0) && optionIn.bidRound == 1) //no one won
				{
					this.state = 4;
					this.play('Nobody won at the auction. No one gets the property.', cb);
					return;
				}else if(winners_list.length == 1) //somebody won, let players know, before ending turn
				{
					var property = this.properties_data(location.value);
					this.money_change_animation(winners_list[0], highest_bid, -1, function()
					{
						th.state = 4;
						th.players[winners_list[0]].buy(location.value, property);
						th.play(th.players[winners_list[0]].name + ' won the auction! with a bid of $' + highest_bid, cb);
						return;
					});
				}else
				{
					if(highest_bid < optionIn.minimum_bid || winners_list.length == 0 || highest_bid == 0)
					{//incorrect input
						var ob_rv = {"type":1, "desc" : "Auction round " + optionIn.bidRound + ". The auction had no clear winner. After round 1 there must be a winner. A bid of zero counts as no bid but at least one player must bid the minimum bid of $" + optionIn.minimum_bid + ". Otherwise you can reset the auction to state-over, or cancel the auction, which means no one will get this property."};
						ob_rv.buttonList = new Array({"name":'end bidding', "id":0, "buttonStyle":2});
						ob_rv.buttonList.push({"name":'reset', "id":1, "buttonStyle":4});
						ob_rv.buttonList.push({"name":'cancel', "id":2, "buttonStyle":5});
						ob_rv.bidRound = optionIn.bidRound;
						ob_rv.participantsList = optionIn.participantsList;
						ob_rv.minimum_bid = optionIn.minimum_bid;
						cb(ob_rv); return;
						
					}else
					{//genuine ty
						optionIn.bidRound++;
						var ob_rv = {"type":1, "desc" : "Auction round " + optionIn.bidRound + ". A bid of zero counts as no bid. The minimum bid is $" + highest_bid + ". Reset the auction to state-over, cancelling the auction means no one will get this property."};
						ob_rv.buttonList = new Array({"name":'end bidding', "id":0, "buttonStyle":2});
						ob_rv.buttonList.push({"name":'reset', "id":1, "buttonStyle":4});
						ob_rv.buttonList.push({"name":'cancel', "id":2, "buttonStyle":5});
						ob_rv.bidRound = optionIn.bidRound;
						ob_rv.participantsList = winners_list;
						ob_rv.minimum_bid = highest_bid;
						cb(ob_rv); return;
					}
				}
			} break;
			case 7: //has to pay other owner
			{
				if(optionIn == 0) //can pay and will pay rent
				{
					//find out how much is owed
					var property = this.properties_data(location.value);
					var owner = this.find_owner(property.id);
					var set_total = this.total_in_set(property.id);
					var owns_set = this.players[owner].owns_set(property.set, set_total);
					var their_property = this.players[owner].property_ob(property.id);
					var rent_owed = 0;
					if(!owns_set || their_property.houses == 0) rent_owed = property.rent;
					else if(their_property.hotels >= 1) rent_owed = property.renthotel;
					else rent_owed = new Array(property.rent1h, property.rent2h, property.rent3h, property.rent4h)[their_property.houses];
					
					//pay it
					this.money_change_animation(this.playersTurn, rent_owed, -1, function()
					{
						th.state = 4;
						th.play('You payed the rent!', cb);
						return;
					});
					return;
				}
			} break;

		}


	};
	
	//find the owner by property id, returns -1 if unowned
	this.find_owner = function(id)
	{
		var i = 0;
		for(; i < this.players.length; i++)
		{
			if(this.players[i].owns(id)) return i;
		}
		return -1;
	};
	
	this.map_data = function(position)
	{
		return this.gameData.map.list[position];
	};
	
	this.properties_data = function(id)
	{
		return this.gameData.properties.list[id];
	};
	
	
	this.total_in_set = function(id)
	{
		var set_id = this.properties_data(id).set;
		var i = 0;
		var count = 0;
		for(; i < this.gameData.properties.list.length; i++)
		{
			if(this.gameData.properties.list[i].set == set_id) count++;
		}
		return count;
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

	this.money_change_animation = function(playerId, amount, scalar, cb)
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
		st += '<div class="col-xs-2"><img class="BootStrapFitIm" src="ims/propertylogo.png"> x '+this.players[index].properties.length+'</div>';
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
