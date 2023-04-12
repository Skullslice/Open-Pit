// Aim Assist Coded By -<>-Holiday-<>- Much Love mwah<3
const vectorClass = Java.type("xyz.wagyourtail.jsmacros.client.api.sharedclasses.PositionCommon$Vec3D")
const player = Player.getPlayer()
const playerYaw = Player.getPlayer().getYaw();

function d(a, b) {
  return Math.abs(a - b);
}

function absd(a, b) {
  return Math.abs(Math.abs(a) - Math.abs(b));
}

function arrayMin(arr) {
  return Math.min(...arr);
}

function arrayMax(arr) {
  return Math.max(...arr);
}

function look() {
    var maxDist = 4.2
    var thisTime = Time.time()
    var players = World.getLoadedPlayers().toArray()
    var nextLook = Math.floor(Math.random() * 110 + 85) //Next Look
    var jitterX = Math.floor(Math.random() * 28 - 14) //-14 -> 14 angle added onto Horizon
    var jitterY = Math.floor(Math.random() * 16) //random pitch
    var c = {x:player.getX(), y:player.getY()+player.getEyeHeight(), z:player.getZ()}
    var targets = [];
    var close = [];
    
    for (i=0; i<players.length; i++) {
        var posX = players[i].getX()
        var posY = players[i].getY()
        var posZ = players[i].getZ()
        var t = {x:posX, y:posY, z:posZ}
        var vec = new vectorClass(c.x, c.y, c.z, t.x, t.y, t.z) //vector between you and target
        var goalYaw = vec.getYaw()
        
        if (d(t.x, c.x)>maxDist||d(t.y, c.y)>maxDist||d(t.z, c.z)>maxDist) continue;
        targets.push(vec.getYaw())
        close.push(absd(playerYaw, goalYaw))
    }
    Chat.log("cursor: " + close[1] + " behind: " + close[2])
    targets = [];
    close = [];
}
look()




/*
let yawDifference = goalYaw - player.getYaw();
if (yawDifference <= -180) yawDiffernce = 360 + yawDifference;
else if (yawDifference >= 180) yawDifference = 360 - yawDifference;

if (GlobalVars.getObject("lookCD") < thisTime) {
    GlobalVars.putObject("lookCD", (thisTime + cooldown))
    for(let i = 0; i < STEPS; i ++) {
        player.lookAt(player.getYaw() + yawDifference / STEPS, player.getPitch())
        Time.sleep(TIME_INTERVAL)
    }
}
*/
