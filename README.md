# ShadowNLight
Simulate light. Js implemetation

Simulate light and shadows with multiple modes. 

# How to uses
To create a barrier click on the screen twice to define a line.
You can choose from multiple modes: Fast and Fancy. Fast will assume the light doesn't loose power over distance thus it covers all the screen.
Fancy mode implements a small gradient generating code. For this mode you can select the accuracy of the light(in how many steps it diminishes)

There are 3 keyboard modes activated by buttons : q -fixes the light source in place, a - hides all barriers, s - highlight visible segments.

I suggest using the combination of setings: Fancy+normal accuracy+\<s\> key set
  
# Programming
The code implements useful classes like Point,Segment,Line,Frustum,Light every class built on previous one. 
Point class implements routines such as : distance to another point

Segment class:  extend either ends,intersection with other segment(returns 0,point or common/shared segment),contains point. Also provides useful data about the segment such as its angle and whetever it is vertical or not and even its defining function(based on an x it returns a value y).

Line class:intersection,inline with another line check

Frustum(not complete) \- composed by a source and an segment(screen). The frustum is between the source and the endpoints of the segment inclosing it in. 
        \- the sides extend to a large distance 
        \- checks if a give segment/point is inside, cuts the segmet into piece(outside,inside)
        
Light - built on Frustum. Adds another layer of intersection: checks if a given segment is between source and screen or cuts in accordingly , retuning only the visible part.
