var players = World.getPlayers().toArray()
var thisTime = Time.time()
var cooldown = rng(120, 550) // cycle time for the next look (ms)
const POSITIONCOMMON_VEC3D = Java.type("xyz.wagyourtail.jsmacros.client.api.sharedclasses.PositionCommon$Vec3D")
const player = Player.getPlayer()
const block = {x: 0, y:0, z:0}
const vec = new POSITIONCOMMON_VEC3D(player.getX(), player.getY()
+player.getEyeHeight(), player.getZ(), block.x, block.y, block.z)
const goalYaw = vec.getYaw()
const TIME = Math.floor(Math.random() * 150 + 600)
const TIME_INTERVAL = 5
const STEPS = TIME / TIME_INTERVAL
let yawDifference = goalYaw - player.getYaw();
if (yawDifference <= -180) yawDiffernce = 360 + yawDifference;
else if (yawDifference >= 180) yawDifference = 360 - yawDifference;

if (GlobalVars.getObject("lookCD") == null || GlobalVars.getObject("lookCD") < thisTime) {
    GlobalVars.putObject("lookCD", (thisTime + cooldown))
    for(let i = 0; i < STEPS; i++) {
        player.lookAt(player.getYaw() + yawDifference / STEPS, player.getPitch())
        Time.sleep(TIME_INTERVAL)
    }
}

function rng(arg1, arg2) {
    return Math.floor(Math.random() * (arg2 - arg1) + arg1);
}
