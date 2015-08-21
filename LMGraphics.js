


function LMGraphics(canvasName, w, h, gameData)
{
	this.canvasName = canvasName;
	this.canvas = document.getElementById(this.canvasName);
	this.context = this.canvas.getContext('2d');
	this.w = w;
	this.h = h;
	this.backgroundColor = 'black';
	this.gameData = gameData;

	this.clear = function()
	{
		//this.context.beginPath();
		this.context.fillStyle = this.backgroundColor;
		this.context.fillRect(0,0,this.w,this.h);
		//this.context.rect(0, 0, this.w, this.h);

	};

	this.clear_small = function()
	{
		//this.context.beginPath();
		//this.context.rect(0, 0, this.w, this.h);
		this.context.fillStyle = this.backgroundColor;
		this.context.fillRect(this.box.x,this.box.y,this.box.width,this.box.height);
	};

	this.clear_vsmall = function()
	{
		//this.context.beginPath();
		//this.context.rect(0, 0, this.w, this.h);
		this.context.fillStyle = this.backgroundColor;
		this.context.fillRect(this.box.x,this.box.y,this.box.width,this.boxes[0].w);
		this.context.fillRect(this.box.x,this.box.y,this.boxes[0].w,this.box.height);
		this.context.fillRect(this.box.x,this.box.y + (this.box.height-this.boxes[0].h),this.box.width,this.boxes[0].w);
		this.context.fillRect(this.box.x + (this.box.width - this.boxes[0].w),this.box.y,this.boxes[0].w,this.box.height);
	};

	this.clear_dice = function()
	{
		var size = this.box.width * 0.1;
		var extra = size * 0.1;
		var xf = this.box.x + this.box.width * 0.4 - extra;
		var yf = this.box.y + this.box.height * 0.2 - extra;
		this.context.fillStyle = this.backgroundColor;
		this.context.fillRect(xf,yf,size*2 + extra * 3,size*2 + extra*2);
	};

	this.drawLine = function(x1, y1, x2, y2, color)
	{
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.lineWidth = 1;
		// set line color
		this.context.strokeStyle = color;
		this.context.stroke();
	};

	this.drawRect = function(x, y, wid, hei, color)
	{
		this.drawLine(x, y, x + wid, y, color);
		this.drawLine(x, y + hei, x + wid, y + hei, color);
		this.drawLine(x, y, x, y + hei, color);
		x += wid;
		this.drawLine(x, y, x, y + hei, color);

	};

	this.drawCircle = function(x, y, rad, color)
	{
		this.context.beginPath();
		this.context.arc(x, y, rad, 0, 2 * Math.PI, false);
		this.context.lineWidth = 1;
		this.context.strokeStyle = color;
		this.context.stroke();
	}

	this.drawDice = function(sel, num)
	{
		if(sel == 0)
		{
			this.draw_image_fast(this.dice_settings.p1.x, this.dice_settings.p1.y, this.list_of_dice_ims[num-1].canvas);
		}else
		{
			this.draw_image_fast(this.dice_settings.p2.x, this.dice_settings.p2.y, this.list_of_dice_ims[num-1].canvas);
		}
	};


	this.draw_image = function(x,y,type)
	{
		//var wh = 0.3 * this.boxes[0].w;
		var imageObj = new Image();
		var cont = this.context;
		var size = this.player_icon_size;
		imageObj.onload = function()
		{
			cont.drawImage(imageObj, x, y, size, size);
		};
		imageObj.src = 'ims/'+type+'.png';

	};

	this.draw_icon_fast = function(x,y,index)
	{
		this.context.drawImage(this.list_of_icons[index].canvas, x, y);
	};

	this.draw_image_fast = function(x,y,canv)
	{
		this.context.drawImage(canv, x, y);
	};

	this.draw_image_full_path = function(x,y,size,fp)
	{
		//var wh = 0.3 * this.boxes[0].w;
		var imageObj = new Image();
		var cont = this.context;
		imageObj.onload = function()
		{
			cont.drawImage(imageObj, x, y, size, size);
		};
		imageObj.src = fp;

	};
	
	this.draw_image_full_path_size = function(x,y,w,h,fp)
	{
		//var wh = 0.3 * this.boxes[0].w;
		var imageObj = new Image();
		var cont = this.context;
		imageObj.onload = function()
		{
			cont.drawImage(imageObj, x, y, w, h);
		};
		imageObj.src = fp;

	};

	this.find_icon_index = function(type)
	{
		var i = 0;
		for(; i < this.list_of_icons.length; i++)
		{
			if(this.list_of_icons[i].name == type){ return i;}
		}
		return -1;
	};


	this.load_icon_canv_object = function(size, name, cb)
	{
		var buf = document.createElement('canvas');
		buf.width = size;
		buf.height = size;
		var newOb = {
			'name' : name,
			'canvas' : buf
		};
		var imageObj = new Image();
		var cont = newOb.canvas.getContext('2d');
		imageObj.onload = function()
		{
			cont.drawImage(imageObj, 0, 0, size, size);
			cb(newOb);
		};
		imageObj.src = 'ims/'+name+'.png';
	};

	this.load_generic_canv_object = function(width, height, name, path_name, cb)
	{
		var buf = document.createElement('canvas');
		buf.width = width;
		buf.height = height;
		var newOb = {
			'name' : name,
			'canvas' : buf,
			'w' : width,
			'h' : height
		};
		var imageObj = new Image();
		var cont = newOb.canvas.getContext('2d');
		imageObj.onload = function()
		{
			cont.drawImage(imageObj, 0, 0, width, height);
			cb(newOb);
		};
		imageObj.src = path_name;
	};

	this.setup_dice_graphics = function()
	{
		var size = Math.floor(this.box.width * 0.1);
		var extra = size + size * 0.1;
		var xf1 = Math.floor(this.box.x + this.box.width * 0.4);
		var yf1 = Math.floor(this.box.y + this.box.height * 0.2);
		var xf2 = Math.floor(this.box.x + this.box.width * 0.4 + extra);
		var yf2 = Math.floor(this.box.y + this.box.height * 0.2);
		this.dice_settings = {
			'size' : size,
			'p1' : {'x': xf1, 'y': yf1},
			'p2' : {'x': xf2, 'y': yf2}
		};
	};

	this.draw_other_icon = function(boxNumber, name)
	{
		var angle = 0.0;
		if(boxNumber >= 1 && boxNumber <= 10)
			angle = 90.0;
		else if(boxNumber >= 11 && boxNumber <= 20)
			angle = 180.0;
		else if(boxNumber >= 21 && boxNumber <= 30)
			angle = 270.0;
		this.context.save();
		this.context.translate(Math.round(this.boxes[boxNumber].x + this.boxes[boxNumber].w * 0.5), Math.round(this.boxes[boxNumber].y + this.boxes[boxNumber].h * 0.5));
		this.context.rotate(angle * Math.PI / 180.0);
		this.context.translate(-Math.round(this.other_icons[name].w*0.5), -Math.round(this.other_icons[name].h*0.5));
		this.draw_image_fast(0, 0, this.other_icons[name].canvas);
		this.context.restore();
	};

	this.init = function()
	{
		var aw = Math.floor(0.98 * this.h);
		this.box = {
			'x' : Math.floor((this.w-aw)*0.5),
			'y' : Math.floor((this.h-aw)*0.5),
			'width' : aw,
			'height' : aw
		};

		this.bottom_corner = {'x' : this.box.x, 'y' : this.box.y + this.box.height};

		this.boxes = new Array(39);
		this.sub_boxes = new Array();
		var wh1 = aw * 0.13; //wh2 is 63% of the size of wh1
		var wh2 = (aw-(wh1*2))/9;
		this.boxes[0] = {'x':this.bottom_corner.x, 'y':Math.floor(this.bottom_corner.y-wh1), 'w':Math.floor(wh1),'h':Math.floor(wh1), 't':0};
		this.boxes[10] = {'x':this.box.x, 'y':this.box.y, 'w':Math.floor(wh1),'h':Math.floor(wh1),'t':0};
		this.boxes[20] = {'x':this.box.x+Math.floor(this.box.width-wh1), 'y':this.box.y, 'w':Math.floor(wh1),'h':Math.floor(wh1),'t':0};
		this.boxes[30] = {'x':this.boxes[20].x, 'y':Math.floor(this.box.y+(this.box.height-wh1)), 'w':Math.floor(wh1),'h':Math.floor(wh1),'t':0};
		var i = 0;

		var miniBoxSize = {'w' : Math.floor(wh2 * 0.8), 'h' : Math.floor(wh1 * 0.13), 'ft' : {}};
		miniBoxSize.ft.x = Math.floor(wh2 * 0.1);
		miniBoxSize.ft.y = Math.floor(wh1 * 0.08);

		for(i = 1; i <= 9; i++)
		{
			this.boxes[i] = {'x':this.boxes[0].x, 'y':Math.floor(this.boxes[0].y-wh2*i), 'w':Math.floor(wh1),'h':Math.floor(wh2), 't':0};
			this.boxes[10+i] = {'x':Math.floor(this.boxes[10].x+wh1+(wh2*(i-1))), 'y':this.boxes[10].y, 'w':Math.floor(wh2),'h':Math.floor(wh1),'t':1};
			this.boxes[20+i] = {'x':this.boxes[20].x,'y':Math.floor(this.boxes[20].y+(wh1)+(wh2*(i-1))),'w':Math.floor(wh1),'h':Math.floor(wh2),'t':0};
			this.boxes[30+i] = {'x':Math.floor(this.boxes[30].x-(wh2*i)), 'y':this.boxes[30].y, 'w':Math.floor(wh2), 'h':Math.floor(wh1),'t':1};
			if(this.gameData.map.list[i].type == 0)
			{
				var prop1 = this.gameData.properties.list[this.gameData.map.list[i].value];

				if(prop1.type == 0)
				{
					this.sub_boxes.push({'x' : this.boxes[i].x + (wh1) - (miniBoxSize.ft.y + miniBoxSize.h),
					'y' : this.boxes[i].y + (miniBoxSize.ft.x), 'w' : miniBoxSize.h, 'h' : miniBoxSize.w, 'r' : prop1.r, 'g' : prop1.g, 'b' : prop1.b});
				}
			}
			if(this.gameData.map.list[i+10].type == 0)
			{
				var prop2 = this.gameData.properties.list[this.gameData.map.list[i+10].value];
				if(prop2.type == 0)
				{
					this.sub_boxes.push({'x' : this.boxes[10+i].x + miniBoxSize.ft.x,
					'y' : (this.boxes[10+i].y + wh1) - (miniBoxSize.ft.y + miniBoxSize.h), 'w' : miniBoxSize.w, 'h' : miniBoxSize.h, 'r' : prop2.r, 'g' : prop2.g, 'b' : prop2.b});
				}
			}
			if(this.gameData.map.list[i+20].type == 0)
			{
				var prop3 = this.gameData.properties.list[this.gameData.map.list[i+20].value];
				if(prop3.type == 0)
				{
					this.sub_boxes.push({'x' : this.boxes[i+20].x + miniBoxSize.ft.y,
					'y' : this.boxes[i+20].y + (miniBoxSize.ft.x), 'w' : miniBoxSize.h, 'h' : miniBoxSize.w, 'r' : prop3.r, 'g' : prop3.g, 'b' : prop3.b});
				}
			}
			if(this.gameData.map.list[i+30].type == 0)
			{
				var prop4 = this.gameData.properties.list[this.gameData.map.list[i+30].value];
				if(prop4.type == 0)
				{
					this.sub_boxes.push({'x' : this.boxes[30+i].x + miniBoxSize.ft.x,
					'y' : this.boxes[30+i].y + miniBoxSize.ft.y, 'w' : miniBoxSize.w, 'h' : miniBoxSize.h, 'r' : prop4.r, 'g' : prop4.g, 'b' : prop4.b});
				}
			}
		}
		this.player_icon_size = Math.floor(this.boxes[0].w * 0.28);
		this.list_of_icons = new Array();
		var list_of_icon_names = ['dog','car', 'hat', 'boot'];
		var i = 0;
		var th = this;
		(function tmp_loop()
		{
			if(i >= list_of_icon_names.length)
			{
				return;
			}
			th.load_icon_canv_object(th.player_icon_size, list_of_icon_names[i], function(newOb)
			{
				i++;
				th.list_of_icons.push(newOb);
				tmp_loop();
			});

		})();

		this.setup_dice_graphics();

		this.list_of_dice_ims = new Array();
		var j = 1;
		var th2 = this;
		(function tmp_loop_j()
		{
			if(j >= 7){ return; }
			th.load_generic_canv_object(th.dice_settings.size, th.dice_settings.size, ''+j,
			'ims/dice/' + j + '.png', function(input)
			{
				j++;
				th.list_of_dice_ims.push(input);
				tmp_loop_j();
			});
		})();
		
		var other_icons_name_list = ['chance', 'commchest', 'electriccompany', 'incometax', 'supertax', 'train', 'waterworks'];
		this.other_icons = {};
		var ii = 0;
		(function tmp_loop_ii()
		{
			if(ii >= other_icons_name_list.length) { return; }
			th.load_generic_canv_object(Math.round(wh2*0.9), Math.round(wh1*.9), other_icons_name_list[ii],
			'ims/' + other_icons_name_list[ii] + '.png', function(input)
			{
				th.other_icons[other_icons_name_list[ii]] = input;
				ii++;
				tmp_loop_ii();
			});
		})();
	};

	this.drawBG = function()
	{
		this.drawRect(this.box.x, this.box.y, this.box.width, this.box.height, 'white');

		var i = 0;
		for(; i < 40; i++){ if(this.boxes[i] == undefined){ continue;}
		this.drawRect(this.boxes[i].x, this.boxes[i].y, this.boxes[i].w, this.boxes[i].h, 'white');}
		
		for(i = 0; i < this.sub_boxes.length; i++)
		{
			var colorIn = 'rgb(' + this.sub_boxes[i].r + ',' + this.sub_boxes[i].g + ',' + this.sub_boxes[i].b + ')';
			this.drawRect(this.sub_boxes[i].x, this.sub_boxes[i].y, this.sub_boxes[i].w, this.sub_boxes[i].h, colorIn);
		}
		
		//draw chance
		this.draw_other_icon(7, 'chance');
		this.draw_other_icon(22, 'chance');
		this.draw_other_icon(36, 'chance');
		
		//draw community chest
		this.draw_other_icon(2, 'commchest');
		this.draw_other_icon(17, 'commchest');
		this.draw_other_icon(33, 'commchest');
		
		//draw waterworks/ electriccompany
		this.draw_other_icon(12, 'electriccompany');
		this.draw_other_icon(28, 'waterworks');
		
		//draw tax places
		this.draw_other_icon(4, 'incometax');
		this.draw_other_icon(38, 'supertax');
		
		//draw railways
		this.draw_other_icon(5, 'train');
		this.draw_other_icon(15, 'train');
		this.draw_other_icon(25, 'train');
		this.draw_other_icon(35, 'train');
	};

	this.get_loc = function(loc, pindex)
	{
		if(pindex == undefined){ pindex = 0; }
		var wh1 = this.boxes[0].w;
		var wh2 = this.boxes[1].h;
		var w = this.player_icon_size;
		var spacing = w * 0.08;
		var xfrom = this.boxes[loc].x + spacing;
		var yfrom = this.boxes[loc].y + spacing;


		var rows = 2,cols = 3;
		pindex %= 6;
		if(this.boxes[loc].t == 1)
		{
			rows = 2;
			cols = 2;

		}
		var c = pindex % cols;
		var r = Math.floor(pindex / cols);
		return {'x':Math.floor(xfrom + c*(w+spacing)), 'y':Math.floor(yfrom+r*(w+spacing))};
	};


	this.draw_player = function(pos, idol, pindex)
	{
		var loc = this.get_loc(pos, pindex);
		var index_proper = this.find_icon_index(idol);
		if(index_proper < 0) { return; }
		this.draw_icon_fast(Math.floor(loc.x),Math.floor(loc.y), index_proper)

	};

	this.interpolate_loc = function(loc1, loc2, t)
	{
		return {
			'x' : loc1.x + (loc2.x-loc1.x)*t,
			'y' : loc1.y + (loc2.y-loc1.y)*t
		};
	};

	this.draw_playerf = function(pos, idol, pindex)
	{
		var iv = parseInt(pos);
		var t = pos - iv;
		iv %= this.boxes.length;
		var loc1 = this.get_loc(iv, pindex);
		var loc2 = this.get_loc((iv+1)%this.boxes.length, pindex);
		var loc3 = this.interpolate_loc(loc1, loc2, t);
		var index_proper = this.find_icon_index(idol);
		if(index_proper < 0) { return; }
		this.draw_icon_fast(Math.floor(loc3.x),Math.floor(loc3.y), index_proper);
	};


	this.init();

}
