/* 

[===================================]
[ ----- Auto Grinding and Aim ----- ]
[===================================]

*/
const Thread = Java.type("java.lang.Thread");

const keyWhitelist = {
  "fullscreen": "key.keyboard.f11",
  "windows": "key.keyboard.left.win",
  "tablist": "key.keyboard.tab",
  "forward": "key.keyboard.w",
  "backward": "key.keyboard.s",
  "left": "key.keyboard.a",
  "right": "key.keyboard.d",
  "jump": "key.keyboard.space"
};

/* 

[========================]
[ ----- Anti Stuck ----- ]
[========================]

*/

const antiStuck = {
    stuck: false,
    ticks: 100,
    window: [],
    runCheck: () => {
        if (antiStuck.window.length >= antiStuck.ticks) {
            const first = antiStuck.window[0];
            antiStuck.stuck = antiStuck.window.every(
                ({ posX, posZ, posY }) => posX === first.posX && posZ === first.posZ && posY === first.posY
            );
            antiStuck.window.shift();
        }
        antiStuck.window.push({ posX, posZ, posY });
        if (antiStuck.stuck) oof();
    },
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
    overlay.renderHud();
    overlay.renderTargetBox();
    
    if (streakingBox.spawnY === undefined) {
        Client.waitTick(1);
        getMap();
        return; //prevents the bot from doing anything unless it is a valid pit map.
    }
    
    if (!enabled || Hud.getOpenScreen() !== null) return;

    if (!aimThread || aimThread.isInterrupted() || !aimThread.isAlive()) {
        aimThread.start(); //start the aim thread one time
        Chat.log("Aim thread started");
    }

    if (commandTickCooldown >= 0) commandTickCooldown--;

    getBotState();
    
    if (aimTickDelay > 0) {
        aimTickDelay--;
        return;
    }
}));


JsMacros.on("Disconnect", JavaWrapper.methodToJava( event => {
    locationStatus = undefined;
    currentMap = null;
    streakingBox.spawnY = undefined;
    
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
        enabled = false;
        autoclicker.enabled = false;
        stopStreaking();
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
    var corals = World.getBlock(-12, 114, 6)?.getId().toString() == "minecraft:ender_chest";
    var ogmap = World.getBlock(-13, 114, 7)?.getId().toString() == "minecraft:ender_chest";
    var seasons = World.getBlock(-12, 114, 5)?.getId().toString() == "minecraft:ender_chest";
    var genesis = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest";
    var harrys = World.getBlock(11, 83, -6)?.getId().toString() == "minecraft:ender_chest";
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
        streakingBox.constraint_y1 = 82
        streakingBox.constraint_y2 = 26
        streakingBox.spawnY = 82
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
    const player = Player.getPlayer();
    const px = player.getPos().x, py = player.getPos().y, pz = player.getPos().z;
    const cyaw = player.getYaw();

    if (currentMap === "Unknown" || currentMap === "Hypixel Limbo" || currentMap === "Hypixel Hub") return false;
    if (inSpawn()) return middle;

    const online = World.getEntities().toArray().filter(p => {
        const x = p.getPos().x, y = p.getPos().y, z = p.getPos().z;
        const withinBox =
            x < streakingBox.constraint_x1 && x > streakingBox.constraint_x2 &&
            y < streakingBox.constraint_y1 && y > streakingBox.constraint_y2 &&
            z < streakingBox.constraint_z1 && z > streakingBox.constraint_z2;
        const blacklist = p.getType().toString() === "minecraft:arrow" || p.getType().toString() === "minecraft:armor_stand";
        
        return withinBox && !blacklist;
    });

    online.splice(0, 1); // remove self from targets
    if (online.length === 0) {
        enabled = false;
        autoclicker.enabled = false;
        //Chat.log("Stopping due to lonliness");
        return {x: 0, y: py, z: 0};
    }

    const yawTo = entity => {
        const dx = entity.getPos().x - px;
        const dz = entity.getPos().z - pz;
        return -Math.atan2(dx, dz) * 180 / Math.PI;
    };
    const normalizeAngle = angle => {
        angle = angle % 360;
        if (angle > 180) angle -= 360;
        if (angle < -180) angle += 360;
        return angle;
    };

    online.sort((a, b) => {
        const distA = Math.hypot(a.getPos().x - px, a.getPos().z - pz);
        const distB = Math.hypot(b.getPos().x - px, b.getPos().z - pz);

        const deltaA = distA <= 3.25 ? Math.abs(normalizeAngle(yawTo(a) - cyaw)) : Infinity;
        const deltaB = distB <= 3.25 ? Math.abs(normalizeAngle(yawTo(b) - cyaw)) : Infinity;

        return deltaA - deltaB;
    });

    const target = online[0];

    return {
        x: target.getPos().x,
        y: target.getPos().y,
        z: target.getPos().z
    };
}

let aimThread = new Thread(JavaWrapper.methodToJava(() => {
    const seed = Math.random() * 1000;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const gaussian = (m = 0, d = 0.008) => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return d * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) + m;
    };
    const ease = t => t * t * (3 - 2 * t);
    const skewed = (t, f = 0.002, k = 0.6) => Math.sin(t * f + Math.sin(t * f * k)) * 0.6;
    const biasedNoise = (currentPitch, now, strength = 0.02) => {
        const base = Math.sin(now * 0.02 + seed) * strength;
        const bias = currentPitch < 2 ? (2 - currentPitch) * 0.025 : 0;
        return base + bias;
    };
    const normalizeAngle = angle => {
        angle = angle % 360;
        if (angle > 180) angle -= 360;
        if (angle < -180) angle += 360;
        return angle;
    };

    let virtualYaw = Player.getPlayer().getYaw();
    let lastTarget = null;
    let lastUpdate = Time.time();

    while (!Thread.interrupted()) {
        const now = Time.time();
        const dt = now - lastUpdate;
        lastUpdate = now;

        if (!enabled || Hud.getOpenScreen() !== null || aimTickDelay > 0) {
            Time.sleep(10);
            continue;
        }

        const target = getTarget(); // must return {x, y, z}
        if (!target) {
            Time.sleep(10);
            continue;
        }

        lastTarget = target;

        const player = Player.getPlayer();
        if (!player) {
            Time.sleep(10);
            continue;
        }

        const {x, y, z} = target;
        const {x: px, y: py, z: pz} = player.getPos();
        const dx = x - px, dy = y - (py + -0.15), dz = z - pz;
        const distXZ = Math.sqrt(dx * dx + dz * dz);

        const targetYaw = -Math.atan2(dx, dz) * 180 / Math.PI;
        const targetPitch = -Math.atan2(dy, distXZ) * 180 / Math.PI;

        const yawDelta = normalizeAngle(targetYaw - virtualYaw);
        virtualYaw += clamp(yawDelta * 0.1, -4.4, 4.4);

        const cp = player.getPitch();
        const pd = targetPitch - cp;

        const eased = ease(clamp(dt / 100, 0, 1));
        const pitchDamp = clamp(distXZ * 0.05, 0.1, 1.0);
        const basePitchRaw = cp + pd * eased * 0.15 * pitchDamp;
        const basePitch = clamp(basePitchRaw, 7, 24);

        const finalYaw = virtualYaw + gaussian() + Math.sin(now * 0.02 + seed) * 0.02;
        const finalPitch = clamp(
            basePitch
            + gaussian()
            + biasedNoise(basePitch, now + 100)
            + (skewed(now) * 0.25),
            -90, 90
        );

        player.lookAt(finalYaw, finalPitch);
        Time.sleep(Math.ceil(2 + Math.random() * 2));
    }
}));

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
    
    antiStuck.runCheck();
    
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

