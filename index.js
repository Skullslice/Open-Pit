var currentMap = "";
var spawnY = 0;
var groundY = 0;
var prestige = {x: 0, y: 0, z: 0};
var items = {x: 0, y: 0, z: 0};
var upgrades = {x: 0, y: 0, z: 0};
var mapInfo = [];


function getMap() {
    // if the enderchest is at a location we know what map it is. x/z seems to be 1 off???
    var kings = World.getBlock(-11, 95, 6)?.getId().toString() == "minecraft:ender_chest" //done
    var corals = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest"
    var ogmap = World.getBlock(-13, 114, 7)?.getId().toString() == "minecraft:ender_chest" //done
    var seasons = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest"
    var genesis = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest"
    
    //get the current map and set locations.
    if (kings) {
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
Chat.log(getMap().toString())
