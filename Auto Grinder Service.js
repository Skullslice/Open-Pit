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
var movementDelay = 0;

var aimTickDelay = 0;
var commandTickCooldown = 0

let autoclicker = {
    enabled: false,
    cpsMin: 6,
    cpsMax: 12,
    amplitude: 1,
    phase: 0,
    tickCounter: 0,
    listenerId: null
};

function startClicker() {
    if (autoclicker.enabled) return;
    autoclicker.enabled = true;

    autoclicker.listenerId = JsMacros.on("Tick", JavaWrapper.methodToJava(() => {
        autoclicker.tickCounter++;

        const t = Time.time();
        const cps = autoclicker.cpsMin + Math.random() * (autoclicker.cpsMax - autoclicker.cpsMin);
        const baseFreq = 0.0005;
        const freq = baseFreq * cps;
        const noise = Math.sin(t * freq + autoclicker.phase) * autoclicker.amplitude;

        const intervalMs = Math.max(1000 / cps + noise * 100, 10);
        const intervalTicks = Math.floor(intervalMs / 50); // 50ms per tick

        if (autoclicker.tickCounter >= intervalTicks) {
            KeyBind.pressKeyBind("key.attack");
            autoclicker.tickCounter = 0;
        }
    }));
}

function stopClicker() {
    autoclicker.enabled = false;
    autoclicker.tickCounter = 0;
    if (autoclicker.listenerId) {
        JsMacros.off(autoclicker.listenerId);
        autoclicker.listenerId = null;
        KeyBind.releaseKeyBind("key.attack");
    }
}