const autoclicker = {
    enabled: false,
    min: 3,
    max: 12.7,
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
    var delay = 1000 / (Math.floor(Math.random() * (autoclicker.max - autoclicker.min) + autoclicker.min));
    delay += (waveDelayA() + waveDelayB() + waveDelayC()) / 3;
    while (delay < (1000 / (1 + autoclicker.max))) delay += Math.abs(waveDelayA() + 1);
    return delay;
}

function click(delay) {
    if (Hud.getOpenScreen() !== null) return false;
    try {
        if (Player.rayTraceEntity(autoclicker.raytraceDistance) === null && autoclicker.raytraceHitbox) return false;
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
        (autoclicker.min - autoclicker.max);

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
        (autoclicker.min - autoclicker.max);

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
        (autoclicker.min - autoclicker.max);

    return wave;
}

let clickThread = null;

JsMacros.on("Key", JavaWrapper.methodToJava(event => {
    if (event.key == "key.keyboard.i" && event.action === 1) {
        autoclicker.enabled = !autoclicker.enabled;
        const windowSize = 1000; // 1 second window

        if (autoclicker.enabled) {
            clickThread = new Thread(JavaWrapper.methodToJava(() => {
                while (autoclicker.enabled && !Thread.interrupted()) {
                    
                    if (!inStreakingBox()) {
                        Time.sleep(0);
                        continue;
                    }
                    
                    const now = Time.time();
                    randomization.clicks = randomization.clicks.filter(entry => now - entry.time <= windowSize);
                    randomization.cps = (randomization.clicks.length * 1000) / windowSize;
                    click(generateNoiseDelay());
                    Time.sleep(0);
                }
            }));
            clickThread.start();
        } else if (!autoclicker.enabled) {
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

const overlay = {
    hud: true,
    targetBox: true,
    
    text_size: 0.8,
    text_x: 100,
    text_z: 100,

    renderHud: () => {
        if (!overlay.hud) return;


        Chat.actionbar(locationStatus + " Distance to Middle: " + dist_mid() + " " + currentMap + " [CPS] > " + randomization.cps);
    },

    renderTargetBox: () => {
        if (!overlay.targetBox) return;
        const target = getTarget();
        if (!target) {
            Hud.clearDraw3Ds();
            return;
        }
        
        const x1 = target.x - 0.41;
        const x2 = target.x + 0.41;
        const y1 = target.y - 0.05;
        const y2 = target.y + 1.8;
        const z1 = target.z - 0.41;
        const z2 = target.z + 0.41;

        const color = 0x000000; // Hex Color Space
        const alpha = 100; // 0 -> 100
        const fillColor = 0xFF0000; // Hex Color Space
        const fillAlpha = 35; // 0 -> 100
        const fill = true;
        
        Hud.clearDraw3Ds();
        var targetBox = Hud.createDraw3D();
        targetBox.register();
        targetBox.addBox(x1, y1, z1, x2, y2, z2, color, alpha, fillColor, fillAlpha, fill);
    },

};
