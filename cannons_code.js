// A program for a game of cannons.

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

class Cannon{
    
    constructor(size,color,x,y,angle) { 
        // Initialize the fields for the Cannon
        this.health = 100;
        this.state = "alive";
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.gravityMagnitude = 0;
        this.size = size;
        this.color = color;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.parts = [];
        
        // Construct the Cannon parts
        this.createCannon();
    }
    
    
    createCannon(){
        
        // Determine the Center of the Cannon
        var cannonCenterX = this.x + STANDARD_CANNON_WHEEL_RADIUS * this.size;
        var cannonCenterY = this.y - STANDARD_CANNON_WHEEL_RADIUS * this.size;
        
        // Save the centers as fields to be used for clicking and moving
        this.centerX = cannonCenterX;
        this.centerY = cannonCenterY;
        
        // Determine the right x and top y of the cannon to be used for clicking and moving
        this.cannonRight = this.x + STANDARD_CANNON_WHEEL_RADIUS * this.size * 2;
        this.cannonTop = this.y - STANDARD_CANNON_WHEEL_RADIUS * this.size * 2;
        
        
        // Convert angle from degrees to Radians
        var angle = convertToRadians(this.angle);
        
        // Create object arrays
        var bodyArray = this.drawCannonBody(cannonCenterX,cannonCenterY,this.size,this.color,angle);
    	var wheelArray = this.drawCannonWheel(cannonCenterX,cannonCenterY,this.size);
    	
    	//drawCannonString(x,y,size,color,angle);
    	
    	// Create the total Cannon Array
    	// by adding the two arrays into a new
    	// array representing the entire cannon
    	for(var i = 0; i < bodyArray.length; i++) {
    	    this.parts.push(bodyArray[i]);
    	}
    	for(var i = 0; i < wheelArray.length; i++) {
    	    this.parts.push(wheelArray[i]);
    	}
    }
    
    // This function is implemented in order to construct and return the 
    // two graphical objects of the cannon's body
    drawCannonBody(x,y,size,color,angle) {
        // Determine the center of the cannon's oval body part
        var cannonBodyX = x + size * Math.cos(angle) * 0.375 * STANDARD_CANNON_WIDTH; 
        var cannonBodyY = y - size * Math.sin(angle) * 0.375 * STANDARD_CANNON_HEIGHT; 
        
        // Determine the width and height of the cannon's body
        var cannonBodyWidth = STANDARD_CANNON_WIDTH * size;
        var cannonBodyHeight = STANDARD_CANNON_HEIGHT * size;
        
        // Construct the cannon oval
        this.cannonBody = new Oval(cannonBodyWidth, cannonBodyHeight);
        this.cannonBody.setPosition(cannonBodyX,cannonBodyY);
        this.cannonBody.setColor(color);
        this.cannonBody.setRotation(-angle,1);
        
        // Determine the width,height,x, and y of the cannons 
        // rectangular barrel body part
        var cannonBarrelWidth = cannonBodyWidth * 0.90;
        var cannonBarrelHeight = cannonBodyHeight * 1.0;
        var cannonBarrelX = cannonBodyX + 0.5 * cannonBodyWidth * Math.cos(angle);
        var cannonBarrelY = cannonBodyY - 0.5 * cannonBodyWidth * Math.sin(angle);
        
        // Contruct the cannon's rectangular barrel body part
        cannonBodyHeight *= 0.988; // added to smooth the cannon's visual
        this.cannonBarrel = new Rectangle(cannonBarrelWidth, cannonBarrelHeight);
        this.cannonBarrel.setPosition(cannonBarrelX-cannonBarrelWidth/2,cannonBarrelY-cannonBarrelHeight/2);
        this.cannonBarrel.setColor(color);
        this.cannonBarrel.setRotation(-angle,1);
        
        
        return [this.cannonBody,this.cannonBarrel];
    }
    
    // this function is implemented in order to construct and return the 
    // five graphical objects of the cannon's wheel
    drawCannonWheel(x,y,size) {
        
        var radius = STANDARD_CANNON_WHEEL_RADIUS * size;
        
        // Create the wheel
        this.wheel = new Circle(radius);
    	this.wheel.setColor(BROWN);
    	this.wheel.setPosition(x, y);
        
        // Create the spokes
        this.spokeHorizontal = new Line(x-radius,y,x+radius,y);
        this.spokeVertical = new Line(x,y+radius,x,y-radius);
        radius *= Math.cos(convertToRadians(45));
        this.spokeBotLeftToTopRight = new Line(x-radius,y+radius,x+radius,y-radius);
        this.spokeTopLeftToBotRight = new Line(x-radius,y-radius,x+radius,y+radius);
        
        // Set the width of each cannon spoke
        size *= 0.95;
        this.spokeHorizontal.setLineWidth(size);
        this.spokeVertical.setLineWidth(size);
        this.spokeBotLeftToTopRight.setLineWidth(size);
        this.spokeTopLeftToBotRight.setLineWidth(size);
        
        
        return [this.wheel,this.spokeHorizontal,this.spokeVertical,this.spokeBotLeftToTopRight,this.spokeTopLeftToBotRight];
        
        
    }
    
    
    cannonGravity() {
        // This function moves the cannon on a one dimensional plane 
        // It will move the cannon either up or down depending on the
        // yVelocity, but will also cause the cannon to accelerate 
        // downwards with gravity
        
        var i;
        if(this.state != "dead") {
            // Cannon increment values for acceleration
            this.gravityMagnitude += GRAVITY_CONSTANT;
            this.yVelocity += this.gravityMagnitude;
            if(this.yVelocity > 0) {
                // Loop to find the farthest possible value the cannon
                // can travel so that it does not fall through blocks
                for(i = 0; i < this.yVelocity; i++) {
                    // If world is blocked, i is equal to the maximum velocity possible
                    if(worldBlocked(this.getX(),this.getY() + i) || 
                    worldBlocked(this.getCenterX(),this.getY() + i) ||
                    worldBlocked(this.getCannonRight(),this.getY() + i)){
                        break;
                    }
                }
            }
            else {
                //println(this.yVelocity);
                // Because the jump values are small, i is set to vertical velocity
                i = this.yVelocity;
                // if their is a block as a ceiling, i should be 0
                // and the cannon should not move
                if(worldBlocked(this.getX(),this.getCannonTop() + i) || 
                worldBlocked(this.getCenterX(),this.getCannonTop() + i) ||
                worldBlocked(this.getCannonRight(),this.getCannonTop() + i)){
                    i = 0;
                } 
            }
            // Move the cannon then stop the cannon's movement if 
            // the cannon's velocity was reduced (it hit a block)
            this.y += i;
            if(i <  this.yVelocity * .099) {
                this.gravityMagnitude = 0;
                this.yVelocity = 0;
            }
        }
        else {
            // The cannon is not alive, do not change its position
            return;
        }
        this.update();
    }
    
    
    undraw() {
        // Loops through an array of graphical objects(cannon parts) 
        // and removes all items from the graphical window
        for(var i = 0; i < this.parts.length; i++) {
            remove(this.parts[i]);
        }
    }
    
