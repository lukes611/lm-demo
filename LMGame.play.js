
//finalizes the turn by setting the state to newState, and calling turn.cb(param)
LMGame.prototype.finalize_turn = function(turn, newState, param)
{
	this.last_state = this.state;
	if(newState != undefined)
		this.state = newState;
	this.last_option = param;
	this.last_turn = turn;
	turn.cb(param);
};

//performs the same action as finalize_turn, but with this.play(param, turn.cb) instead of turn.cb(param)
LMGame.prototype.finalize_turn_recall = function(turn, newState, param)
{
	this.last_state = this.state;
	if(newState != undefined)
		this.state = newState;
	this.last_option = param;
	this.last_turn = turn;
	this.play(param, turn.cb);
};


//0: gives the player their options at the beginning of their turn
LMGame.prototype.play_begin = function(turn)
{
	if(turn.player.in_jail)
	{
		if(turn.player.turns_waited >= 3)
		{
			turn.player.turns_waited = 0;
			turn.player.in_jail = false;
		}
	}
	if(!turn.player.in_jail)
	{
		var ob_rv = {
			"type" : 0,
			"buttonList" : [ 
				{
				"name": 'roll',
				'id' : 0,
				"buttonStyle": 1
				}
			],
			"desc" : 'roll the dice...'
		};
		this.finalize_turn(turn, 1, ob_rv);
		return;
	}else
	{
		var post_plural = (turn.player.turns_waited == 1) ? '' : 's';
		var has_enough = turn.player.money >= 50;
		var ob_rv = {
			"type" : 0,
			"buttonList" : [ 
				{
				"name": 'roll',
				'id' : 0,
				"buttonStyle": 1
				}
			],
			"desc" : 'You are in Jail. You have waited ' + turn.player.turns_waited + ' time'+post_plural+'. Roll doubles for your chance to escape'
		};
		if(has_enough && turn.player.turns_waited < 2)
		{
			ob_rv.desc += ', or pay $50';
			ob_rv.buttonList.push({
				"name": 'pay $50',
				'id' : 1,
				"buttonStyle": 1
			});
		}
		ob_rv.desc += '.';
		this.finalize_turn(turn, 14, ob_rv);
		return;
	}
};

//4: give the player their options at the end of their turn
LMGame.prototype.play_end = function(turn)
{
	var msg = (turn.option == undefined )? "end your turn, or complete another task." : turn.option + ' You may now end your turn or complete some other task.';
	this.finalize_turn(turn, 15, {
		"type":0,
		"buttonList":[{
			'name': 'end turn',
			'id' : 0,
			"buttonStyle": 1
		},
		{
			'name': 'purchase property',
			'id' : 1,
			"buttonStyle": 2
		},
		{
			name : 'trade',
			id : 2,
			buttonStyle : 3
		}],
		"desc" : msg
	});
};


//roll dice and move
LMGame.prototype.play_rollNmove = function(turn)
{
	this.roll_animation(function()
	{
		turn.me.dice.roll();
		var dice_amount = turn.me.dice.total();
		var old_position = turn.player.position;
		var new_position = (turn.player.position+dice_amount) % turn.me.gameData.map.list.length;
		turn.me.move_player(turn.me.playersTurn, dice_amount, function()
		{
			if(new_position < old_position)
			{
				turn.me.money_change_animation(turn.turn, 200, 1, function()
				{
					turn.me.finalize_turn_recall(turn, 2, 'You passed GO! and collected $200.');
				});
			}else
			{
				turn.me.finalize_turn_recall(turn, 2, undefined);
			}
			
		});
	});
};

