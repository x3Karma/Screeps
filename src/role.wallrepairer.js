module.exports = {
	run: function(creep) 
	{
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
			creep.say('WR: finding');
		} 
		else if ( creep.memory.repairing && creep.store[RESOURCE_ENERGY] > 0 ) 
		{
			// prioritize non-wall ramparts first before anything else
			const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < 300000
			});

			if (structure) {
				if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
					creep.travelTo(structure);
				}
			} else 
			{
				creep.memory.repairing = false;
			}
			creep.say('WR: repairing');
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