    draw() {
        // Loops through an array of graphical objects(cannon parts) 
        // and removes all items from the graphical window
        for(var i = 0; i < this.parts.length; i++) {
            add(this.parts[i]);
        }
    }
    
    _delete() {
        // Deletes the cannon parts
        this.parts = [];   
    }
    
    
    update() {
        // Used whenever a value of a graphical related field is changed
        // Deletes the cannon and recreates it so that the change in the field 
        // Appears on the screen
        try{
            if(this.state != "dead" && (typeof(this) != undefined || this != undefined)) {
                this.undraw();
                this._delete();
                this.createCannon();
                if((typeof(this) != undefined || this != undefined)){
                    this.draw();
                }
            }
        }
        catch(TypeError){
            println("insidecannon");   
        }
    }
    
    damage(magnitude) {
        // Injure the cannon's heath
        this.health -= magnitude;
        // If thaey are dead, set the status to "dead"
        if(this.health <=0) {
            this.state = "dead";
        }
    }
    
    // Helper Methods
    static convertToRadians(degrees) {
        return degrees/180 * Math.PI;
    }
    
    isClicked(x,y) {
        // Return if the given x,y coordinates are within the cannon's wheel
        // If so, the cannon was clicked
        return y <= this.y+5 && y >= this.y-STANDARD_CANNON_HEIGHT*this.size*1.1 && 
        x >= this.x-5 && x <= this.x+STANDARD_CANNON_WIDTH*this.size*1.1 && this.state != "dead";
    }
    
    
    isHit(x,y){
        // Determine if the ball hit the wheel of the cannon
        return this.isClicked(x,y);
    }
    
    // Getters
    getSize() {
        return this.size;
    }
    
    getState(){
        return  this.state;
    }
    
    getColor() {
        return this.color;
    }
    
    getX() {
        return this.x;
    }
    
    getY() {
        return this.y;
    }
    
    getAngle() {
        return this.angle;   
    }
    
    getHealth() {
        return this.health;    
    }
    
    getXVelocity() {
        return this.xVelocity;    
    }
    
    getYVelocity() {
        return this.yVelocity;    
    }
    
    getCenterX() {
        return this.centerX;
    }
    
    getCenterY() {
        return this.centerY;
    }
    
    getCannonTop() {
        return this.cannonTop;
    }
    
    getCannonRight() {
        return this.cannonRight-4;    
    }
    
    
    // Setters
    // Note: Setting a value will not change the graphical appearance
    // of the cannon. In order to have the change appear on the screen,
    // this.update(); must be called
    setSize(size) {
        this.size = size;
    }
    
    setColor(color) {
        this.color = color;
    }
    
    setX(x) {
        this.x = x;
    }
    
    setY(y) {
        this.y = y;
    }
    
    setAngle(angle) {
        this.angle = angle;   
    }
    
    setYVelocity(magnitude) {
        this.yVelocity = magnitude;    
    }
}

// Helper function that takes an input angle in degrees
// and returns the correct corresponding anlge in radians
function convertToRadians(degrees) {
    return degrees/180 * Math.PI;
}



class Cannonball {
    
    // This class represents the cannonball which the cannon shoots
    
    // Construct the cannonball and initialize its fields
    constructor(xPosition,yPosition) {
        
        // x and y position and radius of the cannonball
        this.x  = xPosition;
        this.y = yPosition;
        this.radius = 5;
        
        // Create the circle to be the cannonball visual
        this.ball = new Circle(this.radius);
        this.ball.setPosition(this.x,this.y);
        
        // Initialize helper fields to make the cannonball move
        this.velocityX=0;
        this.velocityY=0;
        this.path = [];
        this.tracker = 0;
        
        // Cannonball Damage
        this.attack = 0;
    }
    
    launch(initVelocity, ang) {
        // Create the cannonballs trajectory
        this.initVelocity = initVelocity;
        this.velocityX = initVelocity * Math.cos(angle);
        this.velocityY = -initVelocity * Math.sin(angle);
        this._createPath();
    }
    
