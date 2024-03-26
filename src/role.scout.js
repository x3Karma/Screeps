// this guy just runs around and try to enter as many rooms as possible

const roleScout = {
    run: function(creep) 
    {
        if ( creep.memory.target == null || creep.memory.target == undefined )
        {
            // find nearest exit
            const exits = Game.map.describeExits(creep.room.name);
            const randomExit = _.sample(Object.values(exits));
            const exit = creep.room.findExitTo(randomExit);
            console.log("scout found exit: " + exit );
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
            creep.memory.target = randomExit;
        }
        else
        {
            if ( creep.memory.target == creep.room.name )
                creep.memory.target == null;
            // move to target
            creep.moveTo(creep.memory.target);
        }
    }
}

export default roleScout;