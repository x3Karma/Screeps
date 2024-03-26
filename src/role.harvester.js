const roleHarvester = {

	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.store.getFreeCapacity() > 0) {
			const sources = creep.room.find(FIND_SOURCES_ACTIVE);
			if (sources)
			{
				const result = creep.harvest(sources[0]);
				if (result == ERR_NOT_IN_RANGE) {
					creep.travelTo(sources[0]);
				}
				creep.say('🔄 harvest');
			}
			else
			{
				// try to become a transferer or a miner if none are available
				if ( creep.room.find(FIND_MY_CREEPS, { filter: (c) => c.memory.role == 'transferer' }).length == 0 )
				{
					creep.memory.role = 'transferer';
					console.log(creep.name + ' is now a transferer');
				}
				else if ( creep.room.find(FIND_MY_CREEPS, { filter: (c) => c.memory.role == 'miner' }).length == 0 )
				{
					creep.memory.role = 'miner';
					console.log(creep.name + ' is now a miner');
				}
			}
		} else {
			const targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
						structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				}
			});

			if (targets.length > 0) {
				if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.travelTo(targets[0]);
				}
			} else {
				const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
				if (constructionSites.length) {
					if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
						creep.travelTo(constructionSites[0]);
					}
				}
			}
			creep.say('transferring');
		}
	}
};

export default roleHarvester;
