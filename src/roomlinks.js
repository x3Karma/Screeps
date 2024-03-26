/*
Goal:
- Save all sources in the room to a global array
- Use this array to determine the best path to a source
- If a ldminer is already mining a source, let other ldminers know that this source is taken
- A ldharvester will be assigned to each miner 
*/

// create a new class called RoomLinks
// this class will be responsible for saving all important memory in a room
class RoomLinks
{
    constructor(room)
    {
        this.room = room;
        this.room.memory.sources = this.room.memory.sources || [];
        this.room.memory.sites = this.room.memory.sites || [];
        this.room.memory.repairer = this.room.memory.repairer || null;
    }

    getSources()
    {
        return this.room.memory.sources;
    }

    addSource(source)
    {
        this.room.memory.sources.push(source);
    }

    getSites()
    {
        return this.room.memory.sites;
    }

    addSite(site)
    {
        this.room.memory.sites.push(site);
    }

    getRepairer()
    {
        return this.room.memory.repairer;
    }

    setRepairer(repairer)
    {
        this.room.memory.repairer = repairer;
    }
}

module.exports = function() 
{
    for ( let roomName in Game.rooms )
    {
        var room = Game.rooms[roomName];

        if ( room.memory.sources == undefined )
            room.memory.sources = [];

        if ( room.memory.sites == undefined )
            room.memory.sites = [];
        
        if ( room.memory.repairer == undefined )
            room.memory.repairer = null;
        
        var spawn = Game.spawns['My First Home'];

        let isHome = ( room == Game.spawns['My First Home'].room ) ? true : false;
        if ( !isHome )
        {
            var creeps = room.find(FIND_MY_CREEPS);
            var sources = room.find(FIND_SOURCES);

            var ldminers = _.filter(creeps,function(creep){ if(creep.memory.role == "ldminer") return true; return false;}).length;
            var ldharvesters = _.filter(creeps,function(creep){ if(creep.memory.role == "ldharvester") return true; return false;}).length;
            var repairers = _.filter(creeps,function(creep){ if(creep.memory.role == "repairer") return true; return false;}).length;

            // console.log( 'ldminers: ' + ldminers + ' ldharvesters: ' + ldharvesters + ' repairers: ' + repairers + ' in ' + roomName)

            for ( let source of sources )
            {
                if ( !room.memory.sources.includes( source.id ) )
                    room.memory.sources.push( source.id );
                else if ( room.memory.sources.includes( source.id ) )
                    continue;
            }

            // if there are sources but no ldminers, spawn one
            /* if ( ( ldminers < sources.length ) && ( globalldminer.length < sources.length ) )
            {
                if ( !( spawn.memory.queue.includes('ldminer') )
                {
                    spawn.pushToQueue( spawn, room, 'ldminer' );
                }
                // assume that a ldminer is on its way
                ldminers++;
            }
            // if there are not an equal amount of ldharvesters to ldminers, spawn one
            if ( ldharvesters != ldminers )
            {
                if ( !( spawn.memory.queue.includes('ldharvester') )
                {
                    spawn.pushToQueue( spawn, room, 'ldharvester' );
                }
            } */
            // if there are no repairers in the current room, or there's no designated repairer in this room, spawn one
            
            
            
        }

        if ( room.memory.repairer == null )
        {
            // check if repairer is in the spawn queue
            if ( !( spawn.memory.queue.includes('repairer') ) )
            {
                spawn.pushToQueue( spawn, room, 'repairer' );
            }
        }
        // if there's a designated repairer, force it to come here
        else if ( room.memory.repairer != null && repairers == 0 )
        {
            const creep = Game.getObjectById( room.memory.repairer );
            console.log( creep )
            // if our repairer died
            if ( creep == null )
            {
                room.memory.repairer = null;
            }
            console.log('no repairers in ' + roomName);
        }
        
        var sites = room.find(FIND_MY_CONSTRUCTION_SITES);
        var repairables = room.find(FIND_STRUCTURES, { filter: (s) => s.hits < s.hitsMax });
        // if no sites are found, clear the array
        if ( sites.length == 0 )
        {
            room.memory.sites = [];
        }
        else if ( sites.length > 0 )
        {
            // if there are construction sites owned by me, save them
            for ( let site of sites )
            {
                room.memory.sites = sites.map( site => site.id );
            }
        }

        // if no repairables are found, clear the array
        if ( repairables.length == 0 )
        {
            room.memory.repairables = [];
        }
        else if ( repairables.length > 0 )
        {
            // if there are repairables owned by me, save them
            for ( let repairable of repairables )
            {
                room.memory.repairables = repairables.map( repairable => repairable.id );
            }
        }
    }

}