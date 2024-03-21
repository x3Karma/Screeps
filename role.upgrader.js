

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if( creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0 ) 
        {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if( !creep.memory.upgrading && creep.store.getFreeCapacity() == 0 ) 
        {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if ( creep.memory.upgrading ) 
        {
            if ( creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE || creep.pos.y == 7 ) 
            {
                creep.travelTo( creep.room.controller );
            }
        }
        else 
        {
            // look for nearby storage containers
            const storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => ( s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER ) && s.store[RESOURCE_ENERGY] > 0
            });

            if (storage) 
            {
                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(storage);
                }
            } 
            else 
            {
                const droppedSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: (r) => ( r.resourceType === RESOURCE_ENERGY ) && r.amount > 50 } );
                if (droppedSource)
                {
                    if (creep.pickup(droppedSource) == ERR_NOT_IN_RANGE) 
                    {
                        creep.travelTo(droppedSource, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
                    }
                }
                else
                {
                        
                    var sources = creep.room.find(FIND_SOURCES);

                    // Swap sources if there's no available room to harvest
                    for (let i = 0; i < sources.length; i++ ) 
                    {
                        if ( creep.travelTo(sources[i]) == ERR_NO_PATH ) 
                        {
                            continue;
                        }
                        creep.memory.source = sources[i];
                    }

                    if ( creep.harvest(creep.memory.source) == ERR_NOT_IN_RANGE ) 
                    {
                        creep.travelTo(creep.memory.source, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
	}
};

module.exports = roleUpgrader;