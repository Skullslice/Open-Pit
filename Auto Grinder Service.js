var enabled = false; //the bot should be off when cluient starts.
var sneak = true; //occasionally sneaks in middle.
var bow = true; //occasionally uses the bow and aims and shoots.
var finder = true;
var waterbreak = true;
var quality = 0.45
var minimum = 2

var currentTime = undefined;

var tickDelay = 0;
JsMacros.on("Tick", JavaWrapper.methodToJava( event => {
    if (!World.isWorldLoaded()) return;
    if (streakingBox.spawnY === undefined) {
        Client.waitTick(1);
        getMap();
    }
    if (!enabled) return;
    if (tickDelay > 0) {
        tickDelay--;
        return;
    }

    getBotState();
    
}));

JsMacros.on("Disconnect", JavaWrapper.methodToJava( event => {
    locationStatus = undefined;
    currentMap = null;
    
}));

JsMacros.on("JoinServer", JavaWrapper.methodToJava( event => {
    Client.waitTick(1);
}));

JsMacros.on("Key", JavaWrapper.methodToJava( event => {
    if (event.key == "key.keyboard.i" && event.action === 1) {
        enabled = !enabled;
        if (enabled) {
            Chat.actionbar("started");
        } else {
            Chat.actionbar("stopped");
        }
    }
}));

var streakingBox = {
    constraint_x1: undefined,
    constraint_x2: undefined,
    constraint_y1: undefined,
    constraint_y2: undefined,
    constraint_z1: undefined,
    constraint_z2: undefined,
    spawnY: undefined
};

var currentMap = null;
var prestige = {x: 0, y: 0, z: 0};
var items = {x: 0, y: 0, z: 0};
var upgrades = {x: 0, y: 0, z: 0};
var mapInfo = [];

function getMap() {
    
    var kings = World.getBlock(-11, 95, 6)?.getId().toString() == "minecraft:ender_chest";
    var corals = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest";
    var ogmap = World.getBlock(-13, 114, 7)?.getId().toString() == "minecraft:ender_chest";
    var seasons = World.getBlock(-12, 114, 5)?.getId().toString() == "minecraft:ender_chest";
    var genesis = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest";
    var limbo = World.getBlock(-21, 33, 23)?.getId().toString() == "minecraft:torch" && World.getBlock(-21, 33, 19)?.getId().toString() == "minecraft:torch";
    var hypixelHub = World?.getScoreboards()?.getCurrentScoreboard()?.getName()?.includes("MainScoreboard");
    
    //get the current map and set locations.
    if (kings) {
        currentMap = "kings"
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        streakingBox.constraint_x1 = 15
        streakingBox.constraint_x2 = -15
        streakingBox.constraint_z1 = 15
        streakingBox.constraint_z2 = -15
        streakingBox.constraint_y1 = 86
        streakingBox.constraint_y2 = 80
        streakingBox.spawnY = 113
        
    }
    else if (corals) {
        currentMap = "corals"
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        streakingBox.constraint_x1 = 15
        streakingBox.constraint_x2 = -15
        streakingBox.constraint_z1 = 15
        streakingBox.constraint_z2 = -15
        streakingBox.constraint_y1 = 86
        streakingBox.constraint_y2 = 80
        streakingBox.spawnY = 113
    }
    else if (ogmap) {
        currentMap = "ogmap"
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        streakingBox.constraint_x1 = 15
        streakingBox.constraint_x2 = -15
        streakingBox.constraint_z1 = 15
        streakingBox.constraint_z2 = -15
        streakingBox.constraint_y1 = 86
        streakingBox.constraint_y2 = 80
        streakingBox.spawnY = 113
    }
    else if (seasons) {
        currentMap = "seasons"
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        streakingBox.constraint_x1 = 15
        streakingBox.constraint_x2 = -15
        streakingBox.constraint_z1 = 15
        streakingBox.constraint_z2 = -15
        streakingBox.constraint_y1 = 86
        streakingBox.constraint_y2 = 80
        streakingBox.spawnY = 90
    }
    else if (genesis) {
        currentMap = "genesis"
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        streakingBox.constraint_x1 = 15
        streakingBox.constraint_x2 = -15
        streakingBox.constraint_z1 = 15
        streakingBox.constraint_z2 = -15
        streakingBox.constraint_y1 = 86
        streakingBox.constraint_y2 = 80
        streakingBox.spawnY = 113
    }
    else if (hypixelHub) {
        currentMap = "Hypixel Hub";
        prestige = {x: 0, y: 0, z: 0};
        items = {x: 0, y: 0, z: 0};
        upgrades = {x: 0, y: 0, z: 0};
        streakingBox.constraint_x1 = undefined;
        streakingBox.constraint_x2 = undefined;
        streakingBox.constraint_z1 = undefined;
        streakingBox.constraint_z2 = undefined;
        streakingBox.constraint_y1 = undefined;
        streakingBox.constraint_y2 = undefined;
        streakingBox.spawnY = undefined;
    }
    else if (limbo) {
        currentMap = "Hypixel Limbo";
        prestige = {x: 0, y: 0, z: 0};
        items = {x: 0, y: 0, z: 0};
        upgrades = {x: 0, y: 0, z: 0};
        streakingBox.constraint_x1 = undefined;
        streakingBox.constraint_x2 = undefined;
        streakingBox.constraint_z1 = undefined;
        streakingBox.constraint_z2 = undefined;
        streakingBox.constraint_y1 = undefined;
        streakingBox.constraint_y2 = undefined;
        streakingBox.spawnY = undefined;
    }
    else {
        currentMap = "Unknown";
        prestige = {x: 0, y: 0, z: 0};
        items = {x: 0, y: 0, z: 0};
        upgrades = {x: 0, y: 0, z: 0};
        streakingBox.constraint_x1 = undefined;
        streakingBox.constraint_x2 = undefined;
        streakingBox.constraint_z1 = undefined;
        streakingBox.constraint_z2 = undefined;
        streakingBox.constraint_y1 = undefined;
        streakingBox.constraint_y2 = undefined;
        streakingBox.spawnY = undefined;
    }
    // returns a nested array of map information.
    mapInfo = [
    "Map: " + currentMap + "\n",
    " Spawn: " + streakingBox.spawnY + "\n",
    " Ground: " + streakingBox.constraint_y2 + "\n",
    " Prestige: " + prestige.x + " " + prestige.y + " " + prestige.z + "\n",
    " Items: " + items.x + " " + items.y + " " + items.z + "\n",
    " Upgrades: " + upgrades.x + " " + upgrades.y + " " + upgrades.z, + "\n",
    " Streaking Box:\n" + streakingBox.constraint_x1 + "\n" + streakingBox.constraint_x2 + "\n" + streakingBox.constraint_y1 + "\n" + streakingBox.constraint_y2 + "\n" + streakingBox.constraint_z1 + "\n" + streakingBox.constraint_z2
    ]
    return mapInfo;
}

