const { Helpers } = require('./utilities');

const roleShuttle = {
	run: function(creep) {

		// If the creep is not picking up, set it to true
		if ( creep.memory.pickingUp == undefined ) {
			creep.memory.pickingUp = true;
		}

		// If the creep has inventory slots left, and is in the process of picking up more energy
		if ( creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && creep.memory.pickingUp == true ) 
		{
			// if the creep doesn't has a set target to pick up from
			if ( creep.memory.target == undefined || creep.memory.target == null )
			{
				// find a dropped source from the ground or dead creeps or ruins to pick up
				// const droppedSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
				const tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES);
				const ruins = creep.room.find(FIND_RUINS);
				Helpers.findDroppedResources(creep);
				 /* if (droppedSource) {
					 if (creep.pickup(droppedSource) == ERR_NOT_IN_RANGE) {
						 creep.travelTo(droppedSource, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
					 }
				 } */
	
				 if (tombstone) {
					if (creep.withdraw(tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.memory.target = tombstone.id;
						creep.travelTo(tombstone, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
					}
				 }
				 if (ruins) {
					 // loop through the array
					 for (let i = 0; i < ruins.length; i++ ) {
						 if ( creep.withdraw(ruins[i], RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES ) 
						 {
							 continue;
						 }
						 else if ( ruins[i].store[RESOURCE_ENERGY] > 0 ) 
						 {
							 if (creep.withdraw(ruins[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
								creep.memory.target = ruins[i].id;
								creep.travelTo(ruins[i], {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
							 }
						 } 
					 }
				 }

				 creep.say('🔄 pickup');

			}
			else // the creep has a target. let's pick up from it
			{
				var target = Game.getObjectById(creep.memory.target);

				// if the entity doesn't exist anymore
				if (target == null) 
				{
					creep.memory.target = null;
					return;
				}

				// check what type of structure it is and use the corresponding pickup method
				if (target instanceof Tombstone || target instanceof Ruin) {
					const result = creep.withdraw(target, RESOURCE_ENERGY);
					if ( result == ERR_NOT_IN_RANGE ) {
						creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
					}
					else if ( result == ERR_NOT_ENOUGH_RESOURCES )
						creep.memory.target = null;
				} else if (target instanceof Resource ) {
					if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
						creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
					}
				}
			}
		}
		// If the creep has inventory slots left, and is not in the process of picking up more energy
		else if ( creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && creep.memory.pickingUp == false ) 
		{
			// why aren't you picking up then, if you have inventory slots
			if ( creep.memory.pickingUp == false ) {
				creep.say('🔄 pickup');
			}
			// set it to picking up mode
			creep.memory.pickingUp = true;

		}
		// if the creep has energy in its inventory
		else if ( creep.store[RESOURCE_ENERGY] > 0 )
		{
			// remove resources target from memory
			creep.memory.target = null;
			creep.say('🚚 shuttle!')

			// check if there's a target to transfer resources to
			if ( Helpers.hasTarget(creep) )
			{
				const target = Game.getObjectById(creep.memory.target);

				if ( Helpers.isCloseToTarget(creep, target) ) 
				{
					if ( Helpers.actionAtTarget(creep, target) == 'transfer' ) 
					{
						if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
						}
					}
				}
				else 
				{
					creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
				}
			}
			else
			{     
				// Find the nearest structure that needs resources
				var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
							( ( structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER ) 
							&& ( _.sum(structure.store) < structure.storeCapacity || structure.energy < structure.energyCapacity )  )
						);
					}
				});
	
				// If a target is found, transfer the resources
				if (target) {
					if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
						creep.say("🚚 shuttle!");
						Helpers.setTarget(creep, target);
					}
				} else {
					// If no target is found, refill builders
					var builders = creep.room.find(FIND_MY_CREEPS, {
						filter: (creep) => {
							return (
								(creep.memory.role == 'builder') &&
								creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0
							);
						}
					});
	
					// found builders
					if (builders) {
						// filter to path to closest builder and transfer energy
						const builder = creep.pos.findClosestByPath(builders);
	
						if (creep.transfer(builder, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.travelTo(builder, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
							creep.say("trying to move");
							Helpers.setTarget(creep, builder);
						}
					}
				}
			}
			//console.log('target: ' + target);
			
			// set it to not picking up mode if completely empty
			if ( creep.store[RESOURCE_ENERGY] == 0 )
			{
				creep.memory.pickingUp = false;
				Helpers.clearTarget(creep);
			}
		}
	}
};

// Export the shuttle role
module.exports = roleShuttle;
