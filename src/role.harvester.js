var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if( creep.store.getFreeCapacity() > 0 ) {
            var sources = creep.room.find(FIND_SOURCES);
            const result = creep.harvest(sources[0]);
            if(result == ERR_NOT_IN_RANGE) {
                creep.travelTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            creep.say('🔄 harvest');
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            
            // var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
                creep.say('transfering');
                
        }
	}
};

module.exports = roleHarvester;