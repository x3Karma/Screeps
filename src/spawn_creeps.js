const { Helpers } = require('./utilities');

const stopSpawning = false;

StructureSpawn.prototype.determineBestCreepRole = function ( spawn, room ) 
{
    // At the very beginning of the script, if there are no creeps, or I lost all my creeps to an attack, I need to spawn a harvester
    // Goal of the harvester is to simply harvest energy from the source and deposit it into the spawn so I can spawn better troops

    let creepToSpawn = 'none';

    if ( Object.keys(Game.creeps).length == 0 )
    {
        console.log("No creeps, spawning a harvester")
        return creepToSpawn = 'harvester';
    }

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
	var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
	var transferers = _.filter(Game.creeps, (creep) => creep.memory.role == 'transferer');
	var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
	var wallrepairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'wallrepairer');
	var shuttles = _.filter(Game.creeps, (creep) => creep.memory.role == 'shuttle');
	var ldminers = _.filter(Game.creeps, (creep) => creep.memory.role == 'ldminer');
    var ldharvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'ldharvester');

    // Once I have 250 energy, I can dedicate a miner to the source, and leave the transferer to move the energy from the miner to the spawn
    
    if ( Object.keys(Game.creeps).length > 0 && room.energyAvailable >= 250 )
    {
        if ( miners.length < 1 ) // no miners, high priority
        {
            creepToSpawn = 'miner';
        }
        else if ( transferers.length < 1 && miners > 0 ) // no transferers to transport energy, high priority
        {
            creepToSpawn = 'transferer';
        }
        else if ( miners.length < 3 && transferers.length > 1 ) // we have 1 transferer, we can have a 2nd miner to harvest more energy
        {
            creepToSpawn = 'miner';
        }
        else if ( transferers.length < 2 ) // we have more than enough miners, time to focus on transporting energy to spawn
        {
            creepToSpawn = 'transferer';
        }
        else if ( shuttles.length < 2 && room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } }).length > 0 ) // we can have a shuttle to move energy from the spawn to the storage
        {
            creepToSpawn = 'shuttle';
        }
        else if ( builders.length < 6 ) // we can have a builder to start building structures
        {
            creepToSpawn = 'builder';
        }
        else if ( upgraders.length < 1 ) // we can have an upgrader to start upgrading the controller
        {
            creepToSpawn = 'upgrader';
        }
        /* else if ( repairers.length < 1 ) // we can have a repairer to start repairing structures
        {
            creepToSpawn = 'repairer';
        } */
        else if ( wallrepairers.length < 2 && ( room.find(STRUCTURE_WALL).length > 0 || room.find(STRUCTURE_RAMPART).length > 0 ) ) // we can have a wallrepairer to start repairing walls
        {
            creepToSpawn = 'wallrepairer';
        }
        // if the long distance miner is about to die and we have enough energy, spawn a new one
        else if ( ldminers.length < 1 )
        {
            creepToSpawn = 'ldminer';
        }
        else if ( ldminers.length > 0 && ldharvesters.length < 1 )
        {
            creepToSpawn = 'ldharvester';
        }
        return creepToSpawn; // 'none' no creeps to spawn
    }   
    else if ( room.energyAvailable < 250 )
    {
        creepToSpawn = 'no energy';
        return creepToSpawn;
    }
}

StructureSpawn.prototype.determineBodyParts = function ( role, room )
{
    // if its a harvester, it needs at least 1 work, 1 move, and 1 carry
    if ( role === 'harvester' || role === 'repairer' || role === 'wallrepairer' || role === 'builder' || role === 'upgrader' )
    {
        return Helpers.chooseBodyparts( room.energyCapacityAvailable, [WORK,MOVE,CARRY,MOVE,WORK,MOVE,CARRY,MOVE,WORK,MOVE,CARRY,MOVE] );
    }

    // if its a miner, it needs at least 2 work, and 1 move, since it will stay mining at the source forever
    else if ( role === 'miner' || role === 'ldminer' )
    {
        return Helpers.chooseBodyparts( room.energyCapacityAvailable, [WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE] );
    }

    // if its a transferer, it needs at least 1 carry and 1 move, it won't be working
    else if ( role === 'transferer' || role === 'shuttle' || role === 'ldharvester' )
    {
        return Helpers.chooseBodyparts( room.energyCapacityAvailable, [CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE] );
    }

}

StructureSpawn.prototype.testBodyParts = function ( spawn, role, room )
{
    console.log( spawn.determineBodyParts( role, room ) );
}

// Push the creep to the spawn queue
StructureSpawn.prototype.pushToQueue = function ( spawn, room, role )
{
    if( !spawn.memory.queue )
    {   
        spawn.memory.queue = [];
    }
    else
    {
        if ( role in spawn.memory.queue )
        {
            return;
        }

        spawn.memory.queue.push( role );
        console.log('Pushing ' + role + ' to the spawn queue.')
    }
}

// Attempt to spawn a creep
StructureSpawn.prototype.attemptSpawn = function ( spawn, room )
{
    if ( !spawn.memory.queue )
    {
        console.log("No creeps to spawn");
        return;
    }
    else if ( spawn.memory.queue && !stopSpawning )
    {
        if ( spawn.spawning )
        {
            return;
        }
        else
        {
            var role = spawn.memory.queue[0];
            var body = spawn.determineBodyParts( role, room );
            var newName = role + Game.time;
            const result = spawn.spawnCreep( body, newName, { memory: { role: role } } );
            console.log('Spawning new ' + role + ': ' + newName + ' with body parts ' + body + ' with result: ' + result);
            spawn.memory.queue = _.drop( spawn.memory.queue, 1 );
        }
    }
}

// determine if the spawn needs energy currently
/* StructureSpawn.prototype.needsEnergy = function ( spawn, room )
{
    if ( room.energyAvailable < room.energyCapacityAvailable )
    {
        return true;
    }
    return false;
} */