const game_screen_width = 460;
const game_screen_height = 320;
const dev = document.getElementById('game');

var loop_;
var fps_ = 0;
var time_ = new Date;
var ctx_ = dev.getContext('2d');
var connected_=false;

var socket_ = new io.Socket(null, {port: 8081, rememberTransport: false});
//FIXME
var opponent_card_img = new Image();
opponent_card_img.src = "gfx/opponent_card2.png";

var PlayerManager_ = new PlayerManager;
var PacketHandler_ = new PacketHandler;
var PacketForge_ = new PacketForge;
var Background_ = new Background;
var Player_ = new Player;





// Temploary function for logging in
function login() {
 Player.name = $("#login_name").val();
 $("#console").hide();
 start_game();
}



// Player manager for managing opponent players
function PlayerManager() {
  this.opponents_ = new Array();
  this.seats_ = new Array(false,false,false,false,false,false,false);
  
  this.AddOpponent = function(name,id) {
    console.log("-c:adding opponent");
    var opponent = new Opponent(name, id);
    opponent.SetPosition(this.FindSeat());
    this.opponents_.push(opponent);
  }
  
  this.FindSeat = function() {
    for(var i=0;i<7;i++)
    {
      if(!this.seats_[i])
      {
        this.seats_[i] = true;
        return i;
      }
    }
  }

  this.RemoveOpponent = function(id) {
    for(var i=this.opponent.length;i>=0;i--) {
      if(this.opponents_[i].id == id) {
        this.seats_[i] = false;
        this.opponents_.splice(i,1);
      }
    }
  }

  this.DrawOpponentCard = function() {
	var len = this.opponents_.length;
    for(var i=0;i<len;i++) {
      this.opponents_[i].Draw();
    }
  }  

}



// Packet handler
function PacketHandler() {

    this.parse_value = function(data,spliter)
    {
      var tokens = data.split(spliter);
      return tokens;
    }
                                
  this.player_list = function(data) {
    var player_list = this.parse_value(data,"|");
    var count = player_list[1];
    for(var i=0;i<count;i++)
    {
      var sub_data = this.parse_value(player_list[i+2],":");
      var name = sub_data[0];
      var id = sub_data[1];
      PlayerManager.AddOpponent(name,id);
    }
  }
  
  this.RemoveOpponent = function(data) {
    console.log("-s:" + data);
    var player = this.parse_value(data,"|");
    var id = player[1];
    PlayerManager.RemoveOpponent(id);
  }
  
  this.opponent_connected = function(data) {
    console.log("-s:" + data);
    var player = this.parse_value(data,"|");
    var name = player[1];
    var id = player[2];
    PlayerManager.AddOpponent(name,id);
    
  }
  
  this.parse_packet = function(data) {
    var command = parseInt(data.substr(0,2));
    switch(command) {
     case 0: // init
      console.log("-s:init packet");
      break;
     case 3: // player list
      this.player_list(data);
      console.log("-s:player list");
      break;
     case 4: // player disconnected
      console.log("-s:opponent disconnected");
      this.RemoveOpponent(data);
      break;
     case 5: // player connected
      console.log("-s:opponent connected");
      this.opponent_connected(data);
      break;
     case 6: // deal cards
      console.log("-s:dealing cards");
      
      break;
    }
  }

} 


// Packet forge
function PacketForge() {
  
  this.init = function() {
    socket.send("1 |" + player.name);
  }
}

function start_game() {
  console.log("connecting..,");
  socket.connect();
}

socket.on('connect', function(){
  connected=true;
  console.log("-c:connected to server");
  PacketForge_.init();
})

socket.on('message', function(data) {
  PacketHandler.ParsePacket(data);  
})

socket.on('disconnect', function() {
  console.log("-c:disconnected");
  connected=false; 

})

// some pre-setup of dev

dev.width = game_screen_width;
dev.height = game_screen_height;

var ClearContext = function() {
  ctx.fillStyle = "#0000FF";
  ctx.clearRect(0,0,game_screen_width,game_screen_height);
  ctx.beginPath();

  ctx.rect(0,0,game_screen_width,game_screen_height);

  ctx.closePath();

  ctx.fill();
}

ctx.font = "10px verdana";

