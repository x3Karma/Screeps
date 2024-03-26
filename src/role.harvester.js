const roleHarvester = {

	/** @param {Creep} creep **/
	run: function(creep) {
		if (creep.store.getFreeCapacity() > 0) {
			const sources = creep.room.find(FIND_SOURCES);
			const result = creep.harvest(sources[0]);
			if (result == ERR_NOT_IN_RANGE) {
				creep.travelTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
			}
			creep.say('🔄 harvest');
		} else {
			const targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
						structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				}
			});

			if (targets.length > 0) {
				if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.travelTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				}
			} else {
				const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
				if (constructionSites.length) {
					if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
						creep.travelTo(constructionSites[0], {visualizePathStyle: {stroke: '#ffffff'}});
					}
				}
			}
			creep.say('transferring');
		}
	}
};

export default roleHarvester;