//choose to purchase a property or auction it off
LMGame.prototype.play_buy_or_auction = function(turn)
{
	if(turn.option == 0) //purchase
	{
		this.money_change_animation(this.playersTurn, turn.property.price, -1, function()
		{
			turn.player.buy(turn.location.value, turn.property);
			turn.me.finalize_turn_recall(turn, 4, turn.player.name + ' got a new property: ' + turn.property.name + '.');
		});
	}else if(turn.option == 1)//auction
	{
		var ob_rv = {
			"type":1,
			"desc" : "auction time!, please enter a bid. A bid of zero counts as no bid. The minimum bid is $0."
		};
		ob_rv.buttonList = new Array({
			"name":'end bidding',
			"id":0,
			"buttonStyle":2
		});
		ob_rv.bidRound = 1;
		ob_rv.participantsList = new Array();
		ob_rv.minimum_bid = 1;
		var i = 0;
		for(; i < this.players.length; i++)
		{
			if(this.players[i].has_enough(1))
				ob_rv.participantsList.push(i);
		}
		this.finalize_turn(turn, 6, ob_rv);
	}else
	{ 
		this.play_next_players_turn(turn);
	}
	
};

//Give player options in their new position after they move
LMGame.prototype.play_post_move_options = function(turn)
{
	if(turn.location.type == 0) //is property: buy or pay rent
	{
		if(turn.owner == undefined) //no owner: can purchase
		{
			var ob_rv = {
				"type":0,
				"desc":'you landed on: ' + turn.location.name,
				"buttonList":new Array()
			};
			//if player has enough money: let them have the option of purchasing
			if(turn.player.has_enough(turn.property.price)) 
			{
				ob_rv.buttonList.push({
					'name':'buy ($' + turn.property.price + ')' ,
					'id':0,
					'buttonStyle':2
				});
			}
			ob_rv.buttonList.push({
				'name': 'auction',
				'id' : 1,
				"buttonStyle":5
			});
			this.finalize_turn(turn, 3, ob_rv);
		}else //someone owns this property
		{
			if(turn.owner_index == this.playersTurn) //if they own it, goto end state
			{
				this.finalize_turn_recall(turn, 4, 'You landed on your own property.');
			}else if(turn.property.type == 1) //if land on train station
			{
				var double_the_rent = false;
				var p_double = '';
				if(this.last_turn.double_the_rent != undefined && this.last_turn.double_the_rent == true)
				{
					double_the_rent = true;
					p_double = 'double twice the rent. Pay ';
				}
				var num_stations = turn.owner.number_of_stations_owned();
				var amount = [turn.property.rent1h, turn.property.rent1h, turn.property.rent2h, turn.property.rent3h, turn.property.rent4h][num_stations];
				amount = (double_the_rent) ? amount * 2 : amount;
				var post_plural = (num_stations == 1) ? '' : 's';
				var ob_rv = {
					"type":0,
					"desc":'you landed on: ' + turn.location.name + '. Which is owned by ' + turn.owner.name + '. ' + turn.owner.name + ' owns ' + num_stations + ' Station'+post_plural+'. Pay '+p_double+'$' + amount + '.',
					'buttonList':new Array()
				};
				ob_rv.buttonList.push({
						'name': 'pay rent ($' + amount + ')',
						'id' : 0,
						"buttonStyle":1
					});
				turn.station_rent_cost = amount;
				this.finalize_turn(turn, 7, ob_rv);
				return;
			}else if(turn.property.type == 2) //lands on a utility
			{
				var num_utilities = turn.owner.number_of_utilities_owned();
				var post_plural = (num_utilities == 1) ? 'y' : 'ies';
				var amount = [turn.property.rent1h, turn.property.rent1h, turn.property.rent2h][num_utilities];
				var description = 'you landed on: ' + turn.location.name + '. Which is owned by ' + turn.owner.name + '. ' + turn.owner.name + ' owns ' + num_utilities + ' Utilit'+post_plural+
					', roll the dice and pay ' + amount + ' times the value rolled.';
				if(this.last_turn.double_the_rent != undefined && this.last_turn.double_the_rent == true)
				{
					description = 'you landed on: ' + turn.location.name + '. Which is owned by ' + turn.owner.name + '. Pay ' + turn.owner.name + ' 10 times the amount rolled.';
					amount = 10;
				}
				
				var ob_rv = {
					"type":0,
					"desc": description,
					'buttonList':new Array()
				};
				ob_rv.buttonList.push({
						'name': 'roll',
						'id' : 0,
						"buttonStyle":1
					});
				turn.utility_rent_amount = amount;
				this.finalize_turn(turn, 11, ob_rv);
				return;
			}else //they have to pay rent on a normal property, goto rent paying state 7:
			{
				var owns_set = turn.owner.owns_set(turn.property.set, turn.set_total);
				var their_property = turn.owner.property_ob(turn.property.id);
				var ob_rv = {
					"type":0,
					"desc":'you landed on: ' + turn.location.name + '. Which is owned by ' + turn.owner.name + '.',
					'buttonList':new Array()
				};
				if(!owns_set || their_property.houses == 0) //pay normal rate
				{
					ob_rv.buttonList.push({
						'name': 'pay rent ($' + turn.property.rent + ')',
						'id' : 0,
						"buttonStyle":1
					});
				}else if(their_property.hotels >= 1) //pay hotel rate
				{
					ob_rv.desc += ' ' + turn.owner.name + ' owns a hotel!';
					ob_rv.buttonList.push({
						'name': 'pay rent ($' + turn.property.renthotel + ')',
						'id' : 0,
						"buttonStyle":1
					});
				}else //pay the correct house rate
				{
					ob_rv.desc += ' ' + turn.owner.name + ' owns ' + (their_property.houses == 1)? 'a house' : '' + their_property.houses + ' houses!';
					ob_rv.buttonList.push({
						'name': 'pay rent ($' + turn.property.renthotel + ')',
						'id' : 0, "buttonStyle":1
					});
				}
				this.finalize_turn(turn, 7, ob_rv);
			}
			
		}
	}else if(turn.location.type == 4 || turn.location.type == 8) //landed on income tax
	{
		var msg = (turn.location.type == 4)?
			'Income tax. Pay $200.'
			:'Super Tax. Pay $100.';
		var ob_rv = {
			type : 0,
			desc : msg,
			buttonList : [
				{
					name : "pay",
					id : 0,
					buttonStyle : 1
				}
			]
		};
		this.finalize_turn(turn, 8, ob_rv);
	}else if(turn.location.type == 2 || turn.location.type == 3) //lands on chance or community chest
	{
		var type = turn.location.type == 2 ? 'community chest' : 'chance';
		var msg = 'You landed on ' + type + '.';
		var ob_rv = {
			type : 0,
			desc : msg,
			buttonList : [
				{
					name : "pick up card",
					id : 0,
					buttonStyle : 1
				}
			]
		};
		this.finalize_turn(turn, 9, ob_rv);
	}else if(turn.location.type == 7) //go to jail
	{
		this.finalize_turn_recall(turn, 12); //send to jail
		return;
	}else //if land on non property (must implement more...)
	{
		this.finalize_turn_recall(turn, 4, 'Options for Tile: ' + turn.location.name + ' not yet implemented.');
		this.nextPlayer();
		this.state=0;
		this.play(undefined, turn.cb);
	}
};

