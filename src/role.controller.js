const roleController = {
    // find the nearest roomController that is claimable, preferably rooms with my remote harvesters in them
    run: function( creep )
    {
        /* if ( creep.memory.target == null || creep.memory.target == undefined )
		{
			for ( let roomName in Game.rooms )
			{
				var room = Game.rooms[roomName];
				if ( room.controller && room.controller.my == false )
				{
					if ( room.controller.reservation == undefined )
					{
                        if ( room.find(FIND_MY_CREEPS, { filter: (c) => c.memory.role == 'ldminer' }).length > 0) {
                            creep.travelTo(room.controller);
                            creep.say('Claiming!');
                            creep.claimController(room.controller);
                            break;
                        }
					}
				}
                console.log("No target found for " + creep.name + " in room " + roomName + ".");
			}
		}
		else
		{
			if ( creep.memory.target instanceof StructureController )
			{
				if ( creep.claimController(creep.memory.target) == ERR_NOT_IN_RANGE )
					creep.travelTo(creep.memory.target);
			}
		} */

        if ( creep.claimController(Game.getObjectById('7f3b077240eef72')) == ERR_NOT_IN_RANGE )
        {
					creep.travelTo(Game.getObjectById('7f3b077240eef72'));
		}
    }
}

export default roleController;