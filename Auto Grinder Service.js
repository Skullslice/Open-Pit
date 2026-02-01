/* 

[==============================]
[ ----- Global Variables ----- ]
[==============================]

*/

const Thread = Java.type("java.lang.Thread");

const keyWhitelist = {
  "fullscreen": "key.keyboard.f11",
  "windows": "key.keyboard.left.win",
  "tablist": "key.keyboard.tab",
  "alt": "key.keyboard.alt",
  "forward": "key.keyboard.w",
  "backward": "key.keyboard.s",
  "left": "key.keyboard.a",
  "right": "key.keyboard.d",
  "jump": "key.keyboard.space",
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
                ({ posX, posZ, posY }) => posX === first.posX && posZ === first.posZ
            );
            antiStuck.window.shift();
        }
        antiStuck.window.push({ posX, posZ, posY });
        if (antiStuck.stuck) oof();
    },
};

/* 

[=======================]
[ ----- W Tapping ----- ]
[=======================]

*/

const wTap = {
    enabled: true,
    hold_min: 150,
    hold_max: 240,
    delay_min: 20,
    delay_max: 450,
    jump_delay_min: 50,
    jump_delay_max: 1550,
    distance: 2.96,
    jump_chance: 0.3,
    recovery_factor: 3.1, // higher values for this recover from w tap delay faster whenever the (target distance > w tap distance)

    lastHold: 0,
    lastDelay: 0,
    lastJump: 0,
    isKeyDown: false,

    currentHoldTime: 0,
    currentDelayTime: 0,
    currentJumpTime: 0,

    runCheck: () => {
        const time = Time.time();
        const targetDistance = getTarget()?.distance;
        const canTrigger = targetDistance !== undefined && wTap.distance >= targetDistance;

        //Every tick it re checks the chance so theres a small chance to insta jump which is still possible in vanilla MC. Low chances should be perfectly fine.
        //This still respects the jump cooldowns properly.
        if (Player.getPlayer().isOnGround() && wTap.jump_chance > Math.random() && time - wTap.lastJump >= wTap.currentJumpTime) {
            wTap.lastJump = time;
            wTap.currentJumpTime = wTap.jump_delay_min + Math.floor(Math.random() * (wTap.jump_delay_max - wTap.jump_delay_min));
            KeyBind.pressKeyBind("key.jump");
        } else {
            KeyBind.releaseKeyBind("key.jump");
        }
        
        if (!wTap.enabled) return startStreaking();

        // If the key is not down
        if (canTrigger && !wTap.isKeyDown && time - wTap.lastHold >= wTap.currentHoldTime) {
            wTap.lastHold = time;
            wTap.isKeyDown = true;
            wTap.currentHoldTime = wTap.hold_min + Math.floor(Math.random() * (wTap.hold_max - wTap.hold_min));
            startStreaking();
            return;
        }

        // If the key is down
        if (wTap.isKeyDown && locationStatus && time - wTap.lastDelay >= wTap.currentDelayTime) {
            wTap.lastDelay = time;
            wTap.isKeyDown = false;
            wTap.currentDelayTime = wTap.delay_min + Math.floor(Math.random() * (wTap.delay_max - wTap.delay_min));
            movementDelay += wTap.currentDelayTime / 50;
            stopStreaking();
            return;
        }

        //finally if the target moves out of range, we want to make sure the bot can keep up via a recovery factor!
        if (!canTrigger && inStreakingBox()) {
            if (movementDelay > 0) movementDelay = Math.floor(movementDelay / wTap.recovery_factor);
        }

        startStreaking();
    },
};

JsMacros.on("Tick", JavaWrapper.methodToJava(event => {
    if (!World.isWorldLoaded()) return;
    overlay.renderHud();
    overlay.renderTargetBox();
    FishingHelper.tickContainer();
    
    if (streakingBox.constraint_y1 === undefined) {
        Client.waitTick(1);
        getMap();
        return; //prevents the bot from doing anything unless it is a valid pit map.
    }

    aimThread = aimThread ?? newAimThread();
    if (!aimThread.isAlive()) {
        try {
            aimThread.start();
            Chat.log("[Aim Thread] started");
        } catch (e) {
            aimThread = null;
            Chat.log("[Aim Thread] restarting...");
        }
    }

    regionThread = regionThread ?? newRegionThread();
    if (!regionThread.isAlive()) {
        try {
            regionThread.start();
            Chat.log("[Regions Thread] started");
        } catch (e) {
            regionThread = null;
            Chat.log("[Regions Thread] restarting...");
        }
    }


    if (!enabled || Hud.getOpenScreen() !== null) return;
    
    // Tick Cooldowns
    if (commandTickCooldown > 0) commandTickCooldown--;
    if (movementDelay > 0) movementDelay--;
    if (aimTickDelay > 0) aimTickDelay--;
    
    getBotState();
}));


JsMacros.on("Disconnect", JavaWrapper.methodToJava( event => {
    Chat.log("Debug Disconnect")
    Hud.clearDraw3Ds();
    Hud.clearDraw2Ds();
    locationStatus = undefined;
    currentMap = null;
    enabled = false;
    autoclicker.enabled = false;
    stopStreaking();
    Object.keys(streakingBox).forEach(key => { streakingBox[key] = undefined; });
    
}));

