var roleMiner = {
    run: function(creep) {
        // Set the creep's mining status to false if it's not already set
        if (creep.memory.mining == null) 
        {
            creep.memory.mining = false;
        }

        if ( creep.memory.moving == null )
            creep.memory.moving = false;

        // Check if the creep's carry capacity is full
        if (creep.store.getFreeCapacity() == 0) {
            // Drop the resources from the creep's inventory
            creep.drop(RESOURCE_ENERGY);
        } 
        else if ( creep.memory.mining == false && creep.memory.moving == false ) // If the creep doesn't already has a mining spot and is not moving to one
        {
            if (creep.room.name != 'W8N2') {
                return creep.travelTo(new RoomPosition(25, 25, 'W8N2'));
            }

            // Find the nearest energy source
            var sources = creep.room.find(FIND_SOURCES);

            // Pick a suitable energy source
            for ( let i = 0; i < sources.length; i++ ) 
            {
                var source = sources[i];

                var creepsHarvestingAdjoiningSource = 0;
                for (let n in Game.creeps)
                    if (Game.creeps[n].memory.source == source.id && Game.creeps[n].memory.role == 'ldminer')
                        creepsHarvestingAdjoiningSource++;
                
                console.log('creepsHarvestingAdjoiningSource: ' + creepsHarvestingAdjoiningSource)

                // If the creep can't move to the source, or can't harvest it, then continue to the next source
                if ( ( creep.travelTo(source) == ERR_NO_PATH && creep.harvest(source) == ERR_NOT_IN_RANGE ) || creepsHarvestingAdjoiningSource > 1 || ( source.id == "5bbcaabd9099fc012e6321c3" && creepsHarvestingAdjoiningSource > 0 )) 
                {
                    console.log('no path to source: ' + source.id);
                    creep.say("new mine")
                    continue;
                }
                
                // seems ok, lets try to mine this source
                creep.memory.source = source.id;
                creep.memory.moving = true;
                creep.travelTo( source )
            }

        }
        else if ( creep.memory.mining == false && creep.memory.moving == true )
        {
            var source = Game.getObjectById(creep.memory.source);
            if ( creep.harvest(source) == ERR_NOT_IN_RANGE ) 
            {
                var move = creep.travelTo(source, { visualizePathStyle: { stroke: '#FFC0CB' }, reusePath: 5});

                if ( move == ERR_NO_PATH ) 
                {
                    creep.memory.moving = false;
                    creep.memory.mining = false;
                }
            }

            if ( creep.harvest(source) == OK ) 
            {
                creep.say('⛏️ mine');
                creep.memory.mining = true;
                creep.memory.moving = false;
                creep.memory.source = source.id;
            }
        }
        else if ( creep.memory.mining == true ) // If the creep already has a mining spot
        {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) 
            {
                creep.travelTo(source, { visualizePathStyle: { stroke: '#ffffff' } });
            }
            creep.memory.source = source.id;
        }
    } 
}

module.exports = roleMiner;