function dist_mid() {
    const distance = Math.floor(Math.sqrt(
    Player.getPlayer().getPos()?.x ** 2 + Player.getPlayer().getPos()?.z ** 2))
    return distance
}

function inSpawn() {
    return posY > streakingBox.spawnY && posX < 22 && posX > -22 && posZ < 22 && posZ > -22;
}

function inStreakingBox() {
    return posX < streakingBox.constraint_x1 && posX > streakingBox.constraint_x2 && posZ < streakingBox.constraint_z1 && posZ > streakingBox.constraint_z2 && posY < streakingBox.constraint_y1 && posY > streakingBox.constraint_y2;
}

function dist_player() {
    //TODO: distance player
    var loc = World.getLoadedPlayer
}
function get_closest() {
    var list = World.getLoadedPlayers().toArray();
    var nearestLoc = DOUBLE.MAX_VALUE;
    for (i =0; i < list.length; i++) {
        var distance = dist_player(list[i].loc);
        if (distance >= nearest) continue;
        var target = list[i].loc;
        nearest = distance;
    }
    return nearest;
}

var locationStatus = undefined;
var posX = undefined;
var posY = undefined;
var posZ = undefined;

function getBotState() {
    posX = Player.getPlayer().getPos()?.x;
    posY = Player.getPlayer().getPos()?.y;
    posZ = Player.getPlayer().getPos()?.z;
    
    if (inStreakingBox() === true) {
        locationStatus = "[Streaking Box]";
    }
    else if (inSpawn() === true) {
        locationStatus = "[Spawn]";
        stopStreaking();
        if (executeLookAtCenter()) {
            tickDelay = Math.ceil(Math.random() * 20);
        } else {
            KeyBind.pressKeyBind("key.forward");
        }
    }
    else if (inSpawn() === false && inStreakingBox() === false) {
        locationStatus = "[Down and outside bounds]";
        //re - adjust and try to get the bot back inside of ring.
        stopStreaking();
        tickDelay = Math.ceil(Math.random() * 20);
        if (executeLookAtCenter()) {
            tickDelay = Math.ceil(Math.random() * 20);
        }
        else {
            startStreaking();
        }
    }
    
    Chat.actionbar(locationStatus + " Distance to Middle: " + dist_mid());
}

function startStreaking() {
    KeyBind.pressKeyBind("key.forward");
}

function stopStreaking() {
    KeyBind.releaseKeyBind("key.forward");
}

/**
 * optimized jsmacros script for looking towards world center (0,0) on respawn
 * uses smooth movement with jitter to appear more natural
 */

// cache frequently used objects and constants
const PLAYER = Player.getPlayer();
const CURRENT_TIME = Time.time();
const WORLD_CENTER = { x: 0, y: 0, z: 0 }; // target coordinates (middle of world)