JsMacros.on("JoinServer", JavaWrapper.methodToJava( event => {
    Chat.log("Debug Join Server")
    Hud.clearDraw3Ds();
    Hud.clearDraw2Ds();
    locationStatus = undefined;
    currentMap = null;
    enabled = false;
    autoclicker.enabled = false;
    stopStreaking();
    Object.keys(streakingBox).forEach(key => { streakingBox[key] = undefined; });
    
}));

JsMacros.on("DimensionChange", JavaWrapper.methodToJava( event => {
    Chat.log(event.toString());
    Hud.clearDraw3Ds();
    Hud.clearDraw2Ds();
    locationStatus = undefined;
    currentMap = null;
    enabled = false;
    autoclicker.enabled = false;
    stopStreaking();
    Object.keys(streakingBox).forEach(key => { streakingBox[key] = undefined; });
    
}));

JsMacros.on("Key", JavaWrapper.methodToJava( event => {
    if (event.key == "key.keyboard.i" && event.action === 1) {
        enabled = !enabled;
        if (enabled) {
            Chat.actionbar("started");
        } else {
            stopStreaking();
            KeyBind.releaseKeyBind("key.jump");
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

var currentMap = null;
var prestige = {x: 0, y: 0, z: 0};
var items = {x: 0, y: 0, z: 0};
var upgrades = {x: 0, y: 0, z: 0};
var mapInfo = [];

var streakingBox = {
    constraint_x1: undefined,
    constraint_x2: undefined,
    constraint_y1: undefined,
    constraint_y2: undefined,
    constraint_z1: undefined,
    constraint_z2: undefined,
};

var region = {
    map: [],

    spawn: { name: "Spawn", check: (x, y, z) => inSpawn(x, y, z) },
    middle: { name: "Middle", check: (x, y, z) => inStreakingBox(x, y, z) },

    r1: { name: "R1", check: (x, z) => x >= 0 && z >= 0 },
    r2: { name: "R2", check: (x, z) => x >= 0 && z <= 0 },
    r3: { name: "R3", check: (x, z) => x <= 0 && z <= 0 },
    r4: { name: "R4", check: (x, z) => x <= 0 && z >= 0 },
};

let regionThread = null;
function newRegionThread() {
    return new Thread(JavaWrapper.methodToJava(() => {
        while (!Thread.interrupted()) {
            if (!World.isWorldLoaded()) {
                region.map = [];
                break;
            }
       
            var players = World.getLoadedPlayers().toArray().filter(p => {
                return p.getName().toString().trim() !== 'TextHelper:{"text": ""}';
            });
        
            for (let i = 0; i < players.length; i++) {
                let player = players[i];
                let name = player.getName().toString().match(/"text":\s*"([^"]+)"/)[1] ?? "Error";

                let x = player.getX(), y = player.getY(), z = player.getZ();

                // Determine current region
                let currentRegion = null;
                if (region.spawn.check(x, y, z)) {
                    currentRegion = region.spawn.name;
                } else if (region.middle.check(x, y, z)) {
                    currentRegion = region.middle.name;
                } else if (region.r1.check(x, z)) {
                    currentRegion = region.r1.name;
                } else if (region.r2.check(x, z)) {
                    currentRegion = region.r2.name;
                } else if (region.r3.check(x, z)) {
                    currentRegion = region.r3.name;
                } else if (region.r4.check(x, z)) {
                    currentRegion = region.r4.name;
                }

                // Find existing entry
                let entry = region.map.find(p => p.player === name);

                if (entry) {
                    if (entry.region !== currentRegion) {
                        if (overlay.opposition.includes(name)) Chat.log(`\u00A74${name} \u00A7Cmoved from \u00A7C${entry.region} \u00A7Bto \u00A7A${currentRegion}`);
                        entry.region = currentRegion;
                    }
                } else {
                    region.map.push({ player: name, region: currentRegion });
                    if (overlay.opposition.includes(name)) Chat.log(`\u00A74${name} \u00A7Aentered \u00A74${currentRegion}`);
                }
            }

            Time.sleep(100);
        }
    }));
}

let aimThread = null;
function newAimThread() {
    return new Thread(JavaWrapper.methodToJava( () => {
        const random_aim = {
            pitch: {
                height: 0.07,
                length: 5000,
                next: undefined,
                startTime: undefined,
            },
            
            yaw: {
                height: 5.15,
                length: 2150,
                next: undefined,
                startTime: undefined,
                exponent: 0.4,
                next_exponent: 1,
            },

            computeOffset: (type) => {
                const time = Time.time();

                if (type === "pitch") {
                    if (random_aim.pitch.next === undefined || time >= random_aim.pitch.next) {
                        random_aim.pitch.startTime = time;
                        random_aim.pitch.next = time + random_aim.pitch.length * (0.5 + Math.random());
                    }
                    const phase = (time - random_aim.pitch.startTime) / (random_aim.pitch.next - random_aim.pitch.startTime);
                    const skewedPhase = phase < 0.5
                        ? phase * 0.75
                        : 0.5 + (phase - 0.5) * 0.25;
                    const wave = Math.sin(2 * Math.PI * skewedPhase) * random_aim.pitch.height;
                    return wave;
                }

                else if (type === "yaw") {
                    if (random_aim.yaw.next === undefined || time >= random_aim.yaw.next) {
                        random_aim.yaw.startTime = time;
                        random_aim.yaw.next = time + random_aim.yaw.length * (0.5 + Math.random());
                        random_aim.yaw.next_exponent = random_aim.yaw.exponent * (1 + (Math.random() * 4));
                    }
                    const phase = (time - random_aim.yaw.startTime) / (random_aim.yaw.next - random_aim.yaw.startTime);
                    const base = Math.sin(2 * Math.PI * phase);
                    const wave = Math.sign(base) *
                                Math.pow(Math.abs(base), random_aim.yaw.next_exponent) *
                                random_aim.yaw.height;
                    return wave;
                }
            },
        };

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
        
        //negative -> looking upwards, positive -> looking downwards.
        const biasedNoise = (currentPitch, targetPitch, strength = 0.033) => {
            const base = random_aim.computeOffset("pitch") * strength;
            var bias = 0;
            const delta = currentPitch - targetPitch;
            const threshold = 14.5; // degrees difference (LOWER VALUE = SNAPPIER HEAD UP DOWN CORRECTION) 20 reccomended.
            const correction_magnitude = Math.abs(1 + (delta / 90));
            
            bias += (delta < -threshold ? strength * correction_magnitude : 0);
            bias += (delta > threshold ? -strength * correction_magnitude : 0);
            
            return base + bias;
        };
        
        const normalizeAngle = angle => {
            angle = angle % 360;
            if (angle > 180) angle -= 360;
            if (angle < -180) angle += 360;
            return angle;
        };
        let lastTarget = null;
        let lastUpdate = Time.time();
        let virtualYaw = Player.getPlayer().getYaw();
        let virtualPitch = Player.getPlayer().getPitch();

        while (!Thread.interrupted()) {
            if (!enabled || Hud.getOpenScreen() !== null || aimTickDelay > 0 || !locationStatus) {
                virtualYaw = Player.getPlayer().getYaw();
                virtualPitch = Player.getPlayer().getPitch();
                Time.sleep(10);
                continue;
            }

            const target = getTarget(); // must return {x, y, z}
            if (!target) {
                virtualYaw = Player.getPlayer().getYaw();
                virtualPitch = Player.getPlayer().getPitch();
                Time.sleep(10);
                continue;
            }

            lastTarget = target;

            const player = Player.getPlayer();
            if (!player) {
                virtualYaw = Player.getPlayer().getYaw();
                virtualPitch = Player.getPlayer().getPitch();
                Time.sleep(10);
                continue;
            }

            const now = Time.time();
            const dt = now - lastUpdate;
            lastUpdate = now;

            const {x, y, z} = target;
            const {x: px, y: py, z: pz} = player.getPos();
            const dx = x - px, dy = y - (py + 0.55), dz = z - pz; //positive offset looks further down.
            const distXZ = Math.sqrt(dx * dx + dz * dz);

            const targetYaw = -Math.atan2(dx, dz) * 180 / Math.PI;
            const targetPitch = -Math.atan2(dy, distXZ) * 180 / Math.PI;

            const yawDelta = normalizeAngle(targetYaw - virtualYaw);
            const aimspeed = 2.95;
            virtualYaw += clamp(yawDelta * 0.1, -aimspeed, aimspeed);

            const cp = player.getPitch();
            const pd = targetPitch - cp;
            virtualPitch += clamp(pd * 0.1, -aimspeed, aimspeed);

            const eased = ease(clamp(dt / 100, 0, 1));
            const pitchDamp = clamp(distXZ * 0.05, 0.1, 1.0);
            const basePitchRaw = cp + pd * eased * 0.15 * pitchDamp;
            const basePitch = clamp(basePitchRaw, -80, 80);

            const finalYaw = virtualYaw + random_aim.computeOffset("yaw") + gaussian() + Math.sin(now * 0.02 + seed) * 0.02;
            const finalPitch = clamp(
                basePitch
                + gaussian()
                + biasedNoise(basePitch, targetPitch)
                + (skewed(now) * 0.112),
                -90, 90
            );

            //Chat.log(random_aim.computeOffset("yaw"));
            player.lookAt(finalYaw, finalPitch);
            Time.sleep(Math.ceil(2 + Math.random() * 2));
        }
    
    })); 
}

function getMap() {
    
    var kings = World.getBlock(-11, 95, 6)?.getId().toString() == "minecraft:ender_chest";
    var corals = World.getBlock(-12, 114, 6)?.getId().toString() == "minecraft:ender_chest";
    var ogmap = World.getBlock(-13, 114, 7)?.getId().toString() == "minecraft:ender_chest";
    var seasons = World.getBlock(-12, 114, 5)?.getId().toString() == "minecraft:ender_chest";
    var genesis = World.getBlock(0, 0, 0)?.getId().toString() == "minecraft:ender_chest";
    var harrys = World.getBlock(12, 95, 6)?.getId().toString() == "minecraft:ender_chest";
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

        region.r1.name = "city"
        region.r2.name = "port"
        region.r3.name = "farm"
        region.r4.name = "forest"
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

        region.r1.name = "Volcano"
        region.r2.name = "Temple"
        region.r3.name = "Seaweed"
        region.r4.name = "Shipwreck"
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

        region.r1.name = "R1 TEST"
        region.r2.name = "R2 TEST"
        region.r3.name = "R3 TEST"
        region.r4.name = "R4 BEACH"
    }
    else if (seasons) {
        currentMap = "seasons"
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        
        streakingBox.constraint_x1 = 28
        streakingBox.constraint_x2 = -28
        streakingBox.constraint_z1 = 28
        streakingBox.constraint_z2 = -28
        streakingBox.constraint_y1 = 90
        streakingBox.constraint_y2 = 80
        
        region.r1.name = "R1 TEST"
        region.r2.name = "R2 TEST"
        region.r3.name = "R3 TEST"
        region.r4.name = "R4 BEACH"
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

        region.r1.name = "R1 TEST"
        region.r2.name = "R2 TEST"
        region.r3.name = "R3 TEST"
        region.r4.name = "R4 BEACH"
    }
    else if (harrys) {
        currentMap = "Sandbox"
        prestige = {x: 0, y: 0, z: 0}
        items = {x: 0, y: 0, z: 0}
        upgrades = {x: 0, y: 0, z: 0}
        
        streakingBox.constraint_x1 = 20
        streakingBox.constraint_x2 = -20
        streakingBox.constraint_z1 = 20
        streakingBox.constraint_z2 = -20
        streakingBox.constraint_y1 = 74.25
        streakingBox.constraint_y2 = 70

        region.r1.name = "R1 KAWAII"
        region.r2.name = "R2 KAWAII"
        region.r3.name = "R3 KAWAII"
        region.r4.name = "R4 KAWAII"
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

        region.r1.name = ""
        region.r2.name = ""
        region.r3.name = ""
        region.r4.name = ""
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

        region.r1.name = ""
        region.r2.name = ""
        region.r3.name = ""
        region.r4.name = ""
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

        region.r1.name = ""
        region.r2.name = ""
        region.r3.name = ""
        region.r4.name = ""
    }
    // returns a nested array of map information.
    mapInfo = [
    "Map: " + currentMap + "\n",
    " Spawn: " + streakingBox.constraint_y1 + "\n",
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

function inSpawn(x = posX, y = posY, z = posZ) {
    return y > streakingBox.constraint_y1 && x < 22 && x > -22 && z < 22 && z > -22;
}

function inStreakingBox(x = posX, y = posY, z = posZ) {
    return x < streakingBox.constraint_x1 && x > streakingBox.constraint_x2 && z < streakingBox.constraint_z1 && z > streakingBox.constraint_z2 && y < streakingBox.constraint_y1 && y > streakingBox.constraint_y2;
}

function normalizeAngle(angle) {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
}

function getTarget() {
    const middle = {x: 0, y: streakingBox.constraint_y1, z: 0};
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
            const isPlayer = p.getType().toString() === "minecraft:player";

        const mysticdrop = p.getName().toString().includes("Leather Pants", 0) || p.getName().toString().includes("Golden Sword", 0);
        if (mysticdrop) return mysticdrop; //prioritize mystics
        return withinBox && !blacklist && isPlayer;
    });

    online.splice(0, 1); // remove self from targets
    if (online.length === 0) {
        //enabled = false;
        //autoclicker.enabled = false;
        //Chat.log("Stopping due to lonliness");
        return {x: 0, y: py, z: 0, distance: null};
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

        const deltaA = Math.abs(normalizeAngle(yawTo(a) - cyaw));
        const deltaB = Math.abs(normalizeAngle(yawTo(b) - cyaw));

        // Case 1: both within 4.15 → sort by yaw delta
        if (distA <= 4.15 && distB <= 4.15) {
            return deltaA - deltaB;
        }

        // Case 2: one within 4.15 → prioritize the closer one
        if (distA <= 4.15 && distB > 4.15) return -1;
        if (distB <= 4.15 && distA > 4.15) return 1;

        // Case 3: both outside → sort by distance
        return distA - distB;
});

    const target = online[0];

    return {
        x: target.getPos().x,
        y: target.getPos().y,
        z: target.getPos().z,
        distance: Math.hypot(target.getPos().x - px, target.getPos().z - pz, target.getPos().y - py)
    };
}

function getBotState() {
    posX = Player.getPlayer().getPos().x;
    posY = Player.getPlayer().getPos().y;
    posZ = Player.getPlayer().getPos().z;
    
    if (inStreakingBox() === true) {
        locationStatus = "[Streaking Box]";
        wTap.runCheck();
    }
    else if (inSpawn() === true) {
        if (locationStatus == "[Down and outside bounds]" || locationStatus == "[Streaking Box]") {
            stopStreaking();
            movementDelay += 30;
        }
        locationStatus = "[Spawn]";
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
    if (movementDelay > 0) return;
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
    min: 1.5,
    max: 9,
    raytraceHitbox: false,
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

const config = {
    // Path to your JSON file
    filePath: "config.json",

    // Helper: load JSON file or create if missing
    load: () => {
        if (!FS.exists(config.filePath)) {
            FS.toRawFile(config.filePath).write(JSON.stringify([])); // create empty array
        }
        const raw = FS.toRawFile(config.filePath).read();
        return JSON.parse(raw);
    },

    // Helper: save JSON file
    save: (arr) => {
        FS.toRawFile(config.filePath).write(JSON.stringify(arr, null, 2));
    },
};

const overlay = {
    
    autogrinder: true,
    playerlist: true,
    targetBox: true,
    opposition: [],
    grinder_hud: null,
    player_hud: null,
    lastOpsHash: "",
    lastRenderTick: 0,
    renderInterval: 3, // update every 3 ticks
    
    renderHud: () => {
        if (overlay.autogrinder) {
            overlay.grinder_hud?.unregister();
            overlay.grinder_hud = Hud.createDraw2D();
            overlay.grinder_hud.register();
            var text_size = 0.8, text_kerning = 7, text_x = 4, text_z = 100, color = 0xff12f3, shadow = true, rotation = 0;
            overlay.grinder_hud.addText((currentMap ? currentMap : "error") + " \u00bb " + (locationStatus ? locationStatus : "error"), text_x, text_z - (text_kerning * 1), color, shadow, text_size, rotation);
            overlay.grinder_hud.addText("Distance to Middle: " + dist_mid(), text_x, text_z - (text_kerning * 2), color, shadow, text_size, rotation);
            overlay.grinder_hud.addText("[CPS] > " + (autoclicker.enabled ? randomization.cps : 0), text_x, text_z - (text_kerning * 3), color, shadow, text_size, rotation);
            overlay.grinder_hud.addText(enabled ? "\u00A7f[\u00A7aAuto Grinding\u00A7f]" : "\u00A7f[\u00A7cAuto Grinding\u00A7f]", text_x, text_z - (text_kerning * 4), color, shadow, text_size, rotation);
        }
        
        if (overlay.playerlist) {
            const currentTick = Math.floor(Time.time() / 50);
            const ops = getOps();
            const currentHash = hashUpdates(ops);

            if (currentHash !== overlay.lastOpsHash || currentTick - overlay.lastRenderTick >= overlay.renderInterval) {
                
                overlay.player_hud?.unregister();
                overlay.player_hud = Hud.createDraw2D();
                overlay.player_hud.register();
                overlay.lastOpsHash = currentHash;
                overlay.lastRenderTick = currentTick;

                var text_size = 0.61, text_kerning = 6, text_x = 4, text_z = 100, color = 0x17ff55, shadow = true, rotation = 0;
                overlay.player_hud.addText("Player List", text_x, text_z + (text_kerning * 1), color, shadow, text_size, rotation);

                var indexer = 0;
                for (let i = 0; i < onlineOps.length; i++) {
                    overlay.player_hud.addText("\u00A7b" + onlineOps[i].name + "\u00A7c " + onlineOps[i].distance + "\u00A7e " + onlineOps[i].leggings + "\u00A7e " + onlineOps[i].hand, text_x, text_z + (text_kerning * (i + 2)), color, shadow, text_size, rotation);
                    indexer++;
                }

                //overlay.player_hud.addText("Nicked Players", text_x, text_z + (text_kerning * (indexer + 2)), color, shadow, text_size, rotation);
                //overlay.player_hud.addText("\u00A77[\u00A76Available Soon\u00A77]", text_x, text_z + (text_kerning * (indexer + 3)), color, shadow, text_size, rotation);
            }
        }
    },

    renderTargetBox: () => {
        if (!overlay.targetBox) return;
        const target = getTarget();
        if (!target) {
            Hud.clearDraw3Ds();
            return;
        }
        
        const x1 = target.x - 0.45;
        const x2 = target.x + 0.45;
        const y1 = target.y - 0.01;
        const y2 = target.y + 1.99;
        const z1 = target.z - 0.41;
        const z2 = target.z + 0.41;

        const color = 0x000000; // Hex Color Space
        const alpha = 100; // 0 -> 100
        const fillColor = 0x46006B; // Hex Color Space
        const fillAlpha = 88; // 0 -> 100
        const fill = true;
        
        Hud.clearDraw3Ds();
        var targetBox = Hud.createDraw3D();
        targetBox.register();
        targetBox.addBox(x1, y1, z1, x2, y2, z2, color, alpha, fillColor, fillAlpha, fill);
    },
};

var onlineOps = [];

const cleanName = (n) => {
    return n.replace(/§./g, "").trim(); // Remove Minecraft color codes (§ plus any character)
}

function getOps() {
    var skipPlayerList = false;
    var skipNoItems = true;
    var player = World.getLoadedPlayers().toArray();
    onlineOps = [];
    
    if (skipPlayerList) {
        player = player.filter(p => {
            const name = cleanName(p.getName().toString());
            return !name.includes("CIT-") && !/Bot \d+/.test(name) && !name.includes(Player.getPlayer().getName().toString()) && !name.includes('"text": ""');
        });

        player.forEach(p => {
            if (!overlay.opposition.includes(p.getName().toString())) overlay.opposition.push(p.getName().toString())
        });
    }
    for (var i = 0; i < overlay.opposition.length; i++) {
        for (var j = 0; j < player.length; j++) {
            if (player[j].getName().toString().toUpperCase().includes(overlay.opposition[i].toUpperCase())) {
                var l = getLeggings(overlay.opposition[i]);
                var h = getHeld(overlay.opposition[i]);
                if (l === "" && h === "" && skipNoItems) continue;
                onlineOps.push({name: "\u00A7f" + (overlay.opposition[i].includes('"text": ""') ? overlay.opposition[i].slice(21, -2) : overlay.opposition[i]), distance: getDistance(overlay.opposition[i]), leggings: l, hand: h});
            }
        }
    }
    
    if (onlineOps.length == 0) onlineOps.push({name: "You are the only opp in the lob!", distance: "", leggings: "", hand: ""});
    return onlineOps;
}

function hashUpdates(ops) {
    return ops.map(op => `${op.name}-${op.distance}-${op.leggings}-${op.hand}`).join("|");
}


function getLeggings(opname) {
    var player = World.getLoadedPlayers().toArray();
    var lives = "";
    var leggings = "";

    for (var i = 0; i < player.length; i++) {
        try {
            if (player[i].toString().toUpperCase().includes(opname.toUpperCase())) {
                var armor = player[i].getLegArmor();
                if (!armor || armor.isEmpty()) break;

                var inputString = (() => {
                    try {
                        return cleanName(armor.getNBT().toString());
                    } catch(e) {
                        return cleanName(armor.getLore().toString());
                    } 
                })();
                
                lives = parseLives(inputString);

                //dangerous enchantments Respawn: Absorption, Escape Pod, Counter-Offensive, Excess, Danger Close, Boo-boo
                if (inputString.includes("Regularity")) leggings += "\u00A74Regularity\u00A77 " + parseLevel("Regularity", inputString);
                else if (inputString.includes("New Deal")) leggings += " \u00A75New Deal\u00A77 " + parseLevel("New Deal", inputString);
                else if (inputString.includes("Do it like")) leggings += " \u00A46French\u00A77 " + parseLevel("Do it like the French", inputString);
                if (inputString.includes("Solitude")) leggings += " \u00A7dSoli\u00A77 " + parseLevel("Solitude", inputString);
                if (inputString.includes("Funky")) leggings += " \u00A71Crit Funky\u00A77 " + parseLevel("Funky", inputString);
                if (inputString.includes("Mirror")) leggings += " \u00A7fMirror\u00A77 " + parseLevel("Mirror", inputString);
                if (inputString.includes("Retro-Gravity")) leggings += " \u00A7dRGM\u00A77 " + parseLevel("Retro-Gravity Microcosm", inputString);
                if (inputString.includes("Phoenix")) leggings += " \u00A7dPhoenix\u00A77 " + parseLevel("Phoenix", inputString);
                if (inputString.includes("Gotta go fast")) leggings += " \u00A7eFast\u00A77 " + parseLevel("Gotta go fast", inputString);
                if (inputString.includes("Fractional Reserve")) leggings += " \u00A7dFractional Reserve\u00A77 " + parseLevel("Fractional Reserve", inputString);
                if (inputString.includes("Peroxide")) leggings += " \u00A7cPeroxide\u00A77 " + parseLevel("Peroxide", inputString);
                if (inputString.includes("Golden Heart")) leggings += " \u00A71Golden Heart\u00A77 " + parseLevel("Golden Heart", inputString);
                if (inputString.includes("Last Stand")) leggings += " \u00A71Last Stand\u00A77 " + parseLevel("Last Stand", inputString);
                if (inputString.includes("Not Gladiator")) leggings += " \u00A71Not Gladiator\u00A77 " + parseLevel("Not Gladiator", inputString);
                if (inputString.includes("Prick")) leggings += " \u00A71Prick\u00A77 " + parseLevel("Prick", inputString);
                if (inputString.includes("Protection")) leggings += " \u00A71Protection\u00A77 " + parseLevel("Protection", inputString);
                if (inputString.includes("David and Goliath")) leggings += " \u00A71DAG\u00A77 " + parseLevel("David and Goliath", inputString);
                if (inputString.includes("Ring Armor")) leggings += " \u00A71Ring Armor\u00A77 " + parseLevel("Ring Armor", inputString);
                if (inputString.includes("Respawn: Absorption")) leggings += " \u00A71Respawn: Absorption\u00A77 " + parseLevel("Respawn: Absorption", inputString);
                if (inputString.includes("Escape Pod")) leggings += " \u00A71Escape Pod\u00A77 " + parseLevel("Escape Pod", inputString);
                if (inputString.includes("Counter-Offensive")) leggings += " \u00A71Counter-Offensive\u00A77 " + parseLevel("Counter-Offensive", inputString);
                if (inputString.includes("Excess")) leggings += " \u00A71Excess\u00A77 " + parseLevel("Excess", inputString);
                if (inputString.includes("Danger Close")) leggings += " \u00A71Danger Close\u00A77 " + parseLevel("Danger Close", inputString);
                if (inputString.includes("Boo-boo")) leggings += " \u00A71Boo-boo\u00A77 " + parseLevel("Boo-boo", inputString);

                //resource enchantments
                if (inputString.includes("Sweaty")) leggings += " \u00A71Sweaty\u00A77 " + parseLevel("Sweaty", inputString);
                if (inputString.includes("Moctezuma")) leggings += " \u00A71Moctezuma\u00A77 " + parseLevel("Moctezuma", inputString);
                if (inputString.includes("Gold Boost")) leggings += " \u00A71Gold Boost\u00A77 " + parseLevel("Gold Boost", inputString);
                if (inputString.includes("Gold Bump")) leggings += " \u00A71Gold Bump\u00A77 " + parseLevel("Gold Bump", inputString);
                if (inputString.includes("XP Boost")) leggings += " \u00A71XP Boost\u00A77 " + parseLevel("XP Boost", inputString);
                if (inputString.includes("XP Bump")) leggings += " \u00A71XP Bump\u00A77 " + parseLevel("XP Bump", inputString);
                
                if (inputString.includes("Venom")) leggings += " \u00A7aVenom " + parseLevel("Venom", inputString);
                if (armor.toString().includes("diamond")) leggings = " \u00A7bDiamond Legs";

                leggings += "\u00A7f " + lives;
            }
        } catch (err) {
            leggings += "\u00A74[Error]";
        }
    }

    return leggings;
}

function getHeld(opname) {
    var player = World.getLoadedPlayers().toArray();
    var lives = "";
    var heldItem = "";

    for (var i = 0; i < player.length; i++) {
        try {
            if (player[i].toString().toUpperCase().includes(opname.toUpperCase())) {
                var held = player[i].getMainHand();
                if (!held || held.isEmpty()) break;

                //Item Symbols
                if (held.getItemId() === "minecraft:golden_sword") heldItem += "\u2694"
                if (held.getItemId() === "minecraft:bow") heldItem += "⦄"

                var inputString = cleanName(held.getLore().toString());
                lives = parseLives(inputString);

                //dangerous sword
                if (inputString.includes("Billionaire")) heldItem += " \u00A75Bill\u00A77 " + parseLevel("Billionaire", inputString);
                if (inputString.includes("Gamble")) heldItem += " \u00A75Gamble\u00A77 " + parseLevel("Gamble", inputString);
                if (inputString.includes("Perun's Wrath")) heldItem += " \u00A75Perun's Wrath\u00A77 " + parseLevel("Perun's Wrath", inputString);
                if (inputString.includes("Executioner")) heldItem += " \u00A75Executioner\u00A77 " + parseLevel("Executioner", inputString);
                if (inputString.includes("Lifesteal")) heldItem += " \u00A74Lifesteal\u00A77 " + parseLevel("Lifesteal", inputString);
                if (inputString.includes("Pain Focus")) heldItem += " \u00A75Pain Focus\u00A77 " + parseLevel("Pain Focus", inputString);
                
                //dangerous bow Sprint Drain, Sniper, Push comes to shove, Pin down, Fletching, Telebow, Bottomless Quiver
                if (inputString.includes("Mega Longbow")) heldItem += " \u00A74Mega Longbow\u00A77 " + parseLevel("Mega Longbow", inputString);
                if (inputString.includes("Volley")) heldItem += " \u00A74Volley\u00A77 " + parseLevel("Volley", inputString);
                if (inputString.includes("Chipping")) heldItem += " \u00A74Chip\u00A77 " + parseLevel("Chipping", inputString);
                if (inputString.includes("Wasp")) heldItem += " \u00A74Wasp\u00A77 " + parseLevel("Wasp", inputString);
                if (inputString.includes("Sprint Drain")) heldItem += " \u00A74Drain\u00A77 " + parseLevel("Sprint Drain", inputString);
                if (inputString.includes("Sniper")) heldItem += " \u00A74Sniper\u00A77 " + parseLevel("Sniper", inputString);
                if (inputString.includes("Bottomless Quiver")) heldItem += " \u00A74Bottomless Quiver\u00A77 " + parseLevel("Bottomless Quiver", inputString);
                if (inputString.includes("Push comes to shove")) heldItem += " \u00A74Push\u00A77 " + parseLevel("Push comes to shove", inputString);
                if (inputString.includes("Pin down")) heldItem += " \u00A74Pin\u00A77 " + parseLevel("Pin down", inputString);
                if (inputString.includes("Fletching")) heldItem += " \u00A74Fletch\u00A77 " + parseLevel("Fletching", inputString);
                if (inputString.includes("Telebow")) heldItem += " \u00A74Tele\u00A77 " + parseLevel("Telebow", inputString);

                heldItem += "\u00A7f " + lives;
            }
        } catch (err) {
            heldItem += "\u00A74[Error]";
        }
    } 
    return heldItem;
}

function getDistance(opname) {
    var x = 0;
    var y = 0;
    var z = 0;
    var player = World.getLoadedPlayers().toArray();
    for (i = 0; i < player.length; i++) {
        if (player[i].toString().toUpperCase().includes(opname.toUpperCase())) {
            x = Math.abs(player[i].getX() - player[0].getX());
            y = Math.abs(player[i].getY() - player[0].getY());
            z = Math.abs(player[i].getZ() - player[0].getZ());
        }
    }
    return Math.floor(Math.sqrt(x * x + y * y + z * z));
}

function parseLives(str) {
    const match = str.match(/["']?Lives["']?\s*[:=]?\s*(\d+)\s*\/\s*(\d+)/);
    if (match) {
        return `${match[1]} / ${match[2]}`;
    }
    return "";
}

function parseLevel(matcher, str) {
    const safeMatcher = matcher.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape special chars
    // Longest-first ordering prevents "II" from being captured as "I"
    const pattern = new RegExp(
        `${safeMatcher}\\s+(X|IX|VIII|VII|VI|V|IV|III|II|I)(?![A-Za-z])`
    );
    const match = str.match(pattern);
    return match ? match[1] : "I";
}

/*

[============================]
[ ----- Fishing Helper ----- ]
[============================]

*/

var FishingHelper = {
    items: [],
    target: "",
    
checkMatch: (paneHint, candName, candItemId) => {
    const tokenize = (s) =>
        s.trim().toLowerCase().replace(/_/g, " ").split(/\s+/).filter(Boolean);

    // slice GUI padding
    paneHint = paneHint.toString().slice(21, -2);
    candName = candName.toString().slice(21, -2);
    candItemId = candItemId.toString();

    //strip away click on so it doesnt pollute the tokens.
    if (paneHint.toLowerCase().startsWith("click on ")) {
        paneHint = paneHint.substring(9);
    }
    
    // strip "minecraft:" prefix
    if (candItemId.startsWith("minecraft:")) {
        candItemId = candItemId.substring("minecraft:".length);
    }

    const tHint = tokenize(paneHint);
    const tName = tokenize(candName);
    const tId   = tokenize(candItemId);

    // Guard: empty hint must never match (prevents early resolution)
    if (tHint.length === 0) {
        return { matches: false, paneHint, candName, candItemId };
    }

    // Stage 1: strict ID match (all hint tokens must be present in item ID)
    const idMatch = tHint.every(word => tId.includes(word));
    if (idMatch) {
        return { matches: true, paneHint, candName, candItemId };
    }

    // Stage 2: loose name match (any overlap), only if hint is non-empty (already ensured)
    const nameMatch = tHint.some(word => tName.includes(word));
    return { matches: nameMatch, paneHint, candName, candItemId };
},

    tickContainer: () => {
        const inv = Player.openInventory();
        if (!inv.isContainer()) return false; 
        if (inv.getContainerTitle() !== "XP Minigame") return false;

        const items = inv.getItems("container");

        // cascade: items set first, then pane stage sets target by NAME
        if (items.toString().includes("minecraft:black_stained_glass_pane") ||
            items.toString().includes("minecraft:gray_stained_glass_pane")) {
            FishingHelper.target = items[0].getName().toString();
        } else {
            FishingHelper.items = items;
        }
        
        // compare target name against candidate names, fallback to ids if needed
        for (let i = 0; i < FishingHelper.items.length; i++) {
            const result = FishingHelper.checkMatch(
                FishingHelper.target,
                FishingHelper.items[i].getName().toString(),
                FishingHelper.items[i].getItemId()
            );
            Chat.log(`hint=${result.paneHint} | id=${result.candItemId} | name=${result.candName} | matches=${result.matches}`);
            if (result.matches) {
                FishingHelper.target = i + 1;
                break;
            }

        }
        
        // final stage: log and reset
        if (FishingHelper.target !== "" && FishingHelper.items.length > 0) {
            Chat.log("target: " + FishingHelper.target);
            FishingHelper.items = [];
            FishingHelper.target = "";
        }
    },
};


JsMacros.once("ChunkLoad", JavaWrapper.methodToJava( () => {
    Chat.unregisterCommand("list");
    Chat.createCommandBuilder("list")
    .greedyStringArg("input")
    .suggest(JavaWrapper.methodToJava((ctx, s) => {
        let input = "";
        try {
            input = ctx.getArg("input").trim();
        } catch (e) {
            s.suggestMatching(["Add", "Remove"]);
            return;
        }

        const parts = input.split(" ");
        if (parts.length === 1) {
            s.suggestMatching(["Add", "Remove"]);
        }
    }))
    .executes(JavaWrapper.methodToJava(ctx => {
        try {
            let input = ctx.getArg("input").trim();

            if (input.toUpperCase().startsWith("ADD")) {
                // slice off "ADD" and trim the rest
                input = input.slice(3).trim();
                overlay.opposition.push(input);
            }
            else if (input.toUpperCase().startsWith("REMOVE")) {
                // slice off "REMOVE" and trim the rest
                input = input.slice(6).trim();
                overlay.opposition = overlay.opposition.filter(name => name !== input);
            }

            config.save(overlay.opposition);
            Chat.log(config.load().toString());
        } catch (e) {
            Chat.log(e.toString());
        }
    }))
    .register();
}));

JsMacros.once("LaunchGame", JavaWrapper.methodToJava( () => {
    overlay.opposition = config.load();
}));