//pay tax
LMGame.prototype.play_pay_tax = function(turn)
{
	this.money_change_animation(turn.turn, turn.location.value, -1, function()
	{
		turn.me.finalize_turn_recall(turn, 4, 'Tax Payed.');
	});
};

//5: changes to next players turn, and re-calls play
LMGame.prototype.play_next_players_turn = function(turn)
{
	this.nextPlayer();
	this.finalize_turn_recall(turn, 0, undefined);
};

//process the input from an auction
LMGame.prototype.play_process_auction_input = function(turn)
{
	//process auction input, send for another auction OR purchase for player
	//cases: 0: clear winner, purchase their property, 1: zero winners do nothing, 2: multiple winners
	if(turn.option.id == 1)
	{
		//reset bid
		this.finalize_turn_recall(turn, 3, 1);
		return;
	}else if(turn.option.id == 2)
	{
		//cancel the bid
		this.finalize_turn_recall(turn, 4, 'Auction Cancelled. No one gets the property.');
		return;
	}
	var i = 0;
	var highest_bid = -1;
	var winners_list = [];
	var set_vals = false;
	for(; i < this.last_option.participantsList.length; i++)
	{
		//if player has enough money
		var p = this.players[this.last_option.participantsList[i]];
		var bid = turn.option.auction_values[i];
		if(!p.has_enough(bid) || bid < this.last_option.minimum_bid)
			continue;
		if(turn.option.auction_values[i] > highest_bid || !set_vals)
		{
			winners_list.length = 0; //clear array
			winners_list.push(this.last_option.participantsList[i]);
			highest_bid = turn.option.auction_values[i];
			set_vals = true;
		}else if(turn.option.auction_values[i] == highest_bid)
			winners_list.push(this.last_option.participantsList[i]);
	}
	
	if((winners_list.length == 0 || highest_bid == 0) && this.last_option.bidRound == 1) //no one won
	{
		this.finalize_turn_recall(turn, 4, 'Nobody won at the auction. No one gets the property.');
		return;
	}else if(winners_list.length == 1)//somebody won, let players know, before ending turn
	{
		this.money_change_animation(winners_list[0], highest_bid, -1, function()
		{
			turn.me.players[winners_list[0]].buy(turn.location.value, turn.property);
			turn.me.finalize_turn_recall(turn, 4, turn.me.players[winners_list[0]].name + ' won the auction! with a bid of $' + highest_bid);
			return;
		});
	}else
	{
		if(highest_bid < this.last_option.minimum_bid || winners_list.length == 0 || highest_bid == 0)
		{//incorrect input
			var ob_rv = {"type":1, "desc" : "Auction round " + this.last_option.bidRound + ". The auction had no clear winner. After round 1 there must be a winner. A bid of zero counts as no bid but at least one player must bid the minimum bid of $" + this.last_option.minimum_bid + ". Otherwise you can reset the auction to state-over, or cancel the auction, which means no one will get this property."};
			ob_rv.buttonList = [{
				"name":'end bidding',
				"id":0,
				"buttonStyle":2
			}];
			ob_rv.buttonList.push({
				"name":'reset',
				"id":1,
				"buttonStyle":4
			});
			ob_rv.buttonList.push({
				"name":'cancel',
				"id":2,
				"buttonStyle":5
			});
			ob_rv.bidRound = this.last_option.bidRound;
			ob_rv.participantsList = this.last_option.participantsList;
			ob_rv.minimum_bid = this.last_option.minimum_bid;
			this.finalize_turn(turn, undefined, ob_rv);
			return;
		}else
		{
			//genuine tie
			var ob_rv = {
				"type":1,
				"desc" : "Auction round " + (this.last_option.bidRound+1) + ". A bid of zero counts as no bid. The minimum bid is $" + highest_bid + ". Reset the auction to state-over, cancelling the auction means no one will get this property."
			};
			ob_rv.buttonList = [{
				"name":'end bidding',
				"id":0,
				"buttonStyle":2
			},{
				"name":'reset',
				"id":1,
				"buttonStyle":4
			},{
				"name":'cancel',
				"id":2,
				"buttonStyle":5
			}];
			ob_rv.bidRound = this.last_option.bidRound;
			ob_rv.participantsList = winners_list;
			ob_rv.minimum_bid = highest_bid;
			this.finalize_turn(turn, undefined, ob_rv);
		}
	}
};