// movement configuration constants
const MOVEMENT_CONFIG = {
    MIN_COOLDOWN: 120,      // minimum time between look cycles (ms)
    MAX_COOLDOWN: 550,      // maximum time between look cycles (ms)
    MIN_DURATION: 600,      // minimum look animation time (ms)
    MAX_DURATION: 750,      // maximum look animation time (ms)
    STEP_INTERVAL: 5,       // time between each movement step (ms)
    TARGET_JITTER: 1,       // ±degrees of jitter on target angles
    STEP_JITTER: 0.08,      // ±degrees of jitter per movement step
    POSITION_NOISE: 0.18     // ±blocks of noise on target position
};

/**
 * generates random integer between min and max (inclusive)
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @returns {number} random integer in range
 */
function rng(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * adds small random offset to a coordinate
 * @param {number} base - base coordinate value
 * @param {number} noise - maximum noise amount (±)
 * @returns {number} coordinate with noise applied
 */
function addNoise(base, noise) {
    return base + (Math.random() * 2 - 1) * noise;
}

/**
 * normalizes yaw angle to be within -180 to 180 degrees
 * @param {number} yaw - yaw angle to normalize
 * @returns {number} normalized yaw angle
 */
function normalizeYaw(yaw) {
    if (yaw <= -180) yaw += 360;
    if (yaw >= 180) yaw -= 360;
    return yaw;
}

/**
 * calculates target angles to look at world center with noise
 * @returns {object} object containing goalYaw and goalPitch
 */
function calculateTargetAngles() {
    // get player position with eye height offset
    const playerPos = {
        x: PLAYER.getX(),
        y: PLAYER.getY() + PLAYER.getEyeHeight(),
        z: PLAYER.getZ()
    };
    
    // add noise to target position for more natural movement
    const noisyTarget = {
        x: addNoise(WORLD_CENTER.x, MOVEMENT_CONFIG.POSITION_NOISE),
        y: addNoise(WORLD_CENTER.y, MOVEMENT_CONFIG.POSITION_NOISE),
        z: addNoise(WORLD_CENTER.z, MOVEMENT_CONFIG.POSITION_NOISE)
    };
    
    // create vector to calculate angles
    const POSITIONCOMMON_VEC3D = Java.type("xyz.wagyourtail.jsmacros.client.api.sharedclasses.PositionCommon$Vec3D");
    const vec = new POSITIONCOMMON_VEC3D(
        playerPos.x, playerPos.y, playerPos.z,
        noisyTarget.x, noisyTarget.y, noisyTarget.z
    );
    
    // get base angles and add jitter
    let goalYaw = vec.getYaw() + (Math.random() * 2 - 1) * MOVEMENT_CONFIG.TARGET_JITTER;
    let goalPitch = vec.getPitch() + (Math.random() * 2 - 1) * MOVEMENT_CONFIG.TARGET_JITTER;
    
    return { goalYaw, goalPitch };
}

/**
 * performs smooth look movement towards target angles
 * @param {number} goalYaw - target yaw angle
 * @param {number} goalPitch - target pitch angle
 */
function performLookMovement(goalYaw, goalPitch) {
    const duration = rng(MOVEMENT_CONFIG.MIN_DURATION, MOVEMENT_CONFIG.MAX_DURATION);
    const steps = Math.floor(duration / MOVEMENT_CONFIG.STEP_INTERVAL);
    
    // calculate angle differences
    let yawDiff = normalizeYaw(goalYaw - PLAYER.getYaw());
    let pitchDiff = goalPitch - PLAYER.getPitch();
    
    // perform smooth movement with jitter
    for (let i = 0; i < steps; i++) {
        const currentYaw = PLAYER.getYaw();
        const currentPitch = PLAYER.getPitch();
        
        // calculate next step with jitter
        const stepYaw = currentYaw + (yawDiff / steps) + 
            (Math.random() * 2 - 1) * MOVEMENT_CONFIG.STEP_JITTER;
        const stepPitch = currentPitch + (pitchDiff / steps) + 
            (Math.random() * 2 - 1) * MOVEMENT_CONFIG.STEP_JITTER;
        
        PLAYER.lookAt(stepYaw, stepPitch);
        Time.sleep(MOVEMENT_CONFIG.STEP_INTERVAL);
    }
}

/**
 * main execution function - checks cooldown and performs look movement
 * if the movement is on cooldown it returns the cooldown TICKS left passed into Client.waitTick().
 */
function executeLookAtCenter() {
    const cooldown = rng(MOVEMENT_CONFIG.MIN_COOLDOWN, MOVEMENT_CONFIG.MAX_COOLDOWN);
    const lastLookTime = GlobalVars.getObject("lookCD");
    
    // check if enough time has passed since last look
    if (lastLookTime == null || lastLookTime < CURRENT_TIME) {
        // update cooldown timer
        GlobalVars.putObject("lookCD", CURRENT_TIME + cooldown);
        
        // calculate target angles
        const { goalYaw, goalPitch } = calculateTargetAngles();
        
        // perform the look movement
        performLookMovement(goalYaw, goalPitch);
        return true;
    }
    return false;
}
