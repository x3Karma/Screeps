const {Helpers} = require('./utilities');
var roleUpgrader = require('./role.upgrader');

function buildSites(creep, room)
{
    var targets = room.memory.sites;
    const target = Game.getObjectById(targets[0]);
    if(target) 
    {
        if(creep.build(target) == ERR_NOT_IN_RANGE) 
        {
            creep.travelTo( target );
        }
    }
    else 
    {
        // if not doing anything just be an upgrader at home world
        if (creep.room.name != 'W8N3')
        {
            // go back to home world
            creep.travelTo(new RoomPosition(7, 47, 'W8N3'));
        }
        else
            roleUpgrader.run(creep);
    }
}

var roleBuilder = 
{

    run: function(creep) {

        if (creep.memory.building == undefined) 
        {
            creep.memory.building = false;
        }

        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) 
        {
            creep.memory.building = false;
            creep.memory.pickup = true;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) 
        {
            creep.memory.building = true;
            creep.memory.pickup = false;
            creep.say('🚧 build');
        }

        if ( creep.memory.building ) 
        {
            // start to look for other rooms as well
            for ( let roomName in Game.rooms )
            {
                var room = Game.rooms[roomName];
                // if this room has resources pick it up
                if ( room.memory.sites.length > 0 )
                {
                    buildSites(creep, room);
                    return;
                }
            }
            
            // if no sites to build, go back to home room and run roleUpgrader
            if (creep.room.name != 'W8N3')
            {
                // go back to home world
                creep.travelTo(new RoomPosition(7, 47, 'W8N3'));
            }
            else
                roleUpgrader.run(creep);
                /* var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE ) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                
                if(targets.length) 
                {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 5});
                    }
                } */

            // auto road building
            /* var sources = Game.spawns[NomSpawner].room.find(FIND_SOURCES);
            for (var j = 0; j < sources.length; j++)
            {
                var chemin = Game.spawns[NomSpawner].pos.findPathTo(sources[j].pos);
                for (var i = 0; i < chemin.length; i++) 
                {
                    Game.spawns[NomSpawner].room.createConstructionSite(chemin[i].x,chemin[i].y, STRUCTURE_ROAD);
                }
            } */
        }
        else if ( creep.memory.pickup = false && creep.memory.building == false ) 
        {
            
        }
        else if ( creep.memory.pickup = true && creep.memory.building == false ) 
        {
            for ( let roomName in Game.rooms )
            {
                var room = Game.rooms[roomName];
                var storages = room.find(FIND_STRUCTURES, { filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0; } });
                // if this room has storages pick it up
                if ( creep.room == room && storages.length > 0)
                {
                    const storage = creep.pos.findClosestByPath(storages);
                    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
                    {
                        creep.travelTo(storage, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
                        break;
                    }
                }
                // if this room has resources pick it up
                else if ( creep.room == room && room.find(FIND_DROPPED_RESOURCES).length > 0 )
                {
                    Helpers.findDroppedResources(creep);
                    break;
                }
                // if not check other rooms
                else if ( creep.room != room && (room.find(FIND_DROPPED_RESOURCES).length > 0 || storages.length > 0) )
                {
                    creep.travelTo( new RoomPosition(25,25,room.name) )
                    break;
                }
            }
        }
        else if ( creep.memory.pickup == null || creep.memory.building == null )
        {
            // reset states
            creep.memory.building = false;
            creep.memory.pickup = false;
        }
    }
};

module.exports = roleBuilder;