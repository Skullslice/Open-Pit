var enabled = false; //the bot should be off when cluient starts.
var sneak = true; //occasionally sneaks in middle.
var bow = true; //occasionally uses the bow and aims and shoots.
var finder = true;
var waterbreak = true;
var quality = 0.45
var minimum = 2

var currentMap = null;
var spawnY = 0;
var groundY = 0;
var prestige = {x: 0, y: 0, z: 0};
var items = {x: 0, y: 0, z: 0};
var upgrades = {x: 0, y: 0, z: 0};
var mapInfo = [];

JsMacros.on("JoinServer", JavaWrapper.methodToJava( event => {
    JsMacros.waitforevent("ChunkLoad");
    Client.waitTick(100); //wait 5 seconds for world to fully load
    getMap();
    
});

JsMacros.on("Key", JavaWrapper.methodToJava( event => {
    if (event.key == "key.keyboard.i" && event.action === 1) {
        const reverse = !GlobalVars.getBoolean("ToggleScript");
        GlobalVars.putBoolean("ToggleScript", reverse);
        if (reverse) {
            iterations = {final: false, count: 1};
            GlobalVars.putInt("iterations", 1);
            Chat.log("\u00a74> \u00a73[\u00a7cAfk\u00a73] \u00a74> \u00a7aWaiting for afk kick ->" + " \u00a7b#" + iterations.count);
        }
        else {
            iterations = {final: false, count: "\u00a7f[\u00a78Disabled\u00a7f]"};
            Chat.log("\u00a74> \u00a73[\u00a7cAfk\u00a73] \u00a74> \u00a7f[\u00a78Disabled\u00a7f]");
        }
        return true;
    }
    return false;
}));

function getMap() {
    var kings = World.getBlock(-11, 95, 6)?.getId().toString() == "minecraft:ender_chest";
    var corals = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest";
    var ogmap = World.getBlock(-13, 114, 7)?.getId().toString() == "minecraft:ender_chest";
    var seasons = World.getBlock(-12, 114, 5)?.getId().toString() == "minecraft:ender_chest";
    var genesis = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest";
    var limbo = World.getBlock(-21, 33, 23)?.getId().toString() == "minecraft:torch" && World.getBlock(-21, 33, 19)?.getId().toString() == "minecraft:torch";
    var hypixelHub = World?.getScoreboards()?.getCurrentScoreboard()?.getName()?.includes("MainScoreboard");
    
    //get the current map and set locations.
    if (kings == true) {
        currentMap = "kings"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
        
    }
    else if (corals == true) {
        currentMap = "corals"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
    }
    else if (ogmap == true) {
        currentMap = "ogmap"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
    }
    else if (seasons == true) {
        currentMap = "seasons"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
    }
    else if (genesis == true) {
        currentMap = "genesis"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
    }
    else if (hypixelHub == true) {
        Chat.say("/play pit");
    }
    else if (limbo == true) {
        Client.disconnect();
    }
    else {
        currentMap = "unknown"
        spawnY = -1
        groundY = -1
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", -1);
        GlobalVars.putDouble("mapHeight", -1);
    }
    // returns a nested array of map information.
    mapInfo = [
    "Map: " + currentMap,
    " Spawn: " + spawnY,
    " Ground: " + groundY,
    " Prestige: " + prestige.x, prestige.y, prestige.z,
    " Items: " + items.x, items.y, items.z,
    " Upgrades: " + upgrades.x, upgrades.y, upgrades.z
    ]
    return mapInfo;
}


// Holiday Auto Grinder -->
function dist_mid() {
    const distance = Math.floor(Math.sqrt(
    Player.getPlayer().getPos()?.x ** 2 + Player.getPlayer().getPos()?.z ** 2))
    return distance
}

function dist_player() {
    //TODO: distance player
    var loc = World.getLoadedPlayer
}
function get_closest() {
    var list = World.getLoadedPlayers().toArray();
    var nearest = DOUBLE.MAX_VALUE;
    for (i =0; i < list.length; i++) {
        var distance = dist_player(list[i].loc);
        if (distance >= nearest) continue;
        nearest = distance;
    }
    return nearest;
}

function getBotState(posX, posY, posZ) {
    if (World.isWorldLoaded() && World.getDimension() !== "minecraft:the_end") {
        var area = World.getScoreboards().getCurrentScoreboard()?.getName()
        var botwrld = area?.toString()
        if (botwrld?.includes("Pit", 0)) {
            // bot is in pit
            GlobalVars.putBoolean("isPit", true)
        }
        if (botwrld?.includes("MainScoreboard", 0) || botwrld?.includes("Prototype", 0)) {
            //bot is in hub
            GlobalVars.putBoolean("isPit", false)
            var countdown = Math.floor((GlobalVars.getObject("waitPlay") - Time.time()) / 1000)
            if (countdown >= 1) {
            Chat.log("\u00A78[\u00A7cCMD\u00A78]\u00A7a "
            + (Math.floor(countdown)))
            Client.waitTick(15)
            }
            if (GlobalVars.getObject("waitPlay") < Time.time()) {
                // this is a little glitchy so we also need to update the cooldown
                GlobalVars.putObject("waitPlay", (Time.time() + 9000))
                GlobalVars.putObject("waitHub", (Time.time() + 9000))
                Chat.say("/play pit")
                Chat.log("\u00A7aNo thanks, I like the pit better")
            }
        }
    }
    else {
        GlobalVars.putBoolean("isPit", false)
    }      
    if (World.isWorldLoaded() && World.getDimension() == "minecraft:the_end") {
        //bot is in limbo
        var countdown = Math.floor((GlobalVars.getObject("waitHub") - Time.time()) / 1000)
        if (countdown >= 1) {
        Chat.log("\u00A78[\u00A7cCMD\u00A78]\u00A76 "
        + (Math.floor(countdown)))
        Client.waitTick(15)
        }
        if (GlobalVars.getObject("waitHub") < Time.time()) {
            GlobalVars.putObject("waitHub", (Time.time() + 9000))
            GlobalVars.putObject("waitPlay", (Time.time() + 9000))
            Chat.say("/hub")
        }
    }
    else if (GlobalVars.getBoolean("majorStop")) {
        var majorCD = Math.floor((GlobalVars.getObject("endTime") - Time.time()) * 0.001)
        KeyBind.key(17, false)
        if (majorCD >= 1) {
            Chat.log("\u00A78[\u00A7bMajor Event\u00A78]\u00A76 " + majorCD)
            Chat.say(".toggle aim-assist off")
        }
        else {
            GlobalVars.putBoolean("majorStop", false)
            Chat.log("\u00A78[\u00A7cMajor Event\u00A78] \u00A7aEnded")
        }
    Client.waitTick(80)
    }
    else if (posX > 20 || posX < -20 || posZ > 20 || posZ < -20)
        {
        if (GlobalVars.getBoolean("isPit"))
            {
            Chat.log("\u00A78[\u00A7cCMD\u00A78] \u00A74Exited")
            Client.waitTick(3)
            KeyBind.key(17, false)
            Client.waitTick(2)
            Chat.say("/oof")
            Client.waitTick(25) //wait before doing anything
            }
        }
    else if (posY < mapHeight)
        {
        //Chat.log("In Bounding Box!")
        KeyBind.key(17, true)
        if (Math.random() > 0.77)
            {
            JsMacros.runScript("Jump.js")
            }
        // here we need to use a cubic expression to determine if the bot should look back to middle or not
        if (Math.random() * 2050 < (Math.abs(posX) ** 3) //reccomended to leave between 2000 - 6000
        || Math.random() * 2050 < (Math.abs(posZ) ** 3))
            {
            JsMacros.runScript("Smooth Look.js")
            //Chat.log('\u00a7cLooked')
            }
        if (Math.random() > 0.98 && sneak)
            {
            JsMacros.runScript("Sneak.js")
            }
        }
    else
        {
        KeyBind.key(17, false)
        //Chat.log("Bot is in spawn.")
        JsMacros.runScript("Smooth Look.js")
        JsMacros.runScript("Quality.js")
        Client.waitTick(6) // look at mid before doing anything
        KeyBind.key(17, true)
        while (World.isWorldLoaded() && dist_mid() > 5 && GlobalVars.getBoolean("ToggleScript")
        && dist_mid() < 30) // check if we are in spawn or script gets stopped
            {
            if (GlobalVars.getDouble("midnons") < minimum
            || GlobalVars.getDouble("midquality") < quality) {
                if (GlobalVars.getObject("waitPlay") < Time.time() && finder) {
                    KeyBind.key(17, false)
                    Client.waitTick(4)
                    GlobalVars.putObject("waitPlay", (Time.time() + 8500))
                    Chat.say("/play pit")
                }
            }
            //Chat.log('distance: ' + dist_mid())
            JsMacros.runScript("Smooth Look.js")
            KeyBind.key(17, true)
            if (dist_mid() >= 9)
                {
                JsMacros.runScript("Jump.js")
                }
            Time.sleep(250)
            }
        }
}
// Enable -->
const reverse = !GlobalVars.getBoolean("ToggleScript");
GlobalVars.putBoolean("ToggleScript", reverse);
if (reverse) {
    Chat.log("Holibot Enabled")
    JsMacros.runScript("Auto Click.js")
    } 
    else
    {
        KeyBind.key(17, false)
        Client.waitTick(3)
        Chat.log("Holibot Disabled")
        JsMacros.runScript("Auto Click.js")
        Time.sleep(3000)
        KeyBind.key(17, false)
    }
while (GlobalVars.getBoolean("ToggleScript")) {
    if (World.isWorldLoaded()) {
        var posX = Player.getPlayer().getPos()?.x
        var posY = Player.getPlayer().getPos()?.y
        var posZ = Player.getPlayer().getPos()?.z
        var currentTime = Time.time()
        //if (posX) {
        getBotState(posX, posY, posZ)
        //}
    }
    Client.waitTick(5); // wait 0.25 seconds (synchronized to client ticks)
}
