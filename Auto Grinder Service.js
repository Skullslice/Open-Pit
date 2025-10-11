/* 

[===================================]
[ ----- Auto Grinding and Aim ----- ]
[===================================]

*/
const Thread = Java.type("java.lang.Thread");

const keyWhitelist = {
  "fullscreen": "key.keyboard.f11",
  "windows": "key.keyboard.left.win",
  "tablist": "key.keyboard.tab"
};

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

JsMacros.on("Tick", JavaWrapper.methodToJava(event => {
    if (!World.isWorldLoaded()) return;
    if (streakingBox.spawnY === undefined) {
        Client.waitTick(1);
        getMap();
        return; //prevents the bot from doing anything unless it is a valid pit map.
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
            Chat.actionbar("stopped");
        }
    }
    else if (enabled && event.action === 1 && !Object.values(keyWhitelist).includes(event.key)) {
        enabled = !enabled;
        Chat.log("[Action Cancelled by moving] -> \u00a7d" + event.key);
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
    var harrys2 = World.getBlock(12, 95, 6)?.getId().toString() == "minecraft:ender_chest";
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
    else if (harrys2) {
        currentMap = "Sandbox2"
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        streakingBox.constraint_x1 = 15
        streakingBox.constraint_x2 = -15
        streakingBox.constraint_z1 = 15
        streakingBox.constraint_z2 = -15
        streakingBox.constraint_y1 = 93
        streakingBox.constraint_y2 = 70
        streakingBox.spawnY = 93
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

function lookAtTarget_old({x, y, z}) {
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
        const noisePitch = (Math.random() * 2 - 1) * 0.01;

        currentYaw += yawDiff * aimSpeed + noiseYaw;
        currentPitch += pitchDiff * aimSpeed + noisePitch;

        me.lookAt(currentYaw, currentPitch < 2 ? 2 + Math.random() * 0.86 : currentPitch);

        Time.sleep(Math.ceil(aimSpeed) * scaledDelay);
    }
    if (aimTickDelay < 1) aimTickDelay += Math.ciel(Math.random() * 10); //0.05 - 0.5(s) next aim delay.
}

let aimThread = null;
function lookAtTarget(target) {
    if (aimThread && aimThread.isAlive()) return false;
    const me = Player.getPlayer();
    const seed = Math.random() * 1000;
    const start = Time.time(), duration = 800 + Math.random() * 400;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const gaussian = (m = 0, d = 0.01) => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return d * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) + m;
    };
    const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const skewed = (t, f = 0.002, k = 0.6) => Math.sin(t * f + Math.sin(t * f * k)) * 0.6;
    const biasedNoise = (currentPitch, now, strength = 0.02) => {
        const base = Math.sin(now * 0.02 + seed) * strength;
        const bias = currentPitch < 2 ? (2 - currentPitch) * 0.05 : 0;
        return base + bias;
    };

    aimThread = new Thread(JavaWrapper.methodToJava(() => {
        while (!Thread.interrupted()) {
            if (aimTickDelay > 0) break;
            const now = Time.time();
            const t = Math.min((now - start) / duration, 1);
            if (t >= 1) {
                aimThread.interrupt();
                break;
            }
            const {x, y, z} = target;
            const {x: px, y: py, z: pz} = me.getPos();
            const dx = x - px, dy = y - (py + 0.6), dz = z - pz;
            const distXZ = Math.sqrt(dx * dx + dz * dz);

            const yaw = -Math.atan2(dx, dz) * 180 / Math.PI;
            const pitch = -Math.atan2(dy, distXZ) * 180 / Math.PI;

            const cy = me.getYaw(), cp = me.getPitch();
            const yd = normalizeAngle(yaw - cy), pd = pitch - cp;

            const eased = ease(t);
            const baseYaw = cy + yd * eased;
            const basePitch = cp + pd * eased;

            const finalYaw = baseYaw + gaussian() + Math.sin(now * 0.02 + seed) * 0.02;
            const finalPitch = clamp(
                basePitch
                + gaussian()
                + biasedNoise(basePitch, now + 100)
                + skewed(now),
                -90, 90
            );
            me.lookAt(finalYaw, finalPitch);
            Time.sleep(3 + Math.random() * 4);
        }
        aimThread = null;
    }));
    aimThread.start();
    return true;
}

function getBotState() {
    posX = Player.getPlayer().getPos().x;
    posY = Player.getPlayer().getPos().y;
    posZ = Player.getPlayer().getPos().z;
    
    if (inStreakingBox() === true) {
        locationStatus = "[Streaking Box]";
        //lookAtTarget(getTarget());
        startStreaking();
    }
    else if (inSpawn() === true) {
        if (locationStatus == "[Down and outside bounds]" || locationStatus == "[Streaking Box]") {
            stopStreaking();
            movementDelay += 30;
        }
        locationStatus = "[Spawn]";
        //lookAtTarget(getTarget());
        startStreaking();
    }
    else if (inSpawn() === false && inStreakingBox() === false) {
        locationStatus = "[Down and outside bounds]";
        stopStreaking();
        aimTickDelay = 10;
        oof();
    }
    
    Chat.actionbar(locationStatus + " Distance to Middle: " + dist_mid() + " " + currentMap + " [CPS] > " + randomization.cps);
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

/*

[===========================]
[ ----- Auto Clicking ----- ]
[===========================]

*/

const config = {
    enabled: false,
    min: 3,
    max: 10,
    raytraceHitbox: true,
    raytraceDistance: 5
};

const randomization = {
    waveHeightA: 0.2,  //used for wave cycle time. dont touch this.
    waveHeightB: 0.35,  //used for wave cycle time. dont touch this.
    waveHeightC: 0.45,  //used for wave cycle time. dont touch this.
    lengthA: 50,  //rapid fire modulation used to make wave 2 and 3 seem more human.
    lengthB: 3000,  //used for wave cycle time. dont touch this.
    lengthC: 8500,  //used for wave cycle time. dont touch this.
    nextWaveA: undefined, //used for wave cycle time. dont touch this.
    nextWaveB: undefined, //used for wave cycle time. dont touch this.
    nextWaveC: undefined, //used for wave cycle time. dont touch this.
    cps: 0,
    clicks: [] // now stores timestamps for rolling CPS
};

function generateNoiseDelay() {
    var delay = 1000 / (Math.floor(Math.random() * (config.max - config.min) + config.min));
    delay += (waveDelayA() + waveDelayB() + waveDelayC()) / 3;
    while (delay < (1000 / (1 + config.max))) delay += Math.abs(waveDelayA() + 1);
    return delay;
}

function click(delay) {
    if (Hud.getOpenScreen() !== null) return false;
    try {
        if (Player.rayTraceEntity(config.raytraceDistance) === null && config.raytraceHitbox) return false;
    } catch (e) {
        //Chat.log("It does throw ConcurrentModificationException but we can ignore it.");
    }
    Time.sleep(Math.floor(delay / 2));
    KeyBind.pressKeyBind("key.attack");
    Time.sleep(Math.floor(delay / 2));
    KeyBind.releaseKeyBind("key.attack");
    randomization.clicks.push({ time: Time.time() }); // log timestamp for rolling CPS
    return true;
}


function waveDelayA() {
    const time = Time.time();

    if (randomization.nextWaveA === undefined || time >= randomization.nextWaveA) {
        randomization.nextWaveA = time + randomization.lengthA * (0.5 + Math.random());
    }

    const phase = (time % randomization.nextWaveA) / randomization.nextWaveA;

    const skewedPhase = phase < 0.5
        ? phase * 0.75
        : 0.5 + (phase - 0.5) * 0.25;

    const wave = Math.sin(2 * Math.PI * skewedPhase) *
        randomization.waveHeightA *
        (config.min - config.max);

    return wave;
}

function waveDelayB() {
    const time = Time.time();

    if (randomization.nextWaveB === undefined || time >= randomization.nextWaveB) {
        randomization.nextWaveB = time + randomization.lengthB * (0.5 + Math.random());
    }

    const phase = (time % randomization.nextWaveB) / randomization.nextWaveB;

    const skewedPhase = phase < 0.5
        ? phase * 0.75
        : 0.5 + (phase - 0.5) * 0.25;

    const wave = Math.sin(2 * Math.PI * skewedPhase) *
        randomization.waveHeightB *
        (config.min - config.max);

    return wave;
}

function waveDelayC() {
    const time = Time.time();

    if (randomization.nextWaveC === undefined || time >= randomization.nextWaveC) {
        randomization.nextWaveC = time + randomization.lengthC * (0.5 + Math.random());
    }

    const phase = (time % randomization.nextWaveC) / randomization.nextWaveC;

    const skewedPhase = phase < 0.5
        ? phase * 0.75
        : 0.5 + (phase - 0.5) * 0.25;

    const wave = Math.sin(2 * Math.PI * skewedPhase) *
        randomization.waveHeightC *
        (config.min - config.max);

    return wave;
}

let clickThread = null;

JsMacros.on("Key", JavaWrapper.methodToJava(event => {
    if (event.key == "key.keyboard.i" && event.action === 1) {
        config.enabled = !config.enabled;
        const windowSize = 1000; // 1 second window

        if (config.enabled) {
            clickThread = new Thread(JavaWrapper.methodToJava(() => {
                while (config.enabled && !Thread.interrupted()) {
                    /*
                    if (!inStreakingBox()) {
                        Time.sleep(0);
                        continue;
                    }
                    */
                    const now = Time.time();
                    randomization.clicks = randomization.clicks.filter(entry => now - entry.time <= windowSize);
                    randomization.cps = (randomization.clicks.length * 1000) / windowSize;
                    click(generateNoiseDelay());
                    Time.sleep(0);
                }
            }));
            clickThread.start();
        } else if (!config.enabled) {
            clickThread.interrupt();
            clickThread = null;
            KeyBind.releaseKeyBind("key.attack"); //double check to ensure we release the key.
        }
    }
}));

/*

[===================================]
[ ----- Rendering and Overlay ----- ]
[===================================]

*/

