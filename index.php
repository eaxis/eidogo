<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
<title>EidoGo - SGF Replayer</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" href="site-style.css" />
<link rel="stylesheet" href="player/player.css" />
<script type="text/javascript" src="player/player.compressed.js"></script>
<!-- Uncomment the following to work with the original source -->
<!-- <script type="text/javascript" src="js/yui-util.js"></script>
<script type="text/javascript" src="js/yui-slider.js"></script>
<script type="text/javascript" src="js/yui-ext-domhelper.js"></script>
<script type="text/javascript" src="js/util.js"></script>
<script type="text/javascript" src="js/eidogo.js"></script>
<script type="text/javascript" src="js/gametree.js"></script>
<script type="text/javascript" src="js/sgf.js"></script>
<script type="text/javascript" src="js/board.js"></script>
<script type="text/javascript" src="js/rules.js"></script>
<script type="text/javascript" src="js/player.js"></script> -->
<?php
include("php/json.php");
$json = new Services_JSON();
$in = $_SERVER['QUERY_STRING'];
if (!$in || $in == "kjd") {
	$cfg = array(
		"domId"				=> "player-container",
		"mode"				=> "replay",
		"sgfUrl"			=> "php/kjd_progressive.php",
		"progressiveLoad"	=> true,
		"markCurrent"		=> true,
		"markVariations"	=> true,
		"markNext"			=> true,
		"showGameInfo"		=> true,
		"showPlayerInfo"	=> false,
	);
} else {
	$cfg = array(
		"domId"				=> "player-container",
		"mode"				=> "replay",
		"sgfUrl"			=> "sgf/$in.sgf",
		"progressiveLoad"	=> false,
		"markCurrent"		=> true,
		"markVariations"	=> true,
		"markNext"			=> false,
		"showGameInfo"		=> true,
		"showPlayerInfo"	=> true,
	);
}
?>
<script type="text/javascript">
//<![CDATA[
var player;
YAHOO.util.Event.on(window, "load", function() {
	var cfg = <?php echo $json->encode($cfg); ?>;
	cfg.loadPath = location.hash.replace(/^#/, "").split(/,/);
	player = new eidogo.Player(cfg);
});
//]]>
</script>
</head>
<body>
	
<h1>EidoGo</h1>

<ul id="links">
	<li><a href="http://senseis.xmp.net/?EidoGo">Info</a> | </li>
	<li><a href="source.html">Download / Source Code</a> | </li>
	<li><a href="http://sourceforge.net/projects/eidogo/">SourceForge</a> | </li>
	<li><a href="http://tin.nu/">Justin Kramer</a></li>
</ul>

<div id="player-container"></div>

</body>
</html>