    _createPath(){
        // Determine the amount of damage that would be done if the 
        // cannonball hits another cannon
       this.attack = Math.floor(this.initVelocity*0.70);
        var quit = false;
        var raw_time = 0;
        while(true) {
            
            // Use kinematic formulas to calculate position of the ball
            var time = (raw_time)/200;
            var pathX = this.x + this.velocityX * time + 0.5;
            var pathY = this.y + this.velocityY * time + 0.5 * (GRAVITY_CONSTANT*70) * Math.pow(time,2); 
            this.path.push([pathX,pathY]);
            
            // Stop if a cannon is hit
            for(var i = 0; i < cannons.length; i++) {
                if(cannons[i].isHit(pathX,pathY) && SELECTED_CANNON != cannons[i]) {
                    // Causes the next statement to break the loop
                    quit = true;
                    break;
                }
            }
            
            // Stop if the cannonball leaves the world
            if(worldBlocked(pathX,pathY) || pathX < 0 || pathX > WORLD_WIDTH || 
                pathY < 0 || pathY > WORLD_HEIGHT || quit) {
                break;
            }
            
            
            raw_time+=2;    
        }
        
    }
    
    
    update() {
        try {
            // Update the position of the ball and return true 
            //if the ball has finished its path
            this.undraw();
            
            // Change the position and redraw the ball
            this.ball.setPosition(this.path[this.tracker][0],this.path[this.tracker][1]);
            if((typeof(this) != undefined || this != undefined)){
                    this.draw();
            }
            
            // Increment through the array of locations bassed on the 
            // initial velocity of the cannon's shot
            this.tracker += Math.floor(this.initVelocity * 0.4);
            
            return this.tracker >= this.path.length;
            }
        catch(TypeError) {
            //Sometimes an error occurs which doesnt affect gameplay
            //println("cannonballError");   
            return  true;
        }
    }
    
    // Methods
    
    // Adds the balls to the screen
    draw() {
        add(this.ball);
    }
    
    // Remove the balls from the screen
    undraw() {
        remove(this.ball);   
    }
    
    
    // Setters
    setX(x) {
        this.x = x;
        this.ball.setPosition(this.x,this.y);
    }
    
    setY(y) {
        this.y = y;
        this.ball.setPosition(this.x,this.y);
    }
    
    
    // Getters
    getLastX(){
        return this.path[this.path.length-1][0];   
    }
    
    getLastY(){
        return this.path[this.path.length-1][1];   
    }
    