//player pays the rent
LMGame.prototype.play_pay_rent = function(turn)
{
	if(turn.option == 0) //can pay and will pay rent
	{
		if(turn.property.type == 0) //if type is normal property
		{
			//find out how much is owed
			var owns_set = turn.owner.owns_set(turn.property.set, turn.set_total);
			var their_property = turn.owner.property_ob(turn.property.id);
			var rent_owed = 0;
			if(!owns_set || their_property.houses == 0) rent_owed = turn.property.rent;
			else if(their_property.hotels >= 1) rent_owed = turn.property.renthotel;
			else rent_owed = [
				turn.property.rent1h,
				turn.property.rent2h,
				turn.property.rent3h,
				turn.property.rent4h
			][their_property.houses];
			
			//pay it
			this.money_change_animation(this.playersTurn, rent_owed, -1, function()
			{
				turn.me.finalize_turn_recall(turn, 4, 'You payed the rent!');
			});
		}else if(turn.property.type == 1) //if paying rent on a station
		{
			var rent_owed = this.last_turn.station_rent_cost;
			//pay it
			this.money_change_animation(this.playersTurn, rent_owed, -1, function()
			{
				turn.me.finalize_turn_recall(turn, 4, 'You payed the rent!');
			});
		}else if(turn.property.type == 2) //pay rent at utility
		{
			var rent_owed = this.last_turn.utility_rent_cost;
			//pay it
			this.money_change_animation(this.playersTurn, rent_owed, -1, function()
			{
				turn.me.finalize_turn_recall(turn, 4, 'You payed the rent!');
			});
		}
	}
};

