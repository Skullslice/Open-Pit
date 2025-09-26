var currentMap = null;
var spawnY = 0;
var groundY = 0;
var prestige = {x: 0, y: 0, z: 0};
var items = {x: 0, y: 0, z: 0};
var upgrades = {x: 0, y: 0, z: 0};
var mapInfo = [];

JsMacros.on("JoinServer", event => {
    JsMacros.waitforevent("ChunkLoad");
    Client.waitTick(100); //wait 5 seconds for world to fully load
    getMap();
    
});

function getMap() {
    var kings = World.getBlock(-11, 95, 6)?.getId().toString() == "minecraft:ender_chest";
    var corals = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest";
    var ogmap = World.getBlock(-13, 114, 7)?.getId().toString() == "minecraft:ender_chest";
    var seasons = World.getBlock(-12, 114, 5)?.getId().toString() == "minecraft:ender_chest";
    var genesis = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest";
    var limbo = World.getBlock(-21, 33, 23)?.getId().toString() == "minecraft:torch" && World.getBlock(-21, 33, 19)?.getId().toString() == "minecraft:torch";
    var hypixelHub = World?.getScoreboards()?.getCurrentScoreboard()?.getName()?.includes("MainScoreboard");
    
    //get the current map and set locations.
    if (limbo) {
       //logic for limbo
    }
    else if (hypixelHub) {
        //logic for the bot being in hub
    }
    else if (kings) {
        currentMap = "kings"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
        
    }
    else if (corals) {
        currentMap = "corals"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
    }
    else if (ogmap) {
        currentMap = "ogmap"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
    }
    else if (seasons) {
        currentMap = "seasons"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
    }
    else if (genesis) {
        currentMap = "genesis"
        spawnY = 50
        groundY = 40
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
    }
    else {
        currentMap = "unknown"
        spawnY = 0
        groundY = 0
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        GlobalVars.putDouble("clickHeight", 70);
        GlobalVars.putDouble("mapHeight", 80);
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