var draw_fps = function() {
  ctx.fillStyle = "#000000";
  ctx.fillText("FPS: " + Math.ceil((++fps / (((+new Date) - time) / 1000))), 415, 10);
}


//FIXME
function Background() {
    this.image = new Image();
    this.image.src = "gfx/table.png";

    this.draw = function() {
      ctx.drawImage(this.image,0,0, game_screen_width, game_screen_height, 0, 0, game_screen_width, game_screen_height);
    }

}

function draw_connection_status()
{
  ctx.textAlign = "start";
  if(connected)
  {
    ctx.fillStyle = "#00FF00";
    ctx.fillText("Socket.IO connected",10,10);
  }
  else
  {
    ctx.fillStyle = "#FF0000";
    ctx.fillText("Socket.IO disconnected",10,10);
  }
}
// Game card class
function GameCard(type) {
    this.type = type;
    this.image = new Image();
    switch(type)
    {
      case "ace":
        this.image.src = "gfx/ace_cross2.png";
        break;
      case "folded":
        this.image.src = "gfx/folded2.png";
        break;
      case "b9":
        this.image.src = "gfx/9_b.png";
        break;
      case "k9":
        this.image.src = "gfx/9_k.png";
        break;
    }

    this.width = 70;
    this.height = 98;

    this.X = 0;
    this.Y = 0;

    this.draw = function() {
      ctx.drawImage(this.image,0,0,this.width,this.height,this.X,this.Y,this.width,this.height);
    }
    
    this.set_position = function(x,y) {
      this.X = x;
      this.Y = y;
    }

    this.move = function() {
      this.X += 1;
      this.Y += 1;
    }
}
// player class
function Player() { 

  this.name_ = "Unknown";
  this.cards_ = new Array();
  
  // TODO: add function for setting/changing cards
  this.SetCards = function() {
    this.cards_[0] = new GameCard("k9");
    this.cards_[1] = new GameCard("ace");
    this.cards_[2] = new GameCard("b9");
    
    this.cards_[0].set_position(this.cards_[0].height+45,212);
    this.cards_[1].set_position(this.cards_[0].height+115,212);
    this.cards_[2].set_position(this.cards_[0].height+185,212);
  }  
  
  this.DrawName = function() {
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(this.name_,game_screen_width / 2 + 15,315);

  }

  this.DrawCards = function() {
    for(var i=0;i<3;i++)
    {
      this.cards_[i].draw();
    }
  }

}
// opponent class
function Opponent(name,id) {
  this.name = name;
  this.id = id;
  this.position = 0;
  this.X = 0;
  this.Y = 0;
}  
Opponent.prototype.SetPosition = function(pos) {
	this.position = pos;
	
    switch(pos) {
     case 0:
      this.Y = 30;
      this.X = 50;
      break;
     case 1:
      this.Y = 100;
      this.X = 5;
      break;
     case 2:
      this.Y = 5;
      this.X = 180;
      break;
     case 3:
      this.Y = 30;
      this.X = 330;
      break;
     case 4:
      this.Y = 100;
      this.X = 380;
      break;
     case 5:
      this.Y =180; 
      this.X =330;
      break;
     case 6:
      this.Y = 180;
      this.X = 50;
      break;
   } 
}
  
Opponent.prototype.Draw = function() {
    ctx.drawImage(opponent_card_img,0,0,65,51,this.X,this.Y,65,51);
    ctx.textAlign = "center";
    ctx.fillText(this.name,this.X+32,this.Y);
}

Opponent.prototype.Remove = function() {
    
}


  

Player.SetCards();
/*
PlayerManager.AddOpponent("Petras");
PlayerManager.AddOpponent("Jonas");
PlayerManager.AddOpponent("Pragaras");
PlayerManager.AddOpponent("Algis");
PlayerManager.AddOpponent("Zigmas");
PlayerManager.AddOpponent("Dick");
PlayerManager.AddOpponent("Arijana");
*/
var game_loop = function() {
  clear_context();
  background.draw();
  draw_fps();
  draw_connection_status();
  Player.DrawCards();
  Player.DrawName();
  PlayerManager.DrawOpponentCard();
  loop = setTimeout(game_loop, 16);
}

game_loop();



