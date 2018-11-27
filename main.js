var c,canvas;
var lines=[];
var frust=0;
var light=0;
var selected_line_index=0;
var disable_mousemove=false;
var key_flag1=true;
var key_flag2=false;
var switchMode=0;		//Fast/Fancy
var backColor=0;	//0-255  the gray range
var stepsResolution=100;

function toDeg(x){return 180*x/Math.PI;}
function toRad(x){return Math.PI*x/180}
function cos(deg){return Math.cos(toRad(deg));}
function sin(deg){return Math.sin(toRad(deg));}
function log(x){console.log(x);}
function aprox(x,y,err){ return Math.abs(x-y)<err; }
function normalize(x){
	x=x%360;
	if(x<0) x+=360;
	return x;
}
function translateX(x){
	//From screen system to internal axis
	return x;
}
function translateY(y){
	//From screen system to internal axis
	return canvas.height-y;
}
function map(nr,in_min, in_max, out_min, out_max) {
  return (nr - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
function opacityFunction(x){
	//The function for setting the opacity--power function...or I could use :a^x-1
	return Math.pow(x,2);
	//return Math.pow(2,x)-1;
}
function angleBetween(angle,pair){
	//Is this angle between the pair{low,high} of angles?
	if(pair.high>pair.low) return (pair.high>=angle && angle>=pair.low);
	return (pair.high>=angle || angle>=pair.low);
}
function specialPair(pair){
	//Is this a "weird" pair of angles? Meaning is it crossing the 0 limit?
	return pair.high<pair.low;
}
function intersectPairs(pair1,pair2){
	//Returns new pair or 0
	var flag1=angleBetween(pair1.low,pair2);
	var flag2=angleBetween(pair1.high,pair2);
	
	var flag3=angleBetween(pair2.low,pair1);
	var flag4=angleBetween(pair2.high,pair1);
	
	if(flag1 && flag2) return  pair2;
	if(flag3 && flag4) return  pair1;
	
	if( !((flag1 || flag2) && (flag3 || flag4) )   ) return 0;
	
	var flag5=specialPair(pair1);
	var flag6=specialPair(pair2);
	
	if(flag1){
		if(flag5 && flag6){
			return {low:Math.min(pair1.low,pair2.low),high:Math.max(pair1.high,pair2.high)};
		}
		if(!flag5 && !flag6){
			return {low:Math.min(pair1.low,pair2.low),high:Math.max(pair1.high,pair2.high)};
		}
		
		if(flag5){
			return {low:pair1.low,high:pair2.high};
		}
		if(flag6){
			return {low:pair2.low,high:pair1.high};
		}
	}
	
	if(flag2){
		if(flag5 && flag6){
			return {low:Math.min(pair1.low,pair2.low),high:Math.max(pair1.high,pair2.high)};
		}
		if(!flag5 && !flag6){
			return {low:Math.min(pair1.low,pair2.low),high:Math.max(pair1.high,pair2.high)};
		}
		
		if(flag5){
			return {low:pair1.low,high:pair2.high};
		}
		if(flag6){
			return {low:pair1.low,high:pair2.high};
		}
	}
	
	return 0;
}
function toggleTimer(mode){
	//0 stop Timer-have time to replace loop function; 1 slow Timer; 2 fast Timer;
	clearInterval(interval); 
	
	if(mode==0 || (mode!=1 && mode!=2) ) return;
	
	interval=setInterval(loop,(mode==1?1500:150));
}

function fillAdvanced(src,barriers){
	//The low and high angle..fill in between	
	var max_amount=400;
	var steps=stepsResolution;
	
	source=src.clone();
	source.x=translateX(source.x);
	source.y=translateY(source.y);
		
	for(var i=0;i<steps;i++){
		var r=(steps-i)*(max_amount/steps);
		
		//step=1;//opacityFunction(map(i,0,steps-1,0,1));
		var red=map( opacityFunction(map(i,0,steps-1,0,1)),0,1,backColor,255  );
		var blue=map( opacityFunction(map(i,0,steps-1,0,1)),0,1,backColor,224  );
		
		c.fillStyle ="rgb("+red+","+red+","+blue+")";//color;
		c.strokeStyle="rgba("+red+","+red+","+blue+")";//color;
		c.beginPath();
		c.moveTo(source.x, source.y);
		
		
		//c.lineTo( source.x+cos(0)*r,source.y-sin(0)*r  );
		
		for(var alpha=0;alpha<=360;alpha+=1){
			var p=new Point(src.x+cos(alpha)*r,src.y+sin(alpha)*r);
			var dir=new Segment(src,p);
			
			var dist_smallest=1000000;
			var closest_point=0;
			
			for(var j=0;j<barriers.length;j++){
				var inter=dir.intersect(barriers[j]);
				if(inter instanceof Point) {
					if(closest_point==0 || src.dist(inter)<dist_smallest){
						dist_smallest=src.dist(inter);
						closest_point=inter;
					}
				}
			}
			
			if(closest_point==0){
				c.lineTo( translateX(p.x),translateY(p.y)  );
			}else{
				c.lineTo( translateX(closest_point.x),translateY(closest_point.y)  );
			}
		}
		//c.lineTo( source.x+cos(360)*r,source.y-sin(360)*r  );
		c.closePath();
		//c.stroke();
		c.fill();
	}
}

function fillArea(source,angles,color){
	//The low and high angle..fill in between
	if(angles.low>angles.high) angles.high+=360;
	
	var amount=2000;
	
	source=source.clone();
	source.x=translateX(source.x);
	source.y=translateY(source.y);
	
	c.fillStyle =color;
	c.strokeStyle=color;
	c.beginPath();
	c.moveTo(source.x, source.y);
	
	c.lineTo( source.x+cos(angles.low)*amount,source.y-sin(angles.low)*amount  );
	
	for(var alpha=0;alpha<=angles.high-angles.low;alpha+=2){
		c.lineTo( source.x+cos(alpha+angles.low)*amount,source.y-sin(alpha+angles.low)*amount  );
	}
	c.lineTo( source.x+cos(angles.high)*amount,source.y-sin(angles.high)*amount  );
	c.closePath();
	c.stroke();
	c.fill();
}
function fillAreaGradient(source,angles,color){
	//The low and high angle..fill in between
	if(angles.low>angles.high) angles.high+=360;
	
	var max_amount=400;
	var steps=stepsResolution;
	
	source=source.clone();
	source.x=translateX(source.x);
	source.y=translateY(source.y);
	
	for(var i=0;i<steps;i++){
		var r=(steps-i)*(max_amount/steps);
		
		//step=1;//opacityFunction(map(i,0,steps-1,0,1));
		var red=map( opacityFunction(map(i,0,steps-1,0,1)),0,1,backColor,255  );
		var blue=map( opacityFunction(map(i,0,steps-1,0,1)),0,1,backColor,224  );
		
		c.fillStyle ="rgb("+red+","+red+","+blue+")";//color;
		c.strokeStyle="rgba("+red+","+red+","+blue+")";//color;
		c.beginPath();
		c.moveTo(source.x, source.y);
		
		c.lineTo( source.x+cos(angles.low)*r,source.y-sin(angles.low)*r  );
		
		for(var alpha=0;alpha<=angles.high-angles.low;alpha+=2){
			c.lineTo( source.x+cos(alpha+angles.low)*r,source.y-sin(alpha+angles.low)*r  );
		}
		c.lineTo( source.x+cos(angles.high)*r,source.y-sin(angles.high)*r  );
		c.closePath();
		//c.stroke();
		c.fill();
	}
	
	/*
	c.beginPath();
	c.moveTo(source.x, source.y);
	
	c.lineTo( source.x+cos(angles.low)*amount,source.y-sin(angles.low)*amount  );
	
	for(var alpha=0;alpha<=angles.high-angles.low;alpha+=2){
		c.lineTo( source.x+cos(alpha+angles.low)*amount,source.y-sin(alpha+angles.low)*amount  );
	}
	c.lineTo( source.x+cos(angles.high)*amount,source.y-sin(angles.high)*amount  );
	c.closePath();
	c.stroke();
	c.fill();
	
	*/
}

function fillTriangle(src,barrier,color){
	var source=src.clone();
	source.x=translateX(source.x);
	source.y=translateY(source.y);
	
	c.fillStyle =color;
	c.strokeStyle=color;
	c.beginPath();
	c.moveTo(source.x, source.y);
	
	c.lineTo( translateX(barrier.p1.x),translateY(barrier.p1.y)  );
	c.lineTo( translateX(barrier.p2.x),translateY(barrier.p2.y)  );
	
	c.closePath();
	c.stroke();
	c.fill();
	
}
function fillTriangleGradient(src,barrier,color){
	return;	//Failed
	var source=src.clone();
	source.x=translateX(source.x);
	source.y=translateY(source.y);
	
	var max_amount=500;
	var max_steps=stepsResolution;
	
	var temp_frust=new Frustum(src,barrier);	//used just for angle
	var angles={low:temp_frust.s1.angle,high:temp_frust.s2.angle};
	var angleDirection=1;	//take angles from low to high or viceversa...this depends on which adjacent side is bigger
	
	var smallAmount=(src.dist(barrier.p1)<src.dist(barrier.p2)?src.dist(barrier.p1):src.dist(barrier.p2));		//Needed later....
	var amount=(src.dist(barrier.p1)>src.dist(barrier.p2)?src.dist(barrier.p1):src.dist(barrier.p2));
	var steps=Math.floor((amount*max_steps)/max_amount);// How many steps are in <amount> considering the unit is <max_amount>/<max_steps> ?
	
	console.log(steps);
	
	if(angles.low>angles.high) angles.high+=360;
	if(temp_frust.s1.length<temp_frust.s2.length) {
		angleDirection=-1;		//The second side is bigger. This means I should color in reverse..from the bigger side to the smallest one
		angles={low:temp_frust.s2.angle,high:temp_frust.s1.angle};
	}
	
	for(var i=0;i<steps;i++){
		var r=(steps-i)*(max_amount/max_steps);
		
		//step=opacityFunction(map(i,0,steps-1,0,1));
		
		var red=map( opacityFunction(map(i,0,steps-1,0,1)),0,1,backColor,255  );
		var blue=map( opacityFunction(map(i,0,steps-1,0,1)),0,1,backColor,224  );
		
		c.fillStyle ="rgb("+red+","+red+","+blue+")";//color;
		c.strokeStyle="rgba("+red+","+red+","+blue+")";//color;
		
		c.beginPath();
		c.moveTo(source.x, source.y);
		
		c.lineTo( source.x+cos(angles.low)*r,source.y-sin(angles.low)*r  );
		
		for(var alpha=0;alpha<=Math.abs(angles.high-angles.low);alpha+=10){
			var p=new Point(src.x+cos(angles.low+angleDirection*alpha)*r,src.y+sin(angles.low+angleDirection*alpha)*r);
			var dir=new Segment(src,p);
			if(dir.invalid) continue;		//It happens that we like valid segments
			var inter=dir.intersect(barrier);
			if(inter==0){
				c.lineTo( translateX(p.x),translateY(p.y) );
			}
			if(inter instanceof Point) {
				//c.lineTo( translateX(inter.x),translateY(inter.y) );		//interferes with the last lineTo
			}
			
			
		}
		c.lineTo( source.x+cos(angles.high)*smallAmount,source.y-sin(angles.high)*smallAmount  );
		c.closePath();
		//c.stroke();
		c.fill();
		
		//if(i==2)break;
	}
	
	
	
	/*
	c.fillStyle =color;
	c.strokeStyle=color;
	c.beginPath();
	c.moveTo(source.x, source.y);
	
	c.lineTo( translateX(barrier.p1.x),translateY(barrier.p1.y)  );
	c.lineTo( translateX(barrier.p2.x),translateY(barrier.p2.y)  );
	
	c.closePath();
	c.fill();
	c.stroke();
	*/
}


$(document).ready(function(){
	canvas=document.getElementById("canvas");
	c=canvas.getContext("2d");
	var line_point;
	var wait_point=false;

	$('#canvas').on('contextmenu', function(e){
        e.preventDefault();
    });
	
	$('#canvas').mousedown(function(e) {
		switch (e.which) {
			case 1:{
				//Left click
				var x=translateX(e.pageX-$(this).offset().left);
				var y=translateY(e.pageY-$(this).offset().top);
				
				if(!wait_point){
					line_point=new Point(x,y);
					wait_point=true;
				}else{
					lines.push(new Segment(line_point,new Point(x,y)));
					console.log(lines);
					wait_point=false;
				}
				
				break;
			}
			case 3:{
				//Right Mouse button pressed.
				selected_line_index++;
				selected_line_index%=lines.length;
				break;
			}
		}
	});
	
	$(document).keypress(function(e){
		//q
		if(e.which==113){
			disable_mousemove=!disable_mousemove;
		}
		
		//a
		if(e.which==97){
			key_flag1=!key_flag1;
		}
		
		//s
		if(e.which==115){
			key_flag2=!key_flag2;
		}
	});
	
	
	$("canvas").mousemove(function(e){
		var x=translateX(e.pageX-$(this).offset().left);
		var y=translateY(e.pageY-$(this).offset().top);
		
		if(lines.length>0 && !disable_mousemove){
			frust=new Frustum(new Point(x,y),lines[selected_line_index]);
			light=new Light(frust);
		}
	});
	
	$("#switch").click(function(){
		switchMode=(switchMode==0?1:0);
		$("#switch").text("Switch mode: "+(switchMode==0?"Fast":"Fancy"));
	});
	$("#resolution").change(function(){
		stepsResolution=parseInt($("#resolution").val());
	});
	
	interval=setInterval(loop,100);
});


function loop(){
	//c.clearRect(0, 0, canvas.width, canvas.height);
	c.fillStyle="rgb("+backColor+","+backColor+","+backColor+")";
	c.fillRect(0, 0, canvas.width, canvas.height);
	
	var lines_copy=[];
	var temp1=[];
	var temp2=[];
	var visible_lines=[];
	
	if(frust!=0 && selected_line_index!=i){
		
		//Filter lines...if the angle between them and frust source is too small just ignore
		for(var i=0;i<lines.length;i++){
			var temp_frust=new Frustum(frust.source,lines[i]);
			if(temp_frust.angle<1) continue;	//Too small
			lines_copy.push(lines[i]);
		}
		temp1=lines_copy.slice(0);
		
		//Find the visible lines
		for(var i=0;i<lines_copy.length;i++){
			var temp_frust=new Frustum(frust.source,lines_copy[i]);
			light=new Light(temp_frust);
			
			for(var j=0;j<temp1.length;j++){
				var res=light.filterVisible(temp1[j]);
				if(Array.isArray(res)){
					for(var k=0;k<res.length;k++){
						temp2.push(res[k]);
					}
				}else temp2.push(temp1[j]);
			}
			temp1=temp2;
			temp2=[];
			
		}
		visible_lines=temp1;
		
		//No visible lines...do not bother
		if(visible_lines.length==0) {
			fillAreaGradient(frust.source,{low:0,high:360},"lightyellow");
			return;
		}
		
		if(switchMode==1){
			//Fancy mode
			//Quick solution algorithm...I don't need angles,sort,concatanate,wrap,error check
			fillAdvanced(frust.source,visible_lines);
			//Superimpose the lines
			for(var i=0;i<lines.length && key_flag1;i++) lines[i].draw(false);
			for(var i=0;i<visible_lines.length && key_flag2;i++) visible_lines[i].draw(true);
			return;
		}
		
		
		//Sort by angle
		var angles=[];
		var temp=[];
		
		for(var i=0;i<visible_lines.length;i++) {
			var temp_frust=new Frustum(frust.source,visible_lines[i]);
			angles.push({low:temp_frust.s1.angle,high:temp_frust.s2.angle});
		}
		
		angles.sort(function(a,b){
			if(a.low<b.low) return -1;
			if(a.low>b.low) return 1;
			return 0;
		});
		
		
		temp=angles.slice(0);
		angles=[];
		
		//Concatanate similar pairs of angles  (L1---H2)+(L2---H3) where H2=L2  => (L1,H3)
		var finished=false;
		while(!finished && temp.length>1){
			var found=-10;//must be bigger than -1 because "if(found!=temp.length-2)" might return true
			finished=true;
			
			for(var i=0;i<temp.length-1;i++){
				if(aprox(temp[i].high,temp[i+1].low,0.01)){
					found=i;
					angles.push({low:temp[i].low,high:temp[i+1].high});
					i++;
				}else{
					angles.push({low:temp[i].low,high:temp[i].high});
				}
			}
			//Don't miss the last one
			if(found!=temp.length-2) angles.push({low:temp[temp.length-1].low,high:temp[temp.length-1].high});
			if(found!=-10) finished=false;
			
			temp=angles;
			angles=[];
		}
		
		//Wrap around..take into account the 360->0 case
		if(temp.length>1 && aprox(temp[temp.length-1].high,temp[0].low,0.01)){
			for(var i=1;i<temp.length-1;i++){
				angles.push({low:temp[i].low,high:temp[i].high});
			}
			angles.push({low:temp[temp.length-1].low,high:temp[0].high});
			temp=angles;
		}
		
		//Error check code
		//At this stage no pairs of angles like <A1,B1>,<A2,B2> (with A1<A2<B1) should exist...If they do then eliminate them with this code:
		var start_index=0;
		
		while(temp.length>1){
			var found_index=-1;
			var new_angle=0;
			
			for(var j=start_index+1;j<temp.length;j++){
				var pair1=temp[start_index];
				var pair2=temp[j];
				
				if( angleBetween(temp[start_index].low,pair2) || angleBetween(temp[start_index].high,pair2)){
					new_angle=intersectPairs(pair1,pair2);
					found_index=j;
					break;
				}
				if(angleBetween(temp[j].low,pair1) || angleBetween(temp[j].high,pair1)){
					new_angle=intersectPairs(pair1,pair2);
					found_index=j;
					break;
				} 
			}
			
			if(found_index==-1 || new_angle==0){
				start_index++;
			}else {
				log("Error detected and corrected!");
				temp=temp.splice(found_index,1);
				temp[start_index]=new_angle;
			}
				
			if(start_index==temp.length-1) break;
		}
		angles=temp;
		
		//Special case:full circle
		if(angles.length==1 && aprox(angles[0].low,angles[0].high,0.01)){
			//Custom draw
			log("Special case:  circle of light");
		}else{
			if(angles.length==1){
				fillArea(frust.source,{low:angles[0].high,high:angles[0].low},"lightyellow");
			}else{
				
				for(var i=0;i<angles.length-1;i++){
					fillArea(frust.source,{low:angles[i].high,high:angles[i+1].low},"lightyellow");
				}
				//Take care of the last one...we omitted it in the for loop
				fillArea(frust.source,{low:angles[angles.length-1].high,high:angles[0].low},"lightyellow");
				
			}
		}
		
		//Draw light from source to line(visible) barriers
		for(var i=0;i<visible_lines.length;i++){
			fillTriangle(frust.source,visible_lines[i],"lightyellow");
		}
	}
	
	
	//Superimpose the lines
	for(var i=0;i<lines.length && key_flag1;i++) lines[i].draw(false);
	for(var i=0;i<visible_lines.length && key_flag2;i++) visible_lines[i].draw(true);
	
	//if(frust!=0) frust.draw(false);
}


class Light{
	constructor(frust){
		this.frust=frust;
	}
	
	filterVisible(seg){
		//Returns visible segments(Array-empty means invisible) or 0(not inside frustum so may be visible)
		var res=[];
		var inter=this.frust.advancedIntersect(seg);
		
		if(inter==0) return 0;
		if(inter instanceof Point) return 0;
		
		if(inter.length==2) res.push(inter[1]);
		if(inter.length==3) {
			res.push(inter[1]);
			res.push(inter[2]);
		}
		
		//Filter inter[0]
		var s=inter[0];
		
		if(this.isVisibleSegment(s)){
			res.push(s);
			return res;
		}
		if(this.isInvisibleSegment(s)) return res;
		
		var inter=s.intersect(this.frust.screen);
		
		//Unknown/Impossible cases
		if(inter==0) return res;
		if(!(inter instanceof Point)) return res;
		
		var part1=new Segment(inter,s.p1);
		var part2=new Segment(inter,s.p2);
		
		if(this.isVisibleSegment(part1)){
			res.push(part1);
		}		
		if(this.isVisibleSegment(part2)){
			res.push(part2);
		}
		return res;
	}
	
	
	isVisiblePoint(p){
		var dir=new Segment(this.frust.source,p);
		var inter=dir.intersect(this.frust.screen);
		
		if(inter==0) return true;
		
		//It is possible  the two segments to coincide(not probably) or the intersetion to be the point istself
		if((inter instanceof Point) && inter.equals(p)) return true;
		return false;
	}
	isInvisiblePoint(p){
		var dir=new Segment(this.frust.source,p);
		var inter=dir.intersect(this.frust.screen);
		
		if(inter==0) return false;
		
		//It is possible  the two segments to coincide(not probably) or the intersetion to be the point istself
		if((inter instanceof Point) && inter.equals(p)) return true;
		return true;
	}
	
	isVisibleSegment(s){
		return this.isVisiblePoint(s.p1) && this.isVisiblePoint(s.p2);
	}
	
	isInvisibleSegment(s){
		return this.isInvisiblePoint(s.p1) && this.isInvisiblePoint(s.p2);
	}
	
}

class Frustum{
	constructor(source,segment){
		this.source=source;
		this.screen=segment;
		this.s1=(new Segment(source,segment.p1)).extendSecond(1000000000);
		this.s2=(new Segment(source,segment.p2)).extendSecond(1000000000);
		
		if(this.s2.angle>this.s1.angle && this.s2.angle-this.s1.angle<180) this.angle=this.s2.angle-this.s1.angle;
		if(this.s1.angle>this.s2.angle && this.s1.angle-this.s2.angle>180) this.angle=360-this.s1.angle+this.s2.angle;
		
		if(this.s2.angle>this.s1.angle && this.s2.angle-this.s1.angle>180){
			var temp=this.s1;
			this.s1=this.s2;
			this.s2=temp;
			
			this.angle=360-this.s2.angle+this.s1.angle;
		}else if(this.s1.angle>this.s2.angle && this.s1.angle-this.s2.angle<180){
			var temp=this.s1;
			this.s1=this.s2;
			this.s2=temp;
			
			this.angle=this.s2.angle-this.s1.angle;
		}
		
		
	}
	
	advancedIntersect(s){
		//Returns the intersecting segment and the remaining of it(outside the frustum)(Array) / point or 0
		
		//This MUST go first. It may be inside but if it has an abrupt angle intersectSegment will faill
		if(this.containsSegment(s)) {
			return [s];
		}
		
		var inter=this.intersectSegment(s);
		var res=[];	// first value is segment inside the rest of the segment. Max count:3
		
		if(inter==0) return 0;
		if(inter instanceof Point) return inter;
		
		res.push(inter);
		
		
		if(this.containsPoint(s.p1)) {
			if(inter.p1.equals(s.p1)){
				res.push(new Segment( inter.p2,s.p2 ));
			}else{
				res.push(new Segment( inter.p1,s.p2 ));
			}
			return res;
		}
		
		if(this.containsPoint(s.p2)) {
			if(inter.p1.equals(s.p2)){
				res.push(new Segment( inter.p2,s.p1 ));
			}else{
				res.push(new Segment( inter.p1,s.p1 ));
			}
			return res;
		}
		
		//		   \           /
		//  O-------\=========/----O
		//		     \       /
		//  A       B \     /  C    D
		//
		// dist1=AB+BC+CD;
		// dist2=AC+BC+BD= (AB+BC)+BC+(BC+CD)=AB+3*BC+CD > dist1  (so dist2 is wrong....the first configuration is the correct one)
		
		var len=inter.p1.dist(inter.p2);
		var dist1=s.p1.dist(inter.p1)+len+s.p2.dist(inter.p2);
		var dist2=s.p1.dist(inter.p2)+len+s.p2.dist(inter.p1);
		
		if(dist1<dist2){
			res.push(new Segment(s.p1,inter.p1));
			res.push(new Segment(inter.p2,s.p2));
		}else {
			res.push(new Segment(s.p1,inter.p2));
			res.push(new Segment(inter.p1,s.p2));
		}
		
		return res;
	}
	
	intersectSegment(s){
		//0 if no intersection or (returns point ,segment of intersection or 0)
		if(this.containsSegment(s)) {
			return s;
		}
		
		if(this.containsPoint(s.p1)){
			//Just one point is inside...not both(because of previous check)
			var inter1=s.intersect(this.s1);
			var inter2=s.intersect(this.s2);
			
			if(inter1 instanceof Segment) return inter1;
			if(inter2 instanceof Segment) return inter2;
			
			if((inter1 instanceof Point) && !inter1.equals(s.p1)){
				return new Segment(inter1,s.p1);
			}
			if((inter2 instanceof Point) && !inter2.equals(s.p1)){
				return new Segment(inter2,s.p1);
			}
			
			return 0;
		}
		if(this.containsPoint(s.p2)){
			//Just one point is inside...not both(because of previous check)
			var inter1=s.intersect(this.s1);
			var inter2=s.intersect(this.s2);
			
			if(inter1 instanceof Segment) return inter1;
			if(inter2 instanceof Segment) return inter2;
			
			if((inter1 instanceof Point) && !inter1.equals(s.p2)){
				return new Segment(inter1,s.p2);
			}
			if((inter2 instanceof Point) && !inter2.equals(s.p2)){
				return new Segment(inter2,s.p2);
			}
			return 0;
		}
		
		//Both endpoints are outside
		var l1=new Line(this.s1);
		var l2=new Line(this.s2);
		var l=new Line(s);
		
		var inter1=l.intersect(l1);
		var inter2=l.intersect(l2);
		
		if(inter1==-1 || inter2==-1) return 0;
		
		var check1=this.s1.containsPoint(inter1) && s.containsPoint(inter1);
		var check2=this.s2.containsPoint(inter2) && s.containsPoint(inter2);
		if(!(check1 && check2)) return 0;
		
		//inter1.draw();
		//inter2.draw();
		
		return new Segment(inter1,inter2);
		
		
	}
	
	containsPoint(p){
		var dir=new Segment(this.source,p);
		
		if(this.s2.angle>this.s1.angle){
			return (this.s1.angle<=dir.angle && dir.angle<=this.s2.angle) || aprox(dir.angle,this.s1.angle,0.01) || aprox(dir.angle,this.s2.angle,0.01);
		}else return dir.angle<=this.s2.angle || dir.angle>=this.s1.angle || aprox(dir.angle,this.s1.angle,0.01) || aprox(dir.angle,this.s2.angle,0.01);
	}
	
	containsSegment(s){
		//True if segment is ENTIRELY inside
		return this.containsPoint(s.p1) && this.containsPoint(s.p2);
	}
	
	draw(highlight){
		this.s1.draw(true);
		this.s2.draw(true);
		
	}
}



class Line{
	constructor(seg){
		this.segment=seg.clone();
	}
	
	intersect(l){
		if(this.inline(l)) return -1;	//infinite points
		
		if(this.segment.isVertical()){
			var x=this.segment.p1.x;
			return new Point(x,l.segment.f(x));
		}
		if(l.segment.isVertical()){
			var x=l.segment.p1.x;
			return new Point(x,this.segment.f(x));
		}
		
		var x=(this.segment.b-l.segment.b)/(l.segment.a-this.segment.a);
		return new Point(x,l.segment.a*x+l.segment.b);
	}
	
	inline(l){
		//True if inline with another line
		return Math.abs(this.segment.a-l.segment.a)<0.0001;
	}
}
class Segment{
	//Direction from p2 to p1 : p2-p1
	constructor(p1,p2){
		this.p1=p1;
		this.p2=p2;
		
		this.angle=this.calculateAngle();
		
		
		if(this.isVertical()){
			this.a=9999999999999;		//infinite because vertical
		}else this.a=(p2.y-p1.y)/(p2.x-p1.x);
		
		this.b=this.p1.y-this.a*this.p1.x;
		this.length=Math.sqrt((this.p2.x-this.p1.x)*(this.p2.x-this.p1.x)+(this.p2.y-this.p1.y)*(this.p2.y-this.p1.y));
		
		this.invalid=false;
		if(this.length<0.001) {
			console.log("ERROR: length too small. This may corrupt intersection code. Increasing size...");
			//console.trace();
			
			this.invalid=true;
			this.p2=this.extendSecond(1).p2;
			this.length=Math.sqrt((this.p2.x-this.p1.x)*(this.p2.x-this.p1.x)+(this.p2.y-this.p1.y)*(this.p2.y-this.p1.y));
		}
		
		
	}
	isVertical(){ return aprox(this.p1.x,this.p2.x,0.001);}
	
	f(x){
		//The actual function
		return (x*this.a+this.b);
	}
	
	containsPoint(p){
		//True if segment contains point
		if(this.isVertical()){
			if(!aprox(p.x,this.p1.x,0.01)) return false;
			var y_min=Math.min(this.p1.y,this.p2.y);
			var y_max=Math.max(this.p1.y,this.p2.y);
			return (y_min<=p.y && p.y<=y_max);
		}
		
		var temp=new Point(p.x,this.f(p.x));
		
		//Not even on same line
		if(!temp.equals(p)) return false;
		
		var seg_min=Math.min(this.p1.x,this.p2.x);
		var seg_max=Math.max(this.p1.x,this.p2.x);
		
		//Point might be "hovering" arounf the end points
		return ((p.x>=seg_min && p.x<=seg_max) || (aprox(p.x,seg_min,0.01) || aprox(p.x,seg_max,0.01) ));
	}
	
	
	
	calculateAngle(){
		return normalize(toDeg(Math.atan2(this.p2.y-this.p1.y,this.p2.x-this.p1.x)));
	}
	
	intersect(seg2){
		//returns point ,segment of intersection or 0
		
		var l1=new Line(this);
		var l2=new Line(seg2);
		
		if(l1.inline(l2)){
			//Parralel,same line but not touching or same line and interesecting in more than one point
			if(!aprox(this.b,seg2.b,0.01)) return 0;
			
			//Make sure the segments are indeed sharing some points
			var max_dist=Math.max(  this.p1.dist(seg2.p1),this.p1.dist(seg2.p2),  this.p2.dist(seg2.p1),this.p2.dist(seg2.p2)  );
			if(max_dist>this.length+seg2.length) return 0;		//Segments do not interesect
			
			
			//Verify if segments are equals and margin-sharing casses  [a,b] interesected with [b,c] (shares point b)
			var flag1=seg2.p1.equals(this.p1);
			var flag2=seg2.p1.equals(this.p2);
			var flag3=seg2.p2.equals(this.p1);
			var flag4=seg2.p2.equals(this.p2);
			
			if((flag1 || flag3) && (flag2 || flag4)) return this;
			if(flag1){
				if(this.containsPoint(seg2.p2)) return seg2.clone();
				if(seg2.containsPoint(this.p2)) return new Segment(seg2.p1,this.p2);
				return 0;
			}
			if(flag2){
				if(this.containsPoint(seg2.p2)) return seg2.clone();
				if(seg2.containsPoint(this.p1)) return new Segment(seg2.p1,this.p1);
				return 0;
			}
			if(flag3){
				if(this.containsPoint(seg2.p1)) return seg2.clone();
				if(seg2.containsPoint(this.p2)) return new Segment(seg2.p2,this.p2);
				return 0;
			}
			if(flag4){
				if(this.containsPoint(seg2.p2)) return seg2.clone();
				if(seg2.containsPoint(this.p2)) return new Segment(seg2.p1,this.p2);
				return 0;
			}
			
			
			//Other cases of interesction without margin sharing 
			//Ex.:
			//this:			|=====----|
			//seg2:		|---=====|
			
			flag1=this.containsPoint(seg2.p1);
			flag2=this.containsPoint(seg2.p2);
			flag3=seg2.containsPoint(this.p1);
			flag4=seg2.containsPoint(this.p2);
			
			if(flag1 && flag2) return seg2.clone();
			if(flag3 && flag4) return this.clone();
			if(flag1){
				if(flag3) return new Segment(seg2.p1,this.p1);
				return new Segment(seg2.p1,this.p2);
			}
			if(flag2){
				if(flag3) return new Segment(seg2.p2,this.p1);
				return new Segment(seg2.p2,this.p2);
			}
			
			console.log("Error. Why did the code reach this part?");
			return 0;		//Should never reach this
			
		}else{
			var p=l1.intersect(l2);
			return (this.containsPoint(p) && seg2.containsPoint(p)?p:0);
		}
	}
	
	extendFirst(amount){
		//Extends first point: p1
		var x_amount=Math.cos( toRad(this.angle)+Math.PI )*amount;
		var y_amount=Math.sin( toRad(this.angle)+Math.PI )*amount;
		
		var new_p1=new Point(this.p1.x+x_amount,this.p1.y+y_amount);
		
		return new Segment(new_p1,this.p2);
	}
	extendSecond(amount){
		//Extends second point: p2
		var x_amount=Math.cos( toRad(this.angle) )*amount;
		var y_amount=Math.sin( toRad(this.angle) )*amount;
		
		var new_p2=new Point(this.p2.x+x_amount,this.p2.y+y_amount);
		
		return new Segment(this.p1,new_p2);
	}
	toString(){
		return "Segment p1:{ "+this.p1.toString()+" }    p2:{ "+this.p2.toString()+" }";
	}
	
	clone(){
		return new Segment(this.p1,this.p2);
	}
	
	draw(highlight){
		c.beginPath();
		c.moveTo(this.p1.x,translateY(this.p1.y));
		c.lineTo(this.p2.x,translateY(this.p2.y));
		c.strokeStyle=highlight?"red":"black";
		c.stroke();
	}
}




class Point{
	constructor(x,y){
		this.x=x;
		this.y=y;
	}
	
	clone(){
		return new Point(this.x,this.y);
	}
	
	equals(p){
		//If identical to another point. Using small error
		return (Math.abs(this.x-p.x)<0.01 && Math.abs(this.y-p.y)<0.01);
	}
	
	dist(p){
		return Math.sqrt( (this.y-p.y)*(this.y-p.y)+(this.x-p.x)*(this.x-p.x)  );
	}
	
	toString(){
		return "Point x: "+this.x+"  y: "+this.y;
	}
	
	draw(highlight){
		c.beginPath();
		c.arc(this.x,translateY(this.y),5,0,2*Math.PI);
		c.fillStyle=highlight?"red":"black";
		c.fill();
	}
}