//pick up a single chance/community chest card
LMGame.prototype.play_pick_up_commchance = function(turn)
{
	//grab a random card from the list
	var type = turn.location.type == 2 ? 0 : 1;
	var i = 0;
	for(; i < this.gameData.cards.list.length; i++)
		if(this.gameData.cards.list[i].type == type) break;
	var card = this.gameData.cards.list.splice(2,1)[0]; //retrieve the card (should be i as first param)
	var button_msg = 'collect,pay,advance,,keep card,advance,advance,go to jail'.split(',')[card.func[0]];
	var ob_rv = {
		type : 0,
		desc : card.description,
		buttonList : [
			{
				name : button_msg,
				id : 0,
				buttonStyle : 1
			}
		],
		card : card
	};
	this.finalize_turn(turn, 10, ob_rv);
};

//handle a community chest or chance card
LMGame.prototype.play_commchance = function(turn)
{
	var card = this.last_option.card;
	
	var _end_ = function(param)
	{
		//place card back in deck
		turn.me.gameData.cards.list.push(card);
		//end turn
		turn.me.finalize_turn_recall(turn, 4, param);
	};
	
	//handle card consequences
	if(card.func[0] == 0) //collect money from the bank
	{
		this.money_change_animation(turn.turn, card.amount[0], 1, _end_);
	}else if(card.func[0] == 1) //pay money
	{
		if(card.transfer == 0)//pay bank
		{
			this.money_change_animation(turn.turn, card.amount[0], -1, _end_);
		}else if(card.transfer == 1) //pay other players
		{
			var i = 0;
			var players_to_process = [];
			for(; i < this.players.length; i++)
				if(i != turn.turn) players_to_process.push(i);
			i = 0;
			(function exchange_money()
			{
				if(i < players_to_process.length)
				{
					turn.me.money_player_exchange(turn.turn, players_to_process[i], card.amount[0], function()
					{
						i++;
						exchange_money();
					})
				}else
				{
					_end_();
				}
			})();
		}else if(card.transfer == 2) //pay per house / hotel
		{
			var buildings = turn.player.houses_hotels_count();
			this.money_change_animation(turn.turn, card.amount[0]*buildings.houses + card.amount[1]*buildings.hotels, -1, _end_);
		}
	}else if(card.func[0] == 2) //advance to new spot
	{
		if(card.location < 0) this.move_player(turn.turn, card.location, function()
		{
			turn.me.finalize_turn_recall(turn, 2);
			turn.me.gameData.cards.list.push(card);
		});
		else
		{
			var amount = this.get_closest_route_advance(turn.player.position, card.location);
			this.move_player(turn.turn, amount, function()
			{
				turn.me.finalize_turn_recall(turn, 2);
				turn.me.gameData.cards.list.push(card);
			});
		}
	}else if(card.func[0] == 4) //get out of jail free card...
	{
		turn.player.cards.push(card);
		turn.me.finalize_turn_recall(turn, 4, '"Get out of jail free" card kept');
	}else if(card.func[0] == 5) //advance to nearest station
	{
		//use get_closest_property_type function from LMGame.helper.js
		var rv = this.get_closest_property_type(turn.player.position, 1);
		this.move_player(turn.turn, rv.move_amount, function() //move to nearest station
		{
			turn.double_the_rent = true;
			turn.me.gameData.cards.list.push(card);
			turn.me.finalize_turn_recall(turn, 2); //replace this with either paying owner 2x amount or buying or nothing
			return;
		});
	}else if(card.func[0] == 6) //advance to nearest utility
	{
		var rv = this.get_closest_property_type(turn.player.position, 2);
		this.move_player(turn.turn, rv.move_amount, function() //move to nearest utility
		{
			turn.double_the_rent = true;
			turn.me.gameData.cards.list.push(card);
			turn.me.finalize_turn_recall(turn, 2);
		});
	}else if(card.func[0] == 7) //go to jail
	{
		this.finalize_turn_recall(turn, 13);
	}
	
};