    getAttack() {
        return this.attack;    
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// Constants for the cannon
var STANDARD_CANNON_WIDTH = 54;
var STANDARD_CANNON_HEIGHT = 36;
var STANDARD_CANNON_WHEEL_RADIUS = 20;
var BROWN = new Color(102,51,0);

// Constants for the World
var world = [];
var WORLD_WIDTH = 725;
var WORLD_HEIGHT = 550;
var BLOCK_SIZE = 25;
var WORLD_COLOR = new Color(0, 132, 121);
var FONT_COLOR = new Color(231,191,0); 

// Game Cannon Constants
var CANNON_SIZE = 0.6;

const BLUE_CANNON_1 = new Cannon(CANNON_SIZE,Color.blue,200,275,45);
const BLUE_CANNON_2 = new Cannon(CANNON_SIZE,Color.blue,0,335,45);
const BLUE_CANNON_3 = new Cannon(CANNON_SIZE,Color.blue,120,460,45);

const RED_CANNON_1 = new Cannon(CANNON_SIZE,Color.red,500,275,135);
const RED_CANNON_2 = new Cannon(CANNON_SIZE,Color.red,700,335,135);
const RED_CANNON_3 = new Cannon(CANNON_SIZE,Color.red,580,460,135);
var cannons = [BLUE_CANNON_1,BLUE_CANNON_2,BLUE_CANNON_3,
                RED_CANNON_1,RED_CANNON_2,RED_CANNON_3];


// Other game constants
var BUTTON_WIDTH = 200;
var BUTTON_HEIGHT = 140;
var UPDATE_TIME = 40;
var BLUE_TEAM = "blue";
var RED_TEAM = "red";

// Title Screen visual effect Cannons
const titleCannon1 = new Cannon(1.3,Color.blue,30,205,60);
const titleCannon2 = new Cannon(1.3,Color.red,WORLD_WIDTH-80,205,120);


// Acceleration due to Gravity constant
var GRAVITY_CONSTANT = 0.1;

// Create the cannball as a global variable
const cannonBall = new Cannonball(0,0);

// Constants for the selected cannon's aim line
var AIM_LINE = new Line(0,0,0,0);
AIM_LINE.setColor(Color.white);
AIM_LINE.setLineWidth(2);
var lineStartX = -5;
var lineStartY = -5;
var lineEndX = -5;
var lineEndY = -5;
var angle = 0;
var size = 0;

// Global variable for cannon jumping
var JUMP_LOOP = 0;
var JUMP_MAGNITUDE = 0;
var JUMPING = false;

// Global variable for keyboard status
var W_STATUS = false;
var A_STATUS = false;
var D_STATUS = false;

// Constants for cannon gameplay
var SELECTED_CANNON = null;
var CURRENT_TEAM;
var totalTime = 0;

// Game scoreboard global variables 
var TIMER = new Text("","12pt Arial Black");
TIMER.setPosition(655, 30);
TIMER.setColor(Color.white);
var INSTRUCTIONS = new Text("","12pt Arial Black");
INSTRUCTIONS.setPosition(185, 30);
INSTRUCTIONS.setColor(Color.white);

// Define each health text for in-game display
var HEALTH_B1 = new Text(BLUE_CANNON_1.getHealth(),"12pt Arial Black");
HEALTH_B1.setPosition(25,30);
HEALTH_B1.setColor(Color.blue);
var HEALTH_B2 = new Text(BLUE_CANNON_2.getHealth(),"12pt Arial Black");
HEALTH_B2.setPosition(75,30);
HEALTH_B2.setColor(Color.blue);
var HEALTH_B3 = new Text(BLUE_CANNON_3.getHealth(),"12pt Arial Black");
HEALTH_B3.setPosition(125,30);
HEALTH_B3.setColor(Color.blue);

var HEALTH_R1 = new Text(RED_CANNON_1.getHealth(),"12pt Arial Black");
HEALTH_R1.setPosition(475,30);
HEALTH_R1.setColor(Color.red);
var HEALTH_R2 = new Text(RED_CANNON_2.getHealth(),"12pt Arial Black");
HEALTH_R2.setPosition(525,30);
HEALTH_R2.setColor(Color.red);
var HEALTH_R3 = new Text(RED_CANNON_3.getHealth(),"12pt Arial Black");
HEALTH_R3.setPosition(575,30);
HEALTH_R3.setColor(Color.red);


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function titleScreen() {
    // Failsafe for back from help
    removeAll();
    
    // Set the size of the game window 
    // And set the background
    setSize(WORLD_WIDTH,WORLD_HEIGHT);
    setBackgroundColor(WORLD_COLOR);
    
    // Create the title
    var title = new Text("Cannons","70pt Arial Black");
    title.setPosition(142,200);
    title.setColor(FONT_COLOR);
    title.setRotation(-0);
    add(title);
    
    // Define the locations of the playButton
    var playX = 437.5; //getWidth()/2 + 75;
    var playY = 326; //getHeight() - 1.6 * BUTTON_HEIGHT;
    
    // Create a rectangle that is to be the border of the play button
    var plays = new Rectangle(BUTTON_WIDTH,BUTTON_HEIGHT);
    plays.setPosition(playX,playY);
    plays.setColor(Color.white);
    add(plays);
    
    // Define the locations of the helpButton
    var instructionX = 87.5; //getWidth()/2 - BUTTON_WIDTH - 75;
    var instructionY = playY;
    
    // Create a rectangle that is to be the border of the help button
    var instructions = new Rectangle(BUTTON_WIDTH,BUTTON_HEIGHT);
    instructions.setPosition(instructionX,instructionY);
    instructions.setColor(Color.white);
    add(instructions);
    
    // Define the text while the dimensions are still
    // what they should be for the border rectangles
    var play = new Text("Play Game","20pt Arial Black");
    play.setPosition(playX + 23, playY + 80);
    play.setColor(FONT_COLOR);
    
    var instruct = new Text("Help","20pt Arial Black");
    instruct.setPosition(instructionX + 70,instructionY + 80);
    instruct.setColor(FONT_COLOR);
    
    // Adjust the dimensions and locations of the rectangles
    // so that the next rectangles will be inside of the 
    // border rectangles
    playX += .05 * BUTTON_WIDTH;
    playY += .035 * BUTTON_WIDTH;
    instructionX += .05 * BUTTON_WIDTH;
    instructionY += .035 * BUTTON_WIDTH;
    var width = BUTTON_WIDTH * 0.9;
    var height = BUTTON_HEIGHT * 0.9;
    
    // Create the inner rectangles for the play button
    var playButton = new Rectangle(width,height);
    playButton.setPosition(playX,playY);
    playButton.setColor(WORLD_COLOR);
    add(playButton);
    
    // Create the inner rectangles for the help button
    var instructionButton = new Rectangle(width,height);
    instructionButton.setPosition(instructionX,instructionY);
    instructionButton.setColor(WORLD_COLOR);
    add(instructionButton);
    
    // Draw the button text on top of the rectangles
    add(play);
    add(instruct);
    
    // Draw two cannons to the side of the title for visual effect
    titleCannon1.draw();
    titleCannon2.draw();
    
    // Wait for the user to click a button
    mouseClickMethod(startButtons);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function startButtons(e){
    // Save the x and y coordinates of the 
    var x = e.getX();
    var y = e.getY();
    
    // Check to see if the y value is in the range of the button's
    // y values
    if(y >=326 && y <= 466) {
        // Check to see if the x value is on a certain button
        if(x >= 87.5 && x <= 287.5) {
            // The help button was clicked
            helpScreen();
        }
        else if(x >= 437.5 && x <= 637.5) {
            // The play game button was clicked
            setUpGame();
        }
        
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function helpScreen() {
    // Remove the title screen objects and 
    removeAll();
    
    
    // Create the back button lines
    var lineWidth = 6;
    
    var top = new Line(40,40,140,40);
    top.setColor(Color.white);
    top.setLineWidth(lineWidth);
    
    var bot = new Line(40,102,140,102);
    bot.setColor(Color.white);
    bot.setLineWidth(lineWidth);
    
    var right = new Line(140,37,140,105);
    right.setColor(Color.white);
    right.setLineWidth(lineWidth);
    
    var left = new Line(37,37,37,105);
    left.setColor(Color.white);
    left.setLineWidth(lineWidth);
    
    
    // Create the text for the back button
    var backText = new Text("Back","18pt Arial Black");
    backText.setPosition(55, 80);
    backText.setColor(FONT_COLOR);
    
    // Add the text to inform the user how to play
    var help = "This is a two player game. The goal of the game is  to destroy the other team's" +
                " cannons by shooting themwith your own. You have limited time per turn and " +
                "  in each turn you select one of your three cannons.  You can then move around using" +
                " the w,a,d keys which correspond to up, left, and right. You can aim usingthe mouse" +
                " pointer and shoot by clicking the mouse.  Then your turn ends. The player that defeats the    other" +
                " team's cannons first wins.";
    
    // Loop through the characters in the help string and create text objects
    // to display on the help screen
    var lastChar = 0;
    for(var char = 0; char < help.length + 52; char += 52) {
        // If the end character is greater than the length of the string
        // set the char to be the last one
        // otherwise
        // the substring will be from the previous end point (lastChar)
        // to the new end point
        if(char >= help.length) {
            var helpText = new Text(help.substring(lastChar,help.length),"14pt Arial Black");
            helpText.setPosition(55, (char * .90) + 100);
            helpText.setColor(FONT_COLOR);   
        }
        else {
            var helpText = new Text(help.substring(lastChar,char),"14pt Arial Black");
            helpText.setPosition(55, (char * .90) + 100);
            helpText.setColor(FONT_COLOR); 
        }
        
        // Add line and set end point 
        add(helpText);
        lastChar = char;
    }
    
    
    // Draw the back button
    add(top);
    add(bot);
    add(right);
    add(left);
    add(backText);
    
    
    // Set the program to wait for a mouse click on the back button
    mouseClickMethod(backButton);
    
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function backButton(e) {
    // Save the x and y coordinates of the 
    var x = e.getX();
    var y = e.getY();
    
    // Check to see if the back button was clicked
    if(y >=40 && y <= 105 && x >= 37 && x <= 140) {
        // Return to the title Screen
        titleScreen();
    }
}

// This function is for temperory use for mouse click and key methods 
function doNothing(e) {
    return;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function createWorld() {
    // Create the world array with no blocks inside of it
    for(var row = 0; row < WORLD_HEIGHT/BLOCK_SIZE; row++) {
        var rowArray = [];
        for(var col = 0; col < WORLD_WIDTH/BLOCK_SIZE; col++) {
            rowArray.push(0);
        }
        world.push(rowArray);
    }
    
    // Create the floor
    for(var col = 0; col < WORLD_WIDTH/BLOCK_SIZE; col++) {
        addBlock(world.length-1,col);
    }
    
    // Draw the side blocks
    leftSide();
    rightSide();
    
    // Draw the center blocks
    worldCenter();
        
}

function worldCenter(){
    
    // Create the center wall
    for(var row = 8; row < WORLD_HEIGHT/BLOCK_SIZE; row++) {
        addBlock(row,world[row].length-15);
    }
    
    // Create the side "teeth" to the wall
    for(var row = 8; row < WORLD_HEIGHT/BLOCK_SIZE; row+=2) {
        if(row!=10){
            addBlock(row,world[row].length-16);
        }
    }
    
    for(var row = 8; row < WORLD_HEIGHT/BLOCK_SIZE; row+=2) {
        if(row!=10){
            addBlock(row,world[row].length-14);
        }
    }
    
    
    
}

function leftSide() {
    // Create other obstacles
    
    // Up top Left Side
    for(var col = 3; col < WORLD_WIDTH/BLOCK_SIZE-20; col++) {
        addBlock(world.length-17,col);
    }
    
    // Middle left side
    for(var col = 4; col < WORLD_WIDTH/BLOCK_SIZE-20; col++) {
        addBlock(world.length-8,col);
    }


    // Middle left  side
    for(var col = 0; col < WORLD_WIDTH/BLOCK_SIZE-25; col++) {
        addBlock(world.length-14,col);
    }
    
    //Platform
    for(var col = 3; col < WORLD_WIDTH/BLOCK_SIZE-20; col++) {
        addBlock(world.length-17,col);
    }
    
    // Create the side walls
    for(var row = 11; row < WORLD_HEIGHT/BLOCK_SIZE-8; row++) {
        addBlock(row,world[row].length-23);
    }
    
    // Create the side walls
    for(var row = 18; row < WORLD_HEIGHT/BLOCK_SIZE; row++) {
        addBlock(row,world[row].length-22);
    }
    
    // Create pyramid
    for(var row = 16; row < WORLD_HEIGHT/BLOCK_SIZE; row++) {
        addBlock(row,row-17);
    }
    
    // Add some blocks for game effect
    addBlock(15,0);
    addBlock(16,11);
    addBlock(16,12);
    
    addBlock(3,8);
    addBlock(2,8);
    
    
}

function rightSide() {
    // Create other obstacles
    
    // Up top right Side
    for(var col = WORLD_WIDTH/BLOCK_SIZE-9; col < WORLD_WIDTH/BLOCK_SIZE-3; col++) {
        addBlock(world.length-17,col);
    }
    
    // Middle right side
    for(var col = 20; col < WORLD_WIDTH/BLOCK_SIZE-4; col++) {
        addBlock(world.length-8,col);
    }
    
    //Platform
    for(var col = 25; col < WORLD_WIDTH/BLOCK_SIZE; col++) {
        addBlock(world.length-14,col);
    }
    
    // Create the side walls
    for(var row = 11; row < WORLD_HEIGHT/BLOCK_SIZE-8; row++) {
        addBlock(row,world[row].length-7);
    }
    
    // Create the side walls
    for(var row = 18; row < WORLD_HEIGHT/BLOCK_SIZE; row++) {
        addBlock(row,world[row].length-8);
    }
    
    // Create pyramid
    var col=WORLD_WIDTH/BLOCK_SIZE;
    for(var row = 16; row < WORLD_HEIGHT/BLOCK_SIZE; row++) {
        addBlock(row,col);
        col--;
    }
    

    // Add some blocks for game effect
    addBlock(15,28);
    addBlock(16,16);
    addBlock(16,17);
    
    addBlock(2,20);
    addBlock(3,20);
    
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// Return a graphical image that represents the block on the screen
function createBlock(row,col) {
    // Determine the x and y of the block's position
    var x = col * BLOCK_SIZE;
    var y = row * BLOCK_SIZE;
    
    // Create the block
    var block = new WebImage("https://farm3.staticflickr.com/2335/2072470686_9d034731a5.jpg");
    block.setSize(BLOCK_SIZE,BLOCK_SIZE);
    block.setPosition(x,y);
    return block;
}

// Adds a block to a given spot in the world array
function addBlock(worldRow,worldColumn){
    // Create and Add the block in the correct position
    if(!worldBlocked(worldColumn * BLOCK_SIZE + 5 , worldRow  * BLOCK_SIZE + 5 )) {
        world[worldRow][worldColumn] = createBlock(worldRow,worldColumn);
        add(world[worldRow][worldColumn]);
    }
}

// Remove a given block from the world array and the screen
function removeBlock(worldRow,worldColumn) {
    remove(world[worldRow][worldColumn]);
    world[worldRow][worldColumn] = 0;
}

function worldBlocked(x,y) {
    // Returns True if the given (x,y) coordinate is in the position
    // of one of the world blocks
    
    // Determine what index of the world array has the given (x,y)
    var row = Math.floor(y/25);
    var col = Math.floor(x/25);
    
    
    // Return the correct value
    try{
        return world[row][col] != 0;
    }catch(TypeError){
        // The given (x,y) is not inside the world, return false
        // because there is no block there
        return false;
    }
    
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function setUpGame() {
    removeAll();
    mouseClickMethod(doNothing);
    
    // Create the Scoreboard
    var lineWidth = 3
    var divider = new Line(0,50-lineWidth,getWidth(),50-lineWidth);
    divider.setColor(Color.white);
    divider.setLineWidth(lineWidth);
    add(divider);
    
    
    // create the world in 25x25 squares that will be breakable
    createWorld();
    
    // Draw all six cannons on the screen
    for(var i = 0; i < cannons.length; i ++) {
        cannons[i].draw();    
    }
    
    // Start gravity for each cannon and begin the game
    setTimer(gravity,UPDATE_TIME);
    playGame();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////



function gravity(){
    // initialize i which wil be used to loop through velocity values
    // and smooth the cannons landing
    
    for(var i = 0; i < cannons.length; i ++) {
        cannons[i].cannonGravity();
    }
    
    
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function playerHasLost(team) {
    // Make a failsafe for if all cannons are dead; however, it 
    // should not be posssible
    
    if(BLUE_CANNON_1.getHealth() <= 0 && BLUE_CANNON_2.getHealth() <= 0 &&
            BLUE_CANNON_3.getHealth() <= 0 &&  RED_CANNON_1.getHealth() <= 0 && 
            RED_CANNON_2.getHealth() <= 0 && RED_CANNON_3.getHealth() <= 0) {
        return false;     
    }
    // See if the blue team has lost
    else if(team == BLUE_TEAM) {
        return BLUE_CANNON_1.getHealth() <= 0 && BLUE_CANNON_2.getHealth() <= 0 &&
            BLUE_CANNON_3.getHealth() <= 0;
    }
    // See if the red team has lost 
    else if(team == RED_TEAM) {
        return RED_CANNON_1.getHealth() <= 0 && RED_CANNON_2.getHealth() <= 0 &&
            RED_CANNON_3.getHealth() <= 0;
    }
    // Nobody has lost or one of the teams was not sent
    else {
        return false;    
    }
}

// Determine who goes first
function getFirstTeam() {
    return Randomizer.nextBoolean() ? BLUE_TEAM : RED_TEAM;
}



function determineCannon(e) {
    // Get the x and y of the mouse click
    var x = e.getX();
    var y = e.getY();
    
    // Check to see if a cannon was clicked on the current team
    if(CURRENT_TEAM == BLUE_TEAM) {
        // Loop through the set of blue cannons and check if one was clicked
        for(var i = 0; i < 3; i++) {
            if(cannons[i].isClicked(x,y)) {
                SELECTED_CANNON = cannons[i];    
            }
        }
    }
    
    if(CURRENT_TEAM == RED_TEAM) {
        // Loop through the set of red cannons and check if one was clicked
        for(var i = 3; i < cannons.length; i++) {
            if(cannons[i].isClicked(x,y)) {
                SELECTED_CANNON = cannons[i];    
            }
        }
    }
    
    // A cannon has been selected
    if(SELECTED_CANNON != null){
        
        // Set up cannon information
        INSTRUCTIONS.setText(CURRENT_TEAM + " team, aim your cannon");
        angle = SELECTED_CANNON.getAngle()*Math.PI/180;
        size = SELECTED_CANNON.getSize();
        add(AIM_LINE);
        
        // Set up the game to wait for them to shoot
        // and to allow them to move
        mouseClickMethod(shootCannon);
        mouseMoveMethod(aimCannon);
    }
    
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function shootCannon(e){
    
    //Stop the user from doing anything 
    mouseMoveMethod(doNothing);
    keyUpMethod(doNothing);
    keyDownMethod(doNothing);
    mouseClickMethod(doNothing);
    
    // Create the intial velocity and attempt to smoothen the values
    // the farther the user clicks from the cannon, the faster the ball
    // will shoot and the more damage it will do
    var initialVelocity = Math.sqrt(Math.pow(Math.abs(e.getX()-SELECTED_CANNON.getCenterX()),2) + 
                            Math.pow(Math.abs(e.getY()-SELECTED_CANNON.getCenterY()),2));
    
    // Alter values so they are not too lage or too big
    initialVelocity-=40;
    if(initialVelocity < 20) {
        initialVelocity += 5;    
    }
    else if(initialVelocity > 80) {
        initialVelocity -= 30;    
    }
    else if(initialVelocity>60){
        initialVelocity-=15;    
    }
    // Shifts values towards 40
    initialVelocity = 40 + ((initialVelocity) - 40) * 0.15;
    
    // Create a minumum and maximum value
    if(initialVelocity < -80) {
        initialVelocity = 0;    
    }
    else if(initialVelocity > 80) {
        initialVelocity = 80;    
    }
    
    // initialize the position of the cannonball and draw it
    cannonBall.setX(SELECTED_CANNON.getCenterX());
    cannonBall.setY(SELECTED_CANNON.getCenterY());
    cannonBall.draw();
    
    // launch the ball
    cannonBall.launch(initialVelocity,angle);
    
    setTimer(cannonBallUpdate,40);
 
}

function damageCannons(x,y) {
    // Damage a cannon if the cannon is hit
    for(var i = 0; i < cannons.length; i++) {
        if(cannons[i].isHit(x,y) && SELECTED_CANNON != cannons[i]) {
            cannons[i].damage(cannonBall.getAttack());   
        }
    }
    
    // Undraw any cannons that died due to the shot
    for(var i = 0; i < cannons.length; i++) {
        if(cannons[i].getState() == "dead") {
            cannons[i].undraw();    
        }
    }
}

function cannonBallUpdate() {
    // Set the timer value to hold at 1 sec left
    totalTime = 9000;
    if(cannonBall.update()){
        try {
            // Do not let the player click again, undraw the ball, and
            // stop the timer for updating the cannonball
            stopTimer(cannonBallUpdate);
            cannonBall.undraw();
            mouseClickMethod(doNothing);
            
            // Find the last x and y to determine if a block should be removed 
            // and if so, remove the block
            var x = cannonBall.getLastX();
            var y = cannonBall.getLastY();
            //println("turn "+x+ " " + y);
            var row = Math.floor(y/25);
            var col = Math.floor(x/25);
            if(row != world.length-1 && world[row][col] != 0) {
                removeBlock(row,col);
            }
            
            // Affect the cannons health if they are shot
            damageCannons(x,y);
            
            
            // End the users turn
            totalTime = 10000;
            
        }
        catch(TypeError) {
            //  The cannon was shot off of the screen
            //println("uh oh");
            
        }
    }
    
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function aimCannon(e) {
    
    // This function changes the angle of the selected cannon 
    // for visual effect and for a line to help the user shoot
    
    // Get the x and y of the mouse click
    var mouseX = e.getX();
    var mouseY = e.getY();
    // Get the size of the cannon to determine starting point of aim line
    size = SELECTED_CANNON.getSize();
    
    // Find the the angle of the mouse to the center of the cannon
    var wheelCenterX = SELECTED_CANNON.getCenterX();
    var wheelCenterY = SELECTED_CANNON.getCenterY();
    var distanceX = (mouseX-wheelCenterX);
    var distanceY = -(mouseY-wheelCenterY);
    angle = Math.abs(Math.atan(distanceY/distanceX));
    
    // Convert to Degrees
    var degrees = angle/Math.PI * 180;
    
    if(distanceX < 0 && distanceY > 0) {
        degrees = 180 - degrees;    
    }
    else if(distanceX < 0 && distanceY < 0) {
        degrees = 180 + degrees;    
    }
    else if(distanceX > 0 && distanceY < 0) {
        degrees = 360 - degrees;    
    }
    else if(distanceX == 0 && distanceY < 0) {
        degrees = 270;    
    }
    else if(distanceX < 0 && distanceY == 0) {
        degrees = 180;    
    }
    
    // Update angle
    SELECTED_CANNON.setAngle(degrees);
    SELECTED_CANNON.update();
    
    // Save the angle in radians
    angle = convertToRadians(degrees);

    
}



function keyPressed(e) {
    
    // This function sets the status to true to represent that a key
    // is currently being pressed
    
    if(e.keyCode == Keyboard.letter('a')){
		A_STATUS = true;
	}
	else if(e.keyCode == Keyboard.letter('d')){
		D_STATUS = true;
	}
	
	if(e.keyCode == Keyboard.letter('w')){
		W_STATUS = true;
	}
	
	
}

function keyReleased(e){
    
    // This function sets the status to true to represent that a key
    // is not currently being pressed
    
    if(e.keyCode == Keyboard.letter('a')){
		A_STATUS = false;
	}
	else if(e.keyCode == Keyboard.letter('d')){
		D_STATUS = false;
	}
	
	if(e.keyCode == Keyboard.letter('w')){
		W_STATUS = false;
	}
	
}


function moveCannon() {
    
    // This function allows the selected cannon to jump and 
    // move side to side
    

    if(SELECTED_CANNON!=undefined){
    
        // Define the xVelocity of the cannon 
        var xVelocity = 0;
        if(A_STATUS && D_STATUS) {
        
        }
        else if(A_STATUS) {
            xVelocity = -4;
        }
        else if(D_STATUS) {
            xVelocity = 4;
        }
        
        // Move the cannon sideways by xVelocity
        if(!worldBlocked(SELECTED_CANNON.getX() + xVelocity,SELECTED_CANNON.getY() - 3) &&
            !worldBlocked(SELECTED_CANNON.getCannonRight() + xVelocity,SELECTED_CANNON.getY() - 3) &&
            !worldBlocked(SELECTED_CANNON.getX() + xVelocity, SELECTED_CANNON.getCenterY()) &&
            !worldBlocked(SELECTED_CANNON.getCannonRight() + xVelocity, SELECTED_CANNON.getCenterY()) ){
            SELECTED_CANNON.setX(SELECTED_CANNON.getX()+xVelocity);
        }
        
        // Change the magnitudes of the users jump to make it smooth
        if(JUMPING) {
            JUMP_LOOP++;
            if(JUMP_LOOP == 18){
                JUMP_LOOP = 0;
                JUMP_MAGNITUDE = 0;
                JUMPING = false;
            }
            
            if(JUMP_LOOP % 3 == 0) {
                JUMP_MAGNITUDE++;    
            }
            
        }
        
        if(W_STATUS && SELECTED_CANNON.getYVelocity() == 0 && 
            (worldBlocked(SELECTED_CANNON.getX(),SELECTED_CANNON.getY() + 5) || 
            worldBlocked(SELECTED_CANNON.getCenterX(),SELECTED_CANNON.getY() + 5) ||
            worldBlocked(SELECTED_CANNON.getCannonRight(),SELECTED_CANNON.getY() + 5))) {
                JUMPING = true;
                JUMP_MAGNITUDE = -8;
        }
        if(JUMPING) {
            SELECTED_CANNON.setYVelocity(JUMP_MAGNITUDE);
        }
    }
}



function blueTurn() {
    
    // Update the time the player's turn has spent 
    totalTime += UPDATE_TIME;
    
    
    // Determine if the user has selected a cannons
    if(SELECTED_CANNON!=null){
        
        // Allow the cannon to move
        moveMethods();
        
        // Update the cannon's aim line
        updateLine();
    }
    else {
        // Allow the user to choose the cannon they would like to shoot with
        mouseClickMethod(determineCannon);    
    }
    
    // Update timer and health
    TIMER.setText(10-Math.floor(totalTime/1000));
    displayHealth();
    
    // Users turn has ended
    if(totalTime >= 10000) {
        
        // Stop Timer 
        stopTimer(blueTurn);
        
        // Reset values for potential next turn
        resetTurn();
        
        
        // See if the game is over
        if(playerHasLost(RED_TEAM)) {
            // Game is over. End the game
            finishGame(BLUE_TEAM);    
        }
        else {
            // Game is not over. Next player's turn
            CURRENT_TEAM = RED_TEAM;
            INSTRUCTIONS.setText(CURRENT_TEAM + " team, select your cannon");
            setTimer(redTurn,UPDATE_TIME);
        }
    }
    
}

function redTurn() {
    
    // Update the time the player's turn has spent 
    totalTime += UPDATE_TIME;
    
    
    // Determine if the user has selected a cannons
    if(SELECTED_CANNON!=null){
        
        // Allow the cannon to move
        moveMethods();
        
        // Update the cannon's aim line
        updateLine();
        
    }
    else {
        // Allow the user to choose the cannon they would like to shoot with
        mouseClickMethod(determineCannon);    
    }
    
    // Update timer and health
    TIMER.setText(10-Math.floor(totalTime/1000));
    displayHealth();
    
    // Users turn has ended
    if(totalTime >= 10000) {
        
        // Stop Timer
        stopTimer(redTurn);
        
        // Reset values for potential next turn
        resetTurn();
        
        // See if the game is over
        if(playerHasLost(BLUE_TEAM)) {
            // Game is over. End the game
            finishGame(RED_TEAM);   
        }
        else {
            // Game is not over. Next player's turn
            CURRENT_TEAM = BLUE_TEAM;
            INSTRUCTIONS.setText(CURRENT_TEAM + " team, select your cannon");
            setTimer(blueTurn,UPDATE_TIME);
        }
    }
    
    
}

function updateLine() {
    // Change the endpoints of the aim line
    lineStartX = SELECTED_CANNON.getCenterX() + size * Math.cos(angle) * 1.5 * STANDARD_CANNON_WIDTH;
    lineStartY = SELECTED_CANNON.getCenterY() - size * Math.sin(angle) * 1.5 * STANDARD_CANNON_WIDTH;
    lineEndX = SELECTED_CANNON.getCenterX() + size * Math.cos(angle) * 2.5 * STANDARD_CANNON_WIDTH;
    lineEndY = SELECTED_CANNON.getCenterY() - size * Math.sin(angle) * 2.5 * STANDARD_CANNON_WIDTH;
    
    // Alter the endpoints of the aim line
    AIM_LINE.setPosition(lineStartX,lineStartY);
    AIM_LINE.setEndpoint(lineEndX,lineEndY);
}

function moveMethods() {
    // Move the cannon
    keyDownMethod(keyPressed);
    keyUpMethod(keyReleased);
    moveCannon();
}

function resetTurn() {
    // Reset values and methods for other team's turn
    totalTime = 0;
    mouseMoveMethod(doNothing);
    keyDownMethod(doNothing);
    mouseClickMethod(doNothing);
    SELECTED_CANNON = null;
    AIM_LINE.setPosition(-5,-5);
    AIM_LINE.setEndpoint(-5,-5);
}

function playGame() {
    
    var firstTeam = getFirstTeam(); // determines which of the two teams goes first

    // Draw all game visuals on the screen
    add(TIMER);
    add(INSTRUCTIONS);
    add(HEALTH_B1);
    add(HEALTH_B2);
    add(HEALTH_B3);
    add(HEALTH_R1);
    add(HEALTH_R2);
    add(HEALTH_R3);
    
    // Define the instructions and initiate gameplay
    INSTRUCTIONS.setText(firstTeam + " team, select your cannon");
    if(firstTeam == BLUE_TEAM) {
        CURRENT_TEAM = BLUE_TEAM;
        setTimer(blueTurn,UPDATE_TIME);      
    }
    else {
        CURRENT_TEAM = RED_TEAM;
        setTimer(redTurn,UPDATE_TIME);  
    }
    
}


function displayHealth(){
    
    // This function updates the health of the cannons
    
    HEALTH_B1.setText(BLUE_CANNON_1.getHealth() >= 0 ? BLUE_CANNON_1.getHealth() : 0);
    HEALTH_B2.setText(BLUE_CANNON_2.getHealth() >= 0 ? BLUE_CANNON_2.getHealth() : 0);
    HEALTH_B3.setText(BLUE_CANNON_3.getHealth() >= 0 ? BLUE_CANNON_3.getHealth() : 0);
    
    HEALTH_R1.setText(RED_CANNON_1.getHealth() >= 0 ? RED_CANNON_1.getHealth() : 0);
    HEALTH_R2.setText(RED_CANNON_2.getHealth() >= 0 ? RED_CANNON_2.getHealth() : 0);
    HEALTH_R3.setText(RED_CANNON_3.getHealth() >= 0 ? RED_CANNON_3.getHealth() : 0);
}


function finishGame(winningTeam) {
    // Tell the winner of the game congratulations
    println("Congrats, " + winningTeam);
}


function start() {
    // Begin the first task of the program, the title screen
    titleScreen();
}