JsMacros.on("Tick", JavaWrapper.methodToJava(event => {
    if (!World.isWorldLoaded()) return;
    if (streakingBox.spawnY === undefined) {
        Client.waitTick(1);
        getMap();
    }
    
    if (!enabled) return;
    if (commandTickCooldown >= 0) commandTickCooldown--;
    
    getBotState();
    
    if (aimTickDelay > 0) {
        aimTickDelay--;
        return;
    }

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
            stopStreaking();
            stopClicker();
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
    var harrys = World.getBlock(-13, 114, 4)?.getId().toString() == "minecraft:ender_chest";
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
        streakingBox.constraint_y1 = 113
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
        streakingBox.constraint_y1 = 113
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
        streakingBox.constraint_y1 = 113
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
        streakingBox.constraint_y1 = 90
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
        streakingBox.constraint_y1 = 113
        streakingBox.constraint_y2 = 80
        streakingBox.spawnY = 113
    }
    else if (harrys) {
        currentMap = "Sandbox"
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        streakingBox.constraint_x1 = 15
        streakingBox.constraint_x2 = -15
        streakingBox.constraint_z1 = 15
        streakingBox.constraint_z2 = -15
        streakingBox.constraint_y1 = 112
        streakingBox.constraint_y2 = 81
        streakingBox.spawnY = 112
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

function normalizeAngle(angle) {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
}

function getTarget() {
    const middle = {x: 0, y: streakingBox.spawnY, z: 0};
    const me = Player.getPlayer();
    //Chat.log(Player.getPlayer().getName());
    const px = me.getPos().x, py = me.getPos().y, pz = me.getPos().z;

    if (inSpawn()) return middle;
    
    const online = World.getEntities().toArray().filter(p => {
        const x = p.getPos().x, y = p.getPos().y, z = p.getPos().z;
        const withinBox =
            x < streakingBox.constraint_x1 && x > streakingBox.constraint_x2 &&
            y < streakingBox.constraint_y1 && y > streakingBox.constraint_y2 &&
            z < streakingBox.constraint_z1 && z > streakingBox.constraint_z2;
        return withinBox;
    });
    online.splice(0, 1); //remove self from targets.
    if (online.length === 0) {
        enabled = !enabled;
        Chat.log("Stopping due to lonliness");
        return {x: 0, y: py, z: 0};
    }

    online.sort((a, b) => {
        const da = Math.hypot(a.getPos().x - px, a.getPos().y - py, a.getPos().z - pz);
        const db = Math.hypot(b.getPos().x - px, b.getPos().y - py, b.getPos().z - pz);
        return da - db;
    });

    const target = online[0];
    //Chat.log(target.getName());
    return {
        x: target.getPos().x,
        y: target.getPos().y + 0.38,
        z: target.getPos().z
    };
}

function lookAtTarget({x, y, z}) {
    const me = Player.getPlayer();
    const px = me.getPos().x, py = me.getPos().y, pz = me.getPos().z;

    // Calculate raw angles
    const dx = x - px;
    const dy = y - (py + 0.38);
    const dz = z - pz;

    const distXZ = Math.sqrt(dx * dx + dz * dz);
    const targetYaw = -Math.atan2(dx, dz) * (180 / Math.PI);
    const targetPitch = -Math.atan2(dy, distXZ) * (180 / Math.PI);

    let currentYaw = me.getYaw();
    let currentPitch = me.getPitch();

    // Total angular distance
    const yawDelta = Math.abs(targetYaw - currentYaw);
    const pitchDelta = Math.abs(targetPitch - currentPitch);
    const totalDelta = yawDelta + pitchDelta;

    // Delay based on angular effort
    const scaledDelay = Math.min(Math.ceil(totalDelta / 10), 15);

    // Interpolation loop
    for (let i = 0; i < 10; i++) {
        currentYaw = me.getYaw();
        currentPitch = me.getPitch();

        const yawDiff = normalizeAngle(targetYaw - currentYaw);
        const pitchDiff = targetPitch - currentPitch;

        if (Math.abs(yawDiff) < 4.5 && Math.abs(pitchDiff) < 1) break;

        if (aimTickDelay > 0) break;
        // Randomized aim speed per iteration
        const aimSpeed = 0.01 + Math.random() * 0.04;

        // Apply interpolation with noise
        const noiseYaw = (Math.random() * 2 - 1) * 0.01;
        const noisePitch = (Math.random() * 2 - 1) * 0.08;

        currentYaw += yawDiff * aimSpeed + noiseYaw;
        currentPitch += pitchDiff * aimSpeed + noisePitch;

        me.lookAt(currentYaw, currentPitch < 2 ? 2 + Math.random() * 0.86 : currentPitch);

        Time.sleep(Math.ceil(aimSpeed) * scaledDelay);
    }
    if (aimTickDelay < 1) aimTickDelay += 1;
}

function getBotState() {
    posX = Player.getPlayer().getPos().x;
    posY = Player.getPlayer().getPos().y;
    posZ = Player.getPlayer().getPos().z;
    
    if (inStreakingBox() === true) {
        locationStatus = "[Streaking Box]";
        //lookAtTarget(getTarget());
        startStreaking();
        startClicker();
    }
    else if (inSpawn() === true) {
        if (locationStatus == "[Down and outside bounds]" || locationStatus == "[Streaking Box]") {
            stopStreaking();
            movementDelay += 30;
        }
        locationStatus = "[Spawn]";
        //lookAtTarget(getTarget());
        startStreaking();
        stopClicker();
    }
    else if (inSpawn() === false && inStreakingBox() === false) {
        locationStatus = "[Down and outside bounds]";
        stopStreaking();
        aimTickDelay = 10;
        oof();
    }
    
    Chat.actionbar(locationStatus + " Distance to Middle: " + dist_mid() + " " + currentMap);
}

function startStreaking() {
    if (movementDelay > 0) {
        movementDelay--;
        return;
    }
    KeyBind.pressKeyBind("key.forward");
}

function stopStreaking() {
    KeyBind.releaseKeyBind("key.forward");
}

function oof() {
    if (commandTickCooldown < 1) {
        Chat.say("/oof");
        commandTickCooldown += 200;
    }   
}
