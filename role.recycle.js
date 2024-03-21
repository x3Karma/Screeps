module.exports = {
    run: function(creep) {

        const spawn = creep.room.find(FIND_MY_SPAWNS)[0];

        // Check if the creep is already at a spawn
        if (creep.pos.isNearTo( spawn )) {
            // Recycle the creep
            spawn.recycleCreep(creep);
        } else {
            // Move the creep towards the nearest spawn
            creep.travelTo(spawn, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
};