//roll the dice and pay the rent
LMGame.prototype.play_roll_pay_utility_rent = function(turn)
{
	this.roll_animation(function()
	{
		turn.me.dice.roll();
		var dice_amount = turn.me.dice.total();
		var scalar = turn.me.last_turn.utility_rent_amount;
		var rent_owed = dice_amount * scalar;
		var ob_rv = {
			"type":0,
			"desc":'you rolled ' + dice_amount + '. Pay ' + scalar + ' times that amount in rent.',
			'buttonList':new Array()
		};
		ob_rv.buttonList.push({
				'name': 'pay rent ($' + rent_owed + ')',
				'id' : 0,
				"buttonStyle":1
			});
		turn.utility_rent_cost = rent_owed;
		turn.me.finalize_turn(turn, 7, ob_rv);
		return;
	});
};

//send player to jail
LMGame.prototype.play_send_to_jail = function(turn)
{
	var ob_rv = {
		"type":0,
		"desc":'Go Directly to Jail.',
		"buttonList":new Array()
	};
	ob_rv.buttonList.push({
		'name':'go to jail' ,
		'id':0,
		'buttonStyle':5
	});
	this.finalize_turn(turn, 13, ob_rv);
};

//move player to jail and set up next players turn
LMGame.prototype.play_move_to_jail = function(turn)
{
	var move_amount = this.get_closest_route_advance(turn.player.position, 10);
	this.move_player(turn.turn, move_amount, function()
	{
		turn.player.in_jail = true;
		turn.me.finalize_turn_recall(turn, 4, turn.player.name + ' is now in Jail.');
		return;
	});
};

//deal with jail move:
LMGame.prototype.play_pay_bail = function(turn)
{
	if(turn.option == 0) //roll your way out
	{
		this.roll_animation(function()
		{
			turn.me.dice.roll();
			if(turn.me.dice.val1 == turn.me.dice.val2) //doubles
			{
				turn.player.turns_waited = 0;
				turn.player.in_jail = false;
				turn.me.finalize_turn_recall(turn, 4, 'You rolled a doubles! You are Free!');
				return;
			}else
			{
				turn.player.turns_waited++;
				turn.me.finalize_turn_recall(turn, 4, 'No doubles sorry. Better luck next time.');
				return;
			}
		});

	}else //pay your way out
	{
		this.money_change_animation(turn.turn, 50, -1, function()
		{
			turn.player.turns_waited = 0;
			turn.player.in_jail = false;
			turn.me.finalize_turn_recall(turn, 4, 'You are Free!');
		});
	}
	
};

