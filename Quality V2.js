var currentTime = Time.time()
var players = World.getLoadedPlayers().toArray()
var mapHeight = 110
const spawn = new Array()
const pit = new Array()

function removePlayerPit(array, value) {
  var index = array.indexOf(value);
  if (index > -1) {
    pit.splice(index, 1);
  }
  return pit;
}
function removePlayerSpawn(array, value) {
  var index = array.indexOf(value);
  if (index > -1) {
    spawn.splice(index, 1);
  }
  return spawn;
}

for (let i = 0; i < players.length; i++) {
    var x = players[i].getX()
    var y = players[i].getY()
    var z = players[i].getZ()
    var name = players[i].toString()
    var nameFormat = name.substring(42, name.length - 30)
    if (x < 9 && x > -9 && z < 9 && z > -9 && y < mapHeight) {
        pit.push(nameFormat)
    }
    if (x < 9 && x > -9 && z < 9 && z > -9 && y > mapHeight) {
        spawn.push(nameFormat)
    }
}
if (spawn.includes(nameFormat, 0)) {
    //Chat.log(nameFormat + "monkey respawned")
    removePlayerSpawn(spawn, nameFormat)
}
if (pit.includes(nameFormat, 0)) {
    Chat.log(nameFormat + "monkey dropped")
    removePlayerPit(pit, nameFormat)
}
