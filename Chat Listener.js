let str = event.text.toString();
var currentTime = Time.time(); // get the current time
if (str.includes("SPIRE", 1) //lasts 7m
|| str.includes("BLOCKHEAD", 1)
|| str.includes("SQUADS", 1)
)   {
    if (GlobalVars.getBoolean("ToggleScript") && !GlobalVars.getBoolean("majorStop"))
    //if the bot is on and not already stopped ->
        {
        Chat.log("[Major Event] > Started (5m total)")
        GlobalVars.putObject("endTime", (Time.time() + 485000)) //8:05
        GlobalVars.putBoolean("majorStop", true)
        }
    }
if (str.includes("MINOR EVENT", 0)) {
    Chat.log("Detected Minor Event.")
}
// if the bot is running and is in limbo stop it first.
if (str.includes("Limbo", 1)
|| str.includes("You are AFK. Move around to return from AFK.", 1)
|| str.includes("DISCONNECTED", 1)
|| str.includes("An exception", 0)
|| str.includes("A kick occured", 0)) {
    if (GlobalVars.getBoolean("ToggleScript")) {
        Chat.log("\u00A7d[\u00A7cLimbo\u00A7d]")
        GlobalVars.putObject("waitPlay", (Time.time() + 14000))
        GlobalVars.putObject("waitHub", (Time.time() + 6000))
    }
}
var dropX = 0
var dropY = 0
var dropZ = 0
var totalEntity = 0
if (str.includes("MYSTIC", 0)) {
    var items = World.getEntities().toArray()
    for (let i = 0; i < items.length; i++) {
        var itemName = items[i].getName().toString()
        //Chat.log(itemName)
        if (itemName.includes("Leather Pants", 0) || itemName.includes("Golden Sword", 0)) {
            dropX = Math.floor(items[i].getX())
            dropY = Math.floor(items[i].getY())
            dropZ = Math.floor(items[i].getZ())
        }
        else {
            totalEntity++
        }
    }
    if (dropX !== 0 || dropY !== 0 || dropZ !== 0) {
        Chat.say(".b setting freelook false")
        Chat.say(".b goto " + dropX + " " + dropY + " " + dropZ)
        Chat.log("Found Item at: " + dropX + " " + dropY + " " + dropZ)
    }
    else {
        Chat.log("<Err!> If this keeps happening, contact holiday")
    }
}
//stop during spire
//stop during squads