//15: the player has selected to end their move, purchase property, trade...
LMGame.prototype.play_additional_options = function(turn)
{
	//if player clicked end turn, end it as per usual
	if(turn.option == 0)
	{ 
		this.finalize_turn_recall(turn, 5, turn.option);
		return;
	}else if(turn.option == 1) //player wants to buy property
	{
		var ob_rv = {
			type:2,
			desc : "Select a property: ",
			buttonList : [{
				name : 'cancel',
				id : 1,
				buttonStyle : 5
			}]
		};
		//ob_rv.buttonList = new Array({"name":'end bidding', "id":0,"buttonStyle":2});
		var prop_ids = this.properties_player_can_purchase(turn.turn);
		ob_rv.properties = [];
		var i = 0;
		for(; i < prop_ids.length; i++)
			ob_rv.properties.push(this.properties_data(prop_ids[i]));
		turn.state_recall = this.last_state;
		this.finalize_turn(turn, 16, ob_rv);
	
	}else if(turn.option == 2) //player wants to trade (first select a player to trade with:
	{
		var ob_rv = {
			type:0,
			desc : "Select a player to trade with: ",
			buttonList : [{
				name : 'cancel',
				id : -1,
				buttonStyle : 5
			}]
		};
		turn.state_recall = this.last_state;
		var i = 0;
		var others = this.player_can_trade_with(turn.turn);
		for(; i < others.length; i++)
			ob_rv.buttonList.push(
			{
				name : others[i].name,
				id : i,
				buttonStyle : 3
			});
		turn.players_to_select = others;
		this.finalize_turn(turn, 19, ob_rv);
		return;
	}
};

//player selected to trade with:
LMGame.prototype.select_tradables_1 = function(turn)
{
	if(turn.option == -1)
	{
		this.finalize_turn_recall(turn, this.last_turn.state_recall);
		return;
	}else
	{
		turn.player_to_trade_with = this.last_turn.players_to_select[turn.option];
		var ob_rv = {
			type:4,
			desc : "Select your items you wish to trade to "+turn.player_to_trade_with.name+": ",
			buttonList : [{
				name : 'trade',
				id : 0,
				buttonStyle : 2
			}
			,{
				name : 'cancel',
				id : 1,
				buttonStyle : 5
			}]
		};
		ob_rv.state_recall = this.last_turn.state_recall;
		ob_rv.tradables = this.player_trade_options(turn.turn);
		turn.trablebles1 = ob_rv.trablebles;
		this.finalize_turn(turn, 20, ob_rv);
	}
};

//16: select property where to buy house
LMGame.prototype.play_property_select_for_house = function(turn)
{
	if(turn.option.option_id == 1)
	{
		this.finalize_turn_recall(turn, this.last_turn.state_recall);
		return;
	}else 
	{
		turn.state_recall = this.last_turn.state_recall;
		var selected_id = turn.option.selection;
		var property = this.last_option.properties[selected_id];
		turn.purchase_options = this.player_purchase_options(turn.turn, property.id);
		var ob_rv = {
			type:0,
			desc : "What would you like to buy at " + property.name + '?',
			buttonList : []
		};
		var i = 0;
		for(; i < turn.purchase_options.length; i++)
			ob_rv.buttonList.push({
				name : turn.purchase_options[i].desc,
				id : i,
				buttonStyle : 2
			});
		ob_rv.buttonList.push({
			name : 'cancel',
			id : -1,
			buttonStyle : 5
		});
		this.finalize_turn(turn, 17, ob_rv);
		//get the options they have... including cancelation of the current procedure
		//go to next state which applies those options... or cancel
	}
};

