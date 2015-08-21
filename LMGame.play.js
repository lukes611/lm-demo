
//finalizes the turn by setting the state to newState, and calling turn.cb(param)
LMGame.prototype.finalize_turn = function(turn, newState, param)
{
	if(newState != undefined)
		this.state = newState;
	turn.cb(param);
};

//performs the same action as finalize_turn, but with this.play(param, turn.cb) instead of turn.cb(param)
LMGame.prototype.finalize_turn_recall = function(turn, newState, param)
{
	if(newState != undefined)
		this.state = newState;
	this.play(param, turn.cb);
};


//gives the player their options at the beginning of their turn
LMGame.prototype.play_begin = function(turn)
{
	this.finalize_turn(turn, 1, {
		"type" : 0,
		"buttonList" : [ 
			{
			"name": 'roll',
			'id' : 0,
			"buttonStyle": 1
			}
		],
		"desc" : 'roll the dice...'
	});
};

//give the player their options at the end of their turn
LMGame.prototype.play_end = function(turn)
{
	var msg = (turn.option == undefined )? "end your turn, or complete another task." : turn.option + ' You may now end your turn or complete some other task.';
	this.finalize_turn(turn, 5, {
		"type":0,
		"buttonList":[{
			'name': 'end turn',
			'id' : 0,
			"buttonStyle": 1
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
		turn.me.move_player(turn.me.playersTurn, dice_amount, function()
		{
			turn.me.finalize_turn_recall(turn, 2, undefined);
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
		turn.finalize_turn(turn, 6, ob_rv);
		return;
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
			}else //they have to pay rent, goto rent paying state 7:
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
	}else //if land on non property (must implement more...)
	{
		this.nextPlayer();
		this.state=0;
		this.play(undefined, turn.cb);
	}
};

//changes to next players turn, and re-calls play
LMGame.prototype.play_next_players_turn = function(turn)
{
	this.nextPlayer();
	this.finalize_turn_recall(turn, 0, undefined);
};



LMGame.prototype.play = function(optionIn, cb)
{
	var player = this.current_player();
	var location = this.map_data(player.position);
	var th = this;
	
	var turn = {
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
