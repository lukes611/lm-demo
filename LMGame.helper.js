
LMGame.prototype.player_purchase_options = function(playerId, propId)
{
	var player = this.players[playerId];
	var property = this.properties_data(propId);
	var prop_ = player.property_ob(propId);
	var rv = [];
	if(prop_.hotels == 1) return rv;
	if(prop_.houses == 4)
	{
		rv.push({
			desc : '1 x hotel ($' + property.hotelCost + ')',
			cost : property.hotelCost,
			new_num_houses : 0,
			new_num_hotels : 1,
			property_id : propId
		});
		return rv;
	}
	for(i = 1; i <= 4-prop_.houses; i++)
	{
		var plural_houses = (i==1) ? 'house' : 'houses';
		rv.push(
		{
			desc : '' + i + ' x ' + plural_houses + ' ($' + (i * property.houseCost) + ')',
			cost : property.houseCost*i,
			new_num_houses : prop_.houses + i,
			new_num_hotels : 0,
			property_id : propId
		});
	}
	var rh = (4-prop_.houses); //required number of houses
	var plural_houses_f = (rh==1) ? 'house' : 'houses';
	rv.push({
		desc : '' + rh + ' x houses + 1 x hotel ($' + (rh * property.houseCost + property.hotelCost) + ')',
		cost : (rh * property.houseCost + property.hotelCost),
		new_num_houses : 0,
		new_num_hotels : 1,
		property_id : propId
	});
	return rv;
};

LMGame.prototype.properties_player_can_purchase = function(playerId)
{
	var rv = [];
	var i = 0;
	var player = this.players[playerId];
	
	for(; i < this.gameData.properties.list.length; i++)
	{
		var property = this.properties_data(i);
		//for debugging
		//var p = this.properties_data(i);
		//var nis = this.total_in_set(i);
		//var ownz = player.owns(i);
		/*if(ownz)
		{
			console.log('player: ' + player.name + ' owns ' + p.name);
			console.log('num in set ' + nis + ' owns set?: ' + player.owns_set(p.set,nis));
			
		}*/
		//end debugging
		if(player.owns(i) && player.owns_set(property.set, this.total_in_set(i)))// && !player.property_ob(i).isMortgaged)
			rv.push(i);
	}
	return rv;
};

//finds the owner of a property by property id, returns -1 if unowned
LMGame.prototype.find_owner = function(id)
{
	var i = 0;
	for(; i < this.players.length; i++)
	{
		if(this.players[i].owns(id)) return i;
	}
	return -1;
};

//returns the map data given a position
LMGame.prototype.map_data = function(position)
{
	return this.gameData.map.list[position];
};


//gets the property data based on the property id
LMGame.prototype.properties_data = function(id)
{
	return this.gameData.properties.list[id];
};

//returns the amount you should move to get to a spot which is around yoy (either forwards x: returns x or backwards y: move back y spaces)
LMGame.prototype.get_closest_route = function(current_position, new_position)
{
	var dist1 = 0, dist2 = 0;
	if(current_position > new_position) //if new position is behind, check the distances fw && bw
	{
		dist1 = (39-current_position) + new_position;
		dist2 = -(current_position - new_position);
	}else
	{
		dist1 = new_position - current_position;
		dist2 = -(current_position + (39-new_position));
	}
	return (Math.abs(dist1) < Math.abs(dist2)) ? dist1 : dist2;
	
};

//retrieves the property with a specified property type "type" which is the closest to current_position
LMGame.prototype.get_closest_property_type = function(current_position, type)
{
	var set = false;
	var rv = {
		location : -1,
		move_amount : 0
	};
	var len = this.gameData.map.list.length;
	var i = (current_position+1) % len;
	var j = 0;
	for(var j = 0;j < len; j++, i = (i+1)%len)
	{
		if(this.gameData.map.list[i].type == 0 && current_position != i)
		{
			var property = this.properties_data(this.gameData.map.list[i].value);
			if(property.type == type)
			{
				//console.log(this.gameData.map.list[i].value);
				//console.log(this.gameData.map.list[i].name);
				if(property.type == type)
				{
					rv.location = i;
					rv.move_amount = j+1;
					break;
				}
			}
		}
	}
	return rv;
};

//returns the amount you should move (only positive) to get to a spot which is around yoy (either forwards x: returns x or backwards y: move back y spaces)
LMGame.prototype.get_closest_route_advance = function(current_position, new_position)
{
	if(current_position > new_position) //if new position is behind, check the distances fw && bw
	{
		return (40-current_position) + (new_position);
	}
	return new_position - current_position;
};

//returns the total number of properties in the same set as the property indicated by id
LMGame.prototype.total_in_set = function(id)
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

//changes turn to next player
LMGame.prototype.nextPlayer = function()
{ 
	this.playersTurn = (this.playersTurn+1) % this.players.length;
};

//returns the object representing the current player
LMGame.prototype.current_player = function()
{
	return this.players[this.playersTurn];
};