LMGame.prototype.play_buy_houses = function(turn)
{
	if(turn.option == -1)
	{
		this.finalize_turn_recall(turn,this.last_turn.state_recall);
		return;
	}else
	{
		turn.state_recall = this.last_turn.state_recall;
		turn.purchase_details = this.last_turn.purchase_options[turn.option];
		var can_afford = turn.player.has_enough(turn.purchase_details.cost);
		var property = this.properties_data(turn.purchase_details.property_id);
		var msg = (can_afford)? 'Purchasing ' + turn.purchase_details.desc + ' at ' + property.name + '. Go ahead with the purchase?' : 'You can\'t afford this option.';
		var other_button_msg = (can_afford)? 'no' : 'go back';
		var ob_rv = {
			type:0,
			desc : msg,
			buttonList : []
		};
		if(can_afford)
		{
			ob_rv.buttonList.push({
				id : 0,
				name : 'yes',
				buttonStyle : 2
			});
		}
		ob_rv.buttonList.push({
			id : 1,
			name : other_button_msg,
			buttonStyle : 5
		});
		this.finalize_turn(turn, 18, ob_rv);
	}
};

LMGame.prototype.play_post_house_purchase = function(turn)
{
	if(turn.option == 1)
	{
		this.finalize_turn_recall(turn,this.last_turn.state_recall);
		return;
	}
	
	//buy the house
	var pd = this.last_turn.purchase_details;
	this.money_change_animation(turn.turn, pd.cost, -1, function()
	{
		var prop = turn.player.property_ob(pd.property_id);
		prop.houses = pd.new_num_houses;
		prop.hotels = pd.new_num_hotels;
		turn.me.finalize_turn_recall(turn, turn.me.last_turn.state_recall);
	});
	
};

LMGame.prototype.play = function(optionIn, cb)
{
	
	var turn = {
		"current_state" : this.state,
		"turn" : this.playersTurn,
		"player" : this.current_player(),
		"me" : this,
		"cb" : cb,
		"option" : optionIn
	};
	
	turn.location = this.map_data(turn.player.position);
	if(turn.location.type == 0) //is a property
	{
		turn.property = this.properties_data(turn.location.value);
		turn.owner_index = this.find_owner(turn.location.value);
		if(turn.owner_index != -1)
		{
			turn.owner = this.players[turn.owner_index];
		}
		turn.set_total = this.total_in_set(turn.location.value)
	}
	
	switch(this.state)
	{
		case 0: /*the starting state*/ this.play_begin(turn); break;
		case 1: /*roll dice and move*/ this.play_rollNmove(turn); break;
		case 2:/*give player their options post move*/ this.play_post_move_options(turn); break;
		case 3: /*chose to purchase or not*/ this.play_buy_or_auction(turn); break;
		case 4: /*end turn...*/ this.play_end(turn); break;
		case 5: /*switch to new player state*/ this.play_next_players_turn(turn); break;			
		case 6: /*process auction input*/ this.play_process_auction_input(turn); break;
		case 7: /*pay rent*/ this.play_pay_rent(turn); break;
		case 8: /*pay tax*/ this.play_pay_tax(turn); break;
		case 9: /*pick up chance/community chest card*/ this.play_pick_up_commchance(turn); break;
		case 10: /*deal with chance/community chest card*/ this.play_commchance(turn); break;
		case 11: /*roll the dice to pay either 4x or 10x the rolled amount*/ this.play_roll_pay_utility_rent(turn); break;
		case 12: /*send player off to jail*/ this.play_send_to_jail(turn); break;
		case 13: /*send to jail part 2*/ this.play_move_to_jail(turn); break;
		case 14: /*pay to get out of jail with roll or payment*/ this.play_pay_bail(turn); break;
		case 15: /*other options... offer player additional
		options such as purchasing property*/ this.play_additional_options(turn); break;
		case 16: /*handle post choosing property for house state*/ this.play_property_select_for_house(turn); break;
		case 17: /*buy house*/ this.play_buy_houses(turn); break;
		case 18: /*post house purchase options*/ this.play_post_house_purchase(turn); break;
		case 19: /*select things to trade*/ this.select_tradables_1(turn); break;
	}


};
