module.exports = {
    run: function(creep) 
    {
        // if this room has no repairer, assign this creep to be the repairer
        if ( creep.room.memory.repairer == null )
        {
            creep.room.memory.repairer = creep.id;
            console.log ('[1] ' + creep.name + ' is the repairer for ' + creep.room.name);
        }
        else if ( creep.room.memory.repairer != creep.id )
        {
            // find other rooms that need repairers
            for ( roomName in Game.rooms )
            {
                var room = Game.rooms[roomName];

                //console.log('room.memory.repairer: ' + room.memory.repairer + ' for ' + room.name)
                
                if ( room.memory.repairer == null )
                {
                    room.memory.repairer = creep.id;
                    console.log ('[2] ' + creep.name + ' is the repairer for ' + room.name);
                } 
                else 
                    continue;
            }
        }

        /* // if at edge of room, move to center
        if ( creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49 )
        {
            creep.travelTo(new RoomPosition(25,25,creep.room.name));
        } */


        if ( !creep.memory.repairing && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 ) 
        {
            const storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => ( s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER ) && s.store[RESOURCE_ENERGY] > 0
            });

            if (storage) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(storage);
                }
            } else {
                const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                    filter: (r) => ( r.resourceType === RESOURCE_ENERGY ) && r.amount > 50
                });

                if ( droppedEnergy ) {
                    if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(droppedEnergy);
                    }
                } else if ( source ) {
                    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(source);
                    }
                } else {
                    creep.say("No energy source");
                }
            }
            creep.say('R: finding');
        } 
        else if ( creep.memory.repairing && creep.store[RESOURCE_ENERGY] > 0 ) 
        {
            // prioritize non-wall ramparts first before anything else
            for ( roomName in Game.rooms )
            {
                var room = Game.rooms[roomName];
                if ( room.memory.repairer != creep.id )
                {
                    continue;
                }
                else 
                {
                    var structures = room.memory.repairables
                    const structure = Game.getObjectById(structures[0]);
                    // console.log('structure: ' + structure + ' for ' + room.name)
                    if (structure) {
                        if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
                            creep.travelTo(structure);
                            break;
                        }
                    } 
                    else 
                    {
                        creep.memory.repairing = false;
                    }
                    
                }
            }
            
            creep.say('R: repairing');
        } 
        else if ( !creep.memory.repairing && creep.store.getFreeCapacity() == 0 )
        {
            creep.memory.repairing = true;
            creep.say('🔨 repair');
        }
        else if ( creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0 )
        {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        else
        {
            creep.say('R: error');
            console.log('Repairer: ' + creep.name + ' has an error')
            console.log('Repairer: ' + creep.name + ' has ' + creep.store[RESOURCE_ENERGY] + ' energy')
            console.log('Repairer: ' + creep.name + ' has ' + creep.store.getFreeCapacity() + ' free capacity')
            console.log('Repairer: ' + creep.name + ' is ' + creep.memory.repairing + ' repairing')
        }
    }
};
