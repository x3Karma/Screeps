import roleHarvester from "./role.harvester";
import roleUpgrader from "./role.upgrader";
import roleBuilder from "./role.builder";
import roleMiner from "./role.miner";
import roleTransferer from "./role.transferer";
import roleRepairer from "./role.repairer";
import "./spawn_creeps";
import roleWallRepairer from "./role.wallrepairer";
import roleShuttle from "./role.shuttle";
import roleRecycle from "./role.recycle";
import roleLDHarvester from "./role.ldharvester";
import roleLDMiner from "./role.ldminer";
import Traveler from "./traveler";
import { roomLinks, RoomLinks } from "./roomlinks";

export function loop() {

	for ( var name in Memory.creeps ) 
	{
		if(!Game.creeps[name]) {
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
		}
	}

	let spawn = Game.spawns['My First Home'];
	let room = spawn.room;
	let role = spawn.determineBestCreepRole( spawn, room );

	if ( !(role === 'no energy') && !(role === 'none') && !spawn.spawning ) 
	{
		spawn.pushToQueue( spawn, room, role );
	}

	if ( spawn.memory.queue == undefined )
		spawn.memory.queue = [];

	if ( spawn.memory.queue.length > 0 && !spawn.spawning )
		spawn.attemptSpawn( spawn, room );
	//Game.spawns['My First Home'].spawnCreep([CARRY,CARRY,MOVE,MOVE], 'Mover3', {memory: {role: 'transferer'}});
	//Game.spawns['My First Home'].spawnCreep([WORK,WORK,CARRY,MOVE,MOVE], 'Builder' + Game.time.toString() , {memory: {role: 'builder'}});
	// spawn.spawnCreep([WORK,MOVE,CARRY], 'LDHarvester1', {memory: {role: 'ldharvester'}});
	
	if ( spawn.spawning ) { 
		var spawningCreep = Game.creeps[spawn.spawning.name];
		spawn.room.visual.text(
			'🛠️' + spawningCreep.memory.role,
			spawn.pos.x + 1, 
			spawn.pos.y, 
			{align: 'left', opacity: 0.8});
	}

	for (var name in Game.creeps) {
		var creep = Game.creeps[name];
		switch (creep.memory.role) {
			case 'harvester':
				roleHarvester.run(creep);
				break;
			case 'upgrader':
				roleUpgrader.run(creep);
				break;
			case 'builder':
				roleBuilder.run(creep);
				break;
			case 'miner':
				roleMiner.run(creep);
				break;
			case 'transferer':
				roleTransferer.run(creep);
				break;
			case 'repairer':
				roleRepairer.run(creep);
				break;
			case 'wallrepairer':
				roleWallRepairer.run(creep);
				break;
			case 'shuttle':
				roleShuttle.run(creep);
				break;
			case 'recycle':
				roleRecycle.run(creep);
				break;
			case 'ldharvester':
				roleLDHarvester.run(creep);
				break;
			case 'ldminer':
				roleLDMiner.run(creep);
				break;
		}

		/* if ( creep.name == 'Upgrader56629013' )
		{
			creep.memory.role = 'upgrader';
		}	 */

		// if the creep is standing next to a source and can't harvest it, move away
		/* if ( creep.harvest(creep.pos.findClosestByPath(FIND_SOURCES)) != ERR_NOT_IN_RANGE && creep.harvest(creep.pos.findClosestByPath(FIND_SOURCES)) == ERR_NO_BODYPART ) 
		{
			creep.travelTo(20,20);
			creep.say('I am blocking!')
		} */

		//Game.creeps['repairer56686165'].travelTo( new RoomPosition(25,25, 'W8N2'));

		// if creep is at edge of room, move to center
		/* if ( creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49 )
		{
			creep.travelTo(new RoomPosition(25,25,creep.room.name));
		} */
	}

	// if my spawn is within range of an enemy, turn on safe mode
	if ( spawn.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0 )
	{
		spawn.room.controller.activateSafeMode();
	}

	// check for sources that are not being harvested
	roomLinks()
	
	// auto attack tower
	var towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
	for (let tower of towers)
	{
		var hostiles = tower.room.find( FIND_HOSTILE_CREEPS )
		if ( hostiles.length > 0 )
		{
			tower.attack( hostiles[0] )
			break;
		}

		if ( tower.room.memory.repairables.length > 0 )
		{
			const result = tower.repair( Game.getObjectById( tower.room.memory.repairables[0] ) )
		}
	}
	
}