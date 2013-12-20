/*
card_array:
   24 total

   pirmas rusis
   1 - sirdys
   2 - dzvonkai
   3 - cirvai
   4 - bugnai
   antras spalva
   1 - tuzas
   2 - karalius
   3 - dama
   4 - bartukas
   5 - dyse
   6 - dyve
*/


var card_deck = new(function() {   
  this.card_array = new Array(11,12,13,14,15,16,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,46);

  this.random_func = function()  {
    return (Math.round(Math.random())-0.5);
  }

  this.randomize = function()  {
    this.card_array.sort(this.random_func);
  }
});

var http = require('http'), 
        io = require('./lib/socket.io'),

server = http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Trinka</h1>');
});

server.listen(8081);

function setCharAt(str,index,chr) {
  if(index > str.length-1) return str;
  return str.substr(0,index) + chr + str.substr(index+1);
}



// ================================================================
// player class for player properties, states etc.
// PLAYER
function player(id,serverId) {
  this.id = id;
  this.name;
  this.client;
}

// ================================================================
// socket.io, I choose you
var socket = io.listen(server);

// ================================================================
// player manager manages players in game
// PLAYER MANAGER
var player_manager = new(function() {
  this.players=new Array();

  this.add_player = function(id) {
    this.players.push(new player(id));
  }

  this.set_player = function(name,id,client) {
    for(var i=0;i<this.players.length;i++)
    {
      if(this.players[i].id == id) {
        this.players[i].name = name;
        this.players[i].client = client;
        }
    }
  }
  // ---------------------------------------------
  this.get_player_count = function() {
    return this.players.length;
  }
  // ----------------------------------------------
  this.remove_player = function(client)
  {
    for(var i=0;i<this.players.length;i++)
    {
      if(this.players[i].id == client.sessionId)
      {
        this.players.splice(i,1);
      }
    }
  }
});

// ================================================================
// packet forge for crafting outgoing packets
// PACKET FORGE
var packet_forge = new(function() {
    this.packet;
    this.init_packet = function(client) {
        this.packet = "0 ";
        client.send(this.packet);
    }
    // ---------------------------------------
    this.player_list = function(client) {
        this.packet = "3 |" + (player_manager.players.length-1);
        console.log("player-list:" + this.packet);
        for(var i=0;i<player_manager.players.length-1;i++)
        {
          if(client.sessionId != player_manager.players[i].id)
          {
            this.packet += "|" + player_manager.players[i].name + ":" + player_manager.players[i].id;
          }
        }
        client.send(this.packet);
    }
    this.send_all = function(data) {
      for(var i=0;i<player_manager.players.length;i++){
        player_manager.players[i].client.send(data);
      }
    }
    // --------------------------------------
    this.deal_cards = function()
    {
      this.send_all("6 |" + player_manager.get_player_count());
    }
    // ---------------------------------------
    this.player_disconnect = function(client) {
       client.broadcast("4 |" + client.sessionId);
       player_manager.remove_player(client);
    }
   // ---------------------------------------
   this.player_connected = function(name,client) {
       console.log("sending connected player:" + client.sessionId);
       for(var i=0;i<player_manager.players.length;i++)
       {  
          this.packet = "5 |";
          if(player_manager.players[i].id != client.sessionId)
          {
            this.packet+= name + "|" + client.sessionId;
            player_manager.players[i].client.send(this.packet);
          }
       }
    }
   // ----------------------------------------
   
});
// ======================================================================================
// timer

function timer(time, callback) {
  this.start_time = 0;
  this.elapsed;
  this.end_time = time;
  this.callback = callback;

  this.start = function() {
    this.start_time = new Date().getTime();
  }
  
  this.reset = function() {
    this.start_time = new Date().getTime();
  }
  // --------------------------------------
  this.is_stoped = function() {
    this.elapsed = new Date().getTime() - this.start_time;
    if(this.elapsed > this.end_time) {
        this.callback();
      return true;
    }
    else
      return false;
  }
}

var timer_manager = new(function() {
  this.timers = new Array();

  this.add_timer = function(time,callback) {
    var tmp = new timer(time,callback);
    tmp.start();
    this.timers.push(tmp);
}


  this.update = function() {
    for(var i=this.timers.length-1;i>=0;i--)  {
      if(this.timers[i].is_stoped()) {
         this.timers.splice(i,1);
      }
    }
  }
});


// =======================================================================================
// server loop

const GAME_STATE_DEAL = 4;
const GAME_STATE_DEALING_END = 1;
const GAME_STATE_WAIT = 2;
const GAME_STATE_PENDING = 3;
var game = new(function()  {
   this.game_state = GAME_STATE_WAIT;
   this.next_state;
   // --------------------------------------------------
   this.game_play = function() {
    switch(this.game_state) {
      case GAME_STATE_WAIT:
        if(player_manager.get_player_count() > 1) {
          console.log("Enought players dealing cards waiting...");
          this.game_state = GAME_STATE_PENDING;
          this.next_state = GAME_STATE_DEAL;
          timer_manager.add_timer(5000,this.change_state);
        }
        break;
      case GAME_STATE_DEAL:
        console.log("Dealing");
        this.deal_cards();
        packet_forge.deal_cards();
        break;
      case GAME_STATE_DEALING_END:
        this.game_state = GAME_STATE_PENDING;
        console.log("Dealing end");
        break;
      case GAME_STATE_PENDING:
        break;
    }
   }
   // ---------------------------------------------------
   
   // ---------------------------------------------------
   this.deal_cards = function() {
     this.next_state = GAME_STATE_DEALING_END;
     this.game_state = GAME_STATE_PENDING;
     timer_manager.add_timer(player_manager.get_player_count() * 3000, this.change_state);
   }
   // ---------------------------------------------------
   this.stop_deal = function() {
     
   }

   this.wait = function() {
     this.wait_timer.start();
   }

   this.change_state = function() {
      game.game_state = game.next_state;
   }
   // ---------------------------------------------------
      // ----------------------------------------------------
});
console.log("Starting game loop");
function game_loop() {
     game.game_play();
     timer_manager.update();
     setTimeout(game_loop, 500);
}
game_loop();


// ================================================================
// packet handler that handles incoming packets
// PACKET HANDLER
var packet_handler = new(function() {
    
    this.parse_value = function(data,i)
    {
    var tokens = data.split("|");
    if(i<tokens.length) {
      return tokens[i];
      }
    }    

    this.new_player = function(name,id,client) {
      player_manager.set_player(name,id,client);
    }

    this.parse = function(data,id,client) {
    var command = parseInt(data.substr(0,2)); 
    switch(command) {
      case 1:
      var name = this.parse_value(data,1);
      packet_forge.player_list(client);
      this.new_player(name,id,client);
      packet_forge.player_connected(name,client);
      break;
      }
    }
});

// ================================================================
// NETWORK EVENTS
socket.on('connection', function(client){
  player_manager.add_player(client.sessionId, client);
  packet_forge.init_packet(client);

  client.on('message', function(message){
    packet_handler.parse(message, client.sessionId,client);
  })
  client.on('disconnect', function(){
    console.log("disconnect event:" + client.sessionId);
    packet_forge.player_disconnect(client);   
  })
});


