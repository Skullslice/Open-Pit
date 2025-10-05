var enabled = false; //the bot should be off when cluient starts.
var sneak = true; //occasionally sneaks in middle.
var bow = true; //occasionally uses the bow and aims and shoots.
var finder = true;
var waterbreak = true;
var quality = 0.45
var minimum = 2

var locationStatus = undefined;
var posX = undefined;
var posY = undefined;
var posZ = undefined;
var tickDelay = 0;
JsMacros.on("Tick", JavaWrapper.methodToJava(event => {
    if (!World.isWorldLoaded()) return;
    if (streakingBox.spawnY === undefined) {
        Client.waitTick(1);
        getMap();
    }

    // Always update position
    const pos = Player.getPlayer().getPos();
    posX = pos?.x;
    posY = pos?.y;
    posZ = pos?.z;

    if (!enabled) return;
    if (tickDelay > 0) {
        tickDelay--;
        return;
    }

    getBotState();

    // Aim logic
    const target = getTarget();
    if (target) {
        lookAtTarget(target);
    }
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

function getTarget() {
    const middle = {x: 0, y: streakingBox.spawnY, z: 0};
    const me = Player.getPlayer();
    const px = me.getX(), py = me.getY(), pz = me.getZ();

    if (inSpawn()) return middle;
    
    const online = World.getLoadedPlayers().toArray().filter(p => {
        if (p.getName() === me.getName()) return false;

        const x = p.getX(), y = p.getY(), z = p.getZ();
        const withinBox =
            x >= streakingBox.constraint_x1 && x <= streakingBox.constraint_x2 &&
            y >= streakingBox.constraint_y1 && y <= streakingBox.constraint_y2 &&
            z >= streakingBox.constraint_z1 && z <= streakingBox.constraint_z2;

        const verticalOk = Math.abs(y - py) <= 1.5;

        return withinBox && verticalOk;
    });

    if (online.length === 0) return null;

    online.sort((a, b) => {
        const da = Math.hypot(a.getX() - px, a.getY() - py, a.getZ() - pz);
        const db = Math.hypot(b.getX() - px, b.getY() - py, b.getZ() - pz);
        return da - db;
    });

    const target = online[0];
    return {
        x: target.getX(),
        y: target.getY() + target.getEyeHeight(),
        z: target.getZ()
    };
}

function lookAtTarget({x, y, z}) {
    const me = Player.getPlayer();
    const px = me.getX(), py = me.getY(), pz = me.getZ();

    // Constants for realism
    const INTERPOLATION_SPEED = 0.15;
    const NOISE_YAW = (Math.random() - 0.5) * 2;     // ±1°
    const NOISE_PITCH = (Math.random() - 0.5) * 1.5; // ±0.75°

    // Calculate raw angles
    const dx = x - px;
    const dy = y - (py + me.getEyeHeight());
    const dz = z - pz;

    const distXZ = Math.sqrt(dx * dx + dz * dz);
    const targetYaw = -Math.atan2(dx, dz) * (180 / Math.PI);
    const targetPitch = -Math.atan2(dy, distXZ) * (180 / Math.PI);

    const currentYaw = me.getYaw();
    const currentPitch = me.getPitch();

    // Interpolate
    const newYaw = currentYaw + (targetYaw - currentYaw) * INTERPOLATION_SPEED + NOISE_YAW;
    const newPitch = currentPitch + (targetPitch - currentPitch) * INTERPOLATION_SPEED + NOISE_PITCH;

    me.lookYaw(newYaw);
    me.lookPitch(newPitch);

    // Cooldown scales with angular distance
    const yawDelta = Math.abs(targetYaw - currentYaw);
    const pitchDelta = Math.abs(targetPitch - currentPitch);
    const totalDelta = yawDelta + pitchDelta;

    // Normalize and clamp
    const scaledDelay = Math.min(Math.ceil(totalDelta / 10), 20); // max 20 ticks
    tickDelay = scaledDelay;
}

function getBotState() {
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
        //stop moving, look at middle, and try to get the bot back inside of ring.
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
