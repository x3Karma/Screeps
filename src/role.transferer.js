const { Helpers } = require('./utilities');

// Pick up energy from the ground, dead creeps, or ruins, and transfer it to the spawn
function pickUpEnergy(creep) {
	// if the creep doesn't has a set target to pick up from
	if ( creep.memory.target == undefined || creep.memory.target == null )
	{
		// find a dropped source from the ground or dead creeps or ruins to pick up
		// const droppedSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
		const tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES);
		const ruins = creep.room.find(FIND_RUINS);
		const container = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (s) => ( s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE ) && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0 });

		Helpers.findDroppedResources(creep);

		if (container) {
		   if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			   creep.memory.target = container.id;
			   creep.travelTo(container, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
		   }
		}
		 if (tombstone) {
			if (creep.withdraw(tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.memory.target = tombstone.id;
				creep.travelTo(tombstone, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
			}
		 }
		 if (ruins) {
			// loop through the array
			for (let i = 0; i < ruins.length; i++ ) 
			{
				if ( creep.withdraw(ruins[i], RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES ) 
				{
					continue;
				}
				else if ( ruins[i].store[RESOURCE_ENERGY] > 0 ) 
				{
					if (creep.withdraw(ruins[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
					{
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
			else if ( result == ERR_NOT_ENOUGH_RESOURCES || target.store.getUsedCapacity() == 0 )
				creep.memory.target = null;
		} else if (target instanceof Resource ) {
			if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
				creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
			}
		} else if (target instanceof StructureContainer) {
			const result = creep.withdraw(target, RESOURCE_ENERGY);
			if (result == ERR_NOT_IN_RANGE) {
				creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
			}
			else if (result == ERR_NOT_ENOUGH_RESOURCES) {
				creep.memory.target = null;
			}
		}
	}

}

function transferEnergyToSpawnExtensions( creep )
{
	// if we have no targets to transfer to, find one
	if ( creep.memory.target == undefined || creep.memory.target == null )
	{
		creep.say('🚧 TSFR')
		// Find the nearest structure that needs resources
		var targets = creep.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (
					( ( structure.structureType == STRUCTURE_EXTENSION ||
					structure.structureType == STRUCTURE_SPAWN ||
					structure.structureType == STRUCTURE_TOWER ) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 )
					/* ||
					( ( structure.structureType == STRUCTURE_STORAGE ||
					structure.structureType == STRUCTURE_CONTAINER ) &&
					( _.sum(structure.store) < structure.storeCapacity) ) */
				);
			}
		});
	
		const target = creep.pos.findClosestByPath(targets);
	
		// If a target is found, transfer the resources
		if (target) {
			if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
				creep.say("transfer!");
				creep.memory.target = target.id;
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
	
				// try to target this builder
				// if another transferer is targeting this builder, find another target
				for (let i = 0; i < builders.length; i++ ) {
					if (creep.memory.target == builders[i].id) {
						continue;
					}
				}
	
				if (creep.transfer(builder, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.travelTo(builder, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
					creep.say("trying to move");
					creep.memory.target = builder.id;
				}
			}
			else
				console.log('Transferer ' + creep.name + ' is looking for a target to transfer to.')
		}
		
	}
	// we have a target
	else
	{

		// Find the nearest structure that needs resources
		var targets = creep.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (
					( ( structure.structureType == STRUCTURE_EXTENSION ||
					structure.structureType == STRUCTURE_SPAWN ||
					structure.structureType == STRUCTURE_TOWER ) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 )
					/* ||
					( ( structure.structureType == STRUCTURE_STORAGE ||
					structure.structureType == STRUCTURE_CONTAINER ) &&
					( _.sum(structure.store) < structure.storeCapacity) ) */
				);
			}
		});

		if (targets)
		{
			const target = creep.pos.findClosestByPath(targets);
			if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
				creep.say("transfer!");
				creep.memory.target = target.id;
			}
		}

		var target = Game.getObjectById(creep.memory.target);
		if ( target == null ) 
		{
			creep.memory.target = null;
			return;
		}

		const result = creep.transfer(target, RESOURCE_ENERGY);

		// If a target is found, transfer the resources
		if (result == ERR_NOT_IN_RANGE) {
			creep.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
		}
		else if (result == ERR_FULL)
			creep.memory.target = null;
	}

}

const roleTransferer = {
	run: function(creep) {

		// If the creep is not picking up, set it to true
		if ( creep.memory.pickingUp == undefined ) {
			creep.memory.pickingUp = true;
		}

		// If the creep has inventory slots left, and is in the process of picking up more energy
		if ( creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && creep.memory.pickingUp == true ) 
		{
			pickUpEnergy(creep);
		}
		// if the creep has energy in its inventory, and bypassed all the other checks, means that is it full
		else if ( creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.pickingUp == false )
		{
			transferEnergyToSpawnExtensions(creep);
		}
		// if the creep has no energy in its inventory, and it is not picking up yet, go pick up
		else if ( creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0 && creep.memory.pickingUp == false )
		{
			creep.memory.pickingUp = true;
			// remove resources target from memory
			creep.memory.target = null;
			pickUpEnergy(creep);
		}
		// if the creep has max energy in its inventory, and it is still picking up, go transfer
		else if ( creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && creep.memory.pickingUp == true )
		{
			creep.memory.pickingUp = false;
			// remove resources target from memory
			creep.memory.target = null;
			transferEnergyToSpawnExtensions(creep);
		}
		else
		{
			console.log('Transferer: ' + creep.name + ' has an error')
		}
	}
};

// Export the transferer role
module.exports = roleTransferer;