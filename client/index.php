<!doctype html>

<html>

<head>
<link rel="shortcut icon" href="gfx/card_fav.ico" type="image/x-icon" /> 
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<style>

body {
  width:460px;
  height:320px;
  margin:0px;
}

#game {
  position:fixed;
  top:0;
  left:0;
  z-index:-1;  
}

div#console {
  height:300px;
  width:300px;
  background-color:black;
  opacity:0.4;
  filter:alpha(opacity=40);
  font-family:"Verdana";
  font-weight:normal;
  font-size:8px;
  color:white;
  margin-left:auto;
  margin-right:auto;
}
.login {
  font-family:"Arial";
  font-size:14px;
  opacity:1.0;
  filter:alpha(opacity=100);
}
div#menu_banner {
  width:280px;
  height:30px;
}
.menu_button 
{
  -moz-outline:0;
  outline:0;
}

h1 {
  font-family:"Arial";
  font-weight:normal;
  font-size:15px;

}
</style>

<script>
function play() {
}
</script>

<title>Trinka</title>
</head>
<body>
<canvas id="game" width="460" height="320"></canvas>
<div id="console">
<h1>Trinka</h1>
<table align="center">
<tr>
<td><label class="login" for="name">Login:</label></td>
<td><input class="login" name="name" id="login_name" placeholder="login"></input></td>
</tr>
<tr></tr>
<tr>
<td></td>
<td align="right"><button id="login_btn" onClick="login()" type="button">Prisijungti</button>
</tr>
</table>
</div>
<script src="jquery-1.5.1.min.js"></script>
<script src="socket.io.js"></script>
<script src="game.js"></script>
</body>
</html> 
