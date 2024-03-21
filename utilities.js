const bodypartCost = (bodypart) => {
    switch (bodypart) {
        case MOVE:
            return 50;
        case WORK:
            return 100;
        case CARRY:
            return 50;
        case ATTACK:
            return 80;
        case RANGED_ATTACK:
            return 150;
        case HEAL:
            return 250;
        case CLAIM:
            return 600;
        case TOUGH:
            return 10;
        default:
            Log.error('bodypartCost undefined bodypart ' + bodypart);
            return 9999
    }
};

module.exports.Helpers = {
    // smthByParam
    objectByParam: (objectParam, withLogIfNotFound = false) => {
        let objectById;
        const object =
            (objectParam instanceof Object && objectParam) ||
            ((objectById = Game.getObjectById(objectParam)) && objectById instanceof Object && objectById);

        if (withLogIfNotFound && !object) {
            Log.error('Unable to find object by param=' + objectParam)
        }
            
        return object ? object : null
    },
    roomByParam: (roomParam, withLogIfNotFound = false) => {
        let roomById, roomByName;
        const room =
            (roomParam instanceof Room && roomParam) ||
            ((roomById = Game.getObjectById(roomParam)) && roomById instanceof Room && roomById) ||
            ((roomByName = Game.rooms[roomParam]) && roomByName);

        if (withLogIfNotFound && !room) {
            Log.error('Unable to find room by param=' + roomParam)
        }
            
        return room ? room : null
    },
    sourceByParam: (sourceParam, withLogIfNotFound = false) => {
        let sourceById;
        const source =
            (sourceParam instanceof Source && sourceParam) ||
            ((sourceById = Game.getObjectById(sourceParam)) && sourceById instanceof Source && sourceById);

        if (withLogIfNotFound && !source) {
            Log.error('Unable to find source by param=' + sourceParam)
        }
            
        return source ? source : null
    },
    spawnByParam: (spawnParam, withLogIfNotFound = false) => {
        let spawnById, spawnByName;
        const spawn =
            (spawnParam instanceof StructureSpawn && spawnParam) ||
            ((spawnById = Game.getObjectById(spawnParam)) && spawnById.structureType === STRUCTURE_SPAWN && spawnById) ||
            ((spawnByName = Game.spawns[spawnParam]) && spawnByName);

        if (withLogIfNotFound && !spawn) {
            Log.error('Unable to find spawn by param=' + spawnParam)
        }
            
        return spawn ? spawn : null
    },
    creepByParam: (creepParam, withLogIfNotFound = false) => {
        let creepById, creepByName;
        const creep =
            (creepParam instanceof Creep && creepParam) ||
            ((creepById = Game.getObjectById(creepParam)) && creepById instanceof Creep && creepById) ||
            ((creepByName = Game.creeps[creepParam]) && creepByName);

        if (withLogIfNotFound && !creep) {
            Log.error('Unable to find creep by param=' + creepParam)
        }
            
        return creep ? creep : null
    },
    structureByParam: (structureParam, withLogIfNotFound = false) => {
        let structureById, structureByName;
        const structure =
            (structureParam instanceof Structure && structureParam) ||
            ((structureById = Game.getObjectById(structureParam)) && structureById instanceof Structure && structureById) ||
            ((structureByName = Game.creeps[structureParam]) && structureByName);

        if (withLogIfNotFound && !structure) {
            Log.error('Unable to find structure by param=' + structureParam)
        }
            
        return structure ? structure : null
    },
    controllerByParam: (controllerParam, withLogIfNotFound = false) => {
        let controllerById;
        const controller =
            (controllerParam instanceof StructureController && controllerParam) ||
            ((controllerById = Game.getObjectById(controllerParam)) && controllerById instanceof StructureController && controllerById);

        if (withLogIfNotFound && !controller) {
            Log.error('Unable to find controller by param=' + controllerParam)
        }
            
        return controller ? controller : null
    },
    constructionSiteByParam: (constructionSiteParam, withLogIfNotFound = false) => {
        let constructionSiteById;
        const constructionSite =
            (constructionSiteParam instanceof ConstructionSite && constructionSiteParam) ||
            ((constructionSiteById = Game.getObjectById(constructionSiteParam)) && constructionSiteById instanceof ConstructionSite && constructionSiteById);

        if (withLogIfNotFound && !constructionSite) {
            Log.error('Unable to find construction site by param=' + constructionSiteParam)
        }
            
        return constructionSite ? constructionSite : null
    },
    
    
    findClosest: (fromObject, toObjects) => {
        if (toObjects.length === 0) {
            return null
        }
        
        if (toObjects.length === 1) {
            return toObjects[0]
        }
        
        // TODO Change to findClosestByRange for CPU-save mode
        return fromObject.pos.findClosestByPath(toObjects)
    },


    findClosestByRange: (fromObject, toObjects) => {
        if (toObjects.length === 0) {
            return null
        }

        if (toObjects.length === 1) {
            return toObjects[0]
        }

        // TODO Change to findClosestByRange for CPU-save mode
        return fromObject.pos.findClosestByRange(toObjects)
    },

    chooseBodyparts: (energyCapacityAvailable, optimalBodyparts) => {
        if (!optimalBodyparts) {
            optimalBodyparts = [WORK, CARRY, MOVE];
        }

        let energyCapacityNeeded = _.sum(optimalBodyparts, (bodypart) => bodypartCost(bodypart));

        if (energyCapacityNeeded <= energyCapacityAvailable) {
            return optimalBodyparts;
        }

        let coef =  energyCapacityAvailable / energyCapacityNeeded

        let bodypartsCount = _.reduce(
            optimalBodyparts,
            (result, bodypart) => {
                result[bodypart] = result[bodypart] || 0
                result[bodypart]++

                return result
            },
            {}
        )

        bodypartsCount = _.reduce(
            bodypartsCount,
            (result, count, bodypart) => {
                result[bodypart] = _.max([_.floor(count * coef), 1])
                return result
            },
            {}
        )

        return _.reduce(
            bodypartsCount,
            (result, count, bodypart) => {
                return [...result, ..._.times(count, () => bodypart)]
            },
            []
        )
    },

    // Find dropped resources with more energy and pick it up
    findDroppedResources: (creep) => {
        const droppedSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (resource) => resource.amount > 50
        });

        if (droppedSource) {
            if (creep.pickup(droppedSource) == ERR_NOT_IN_RANGE) {
                creep.memory.target = droppedSource.id;
                creep.travelTo(droppedSource, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 5});
            }
        }
    },

    // Set target for the creep
    setTarget: (creep, target) => {
        creep.memory.target = target.id;
    },

    // Clear target for the creep
    clearTarget: (creep) => {
        creep.memory.target = null;
    },

    // Check if the creep has a target
    hasTarget: (creep) => {
        return creep.memory.target !== null;
    },

    // Check if the creep is close to the target
    isCloseToTarget: (creep, target) => {
        return creep.pos.isNearTo(target);
    },

    // Define what type of actions can be taken at the target
    actionAtTarget: (creep, target) => {
        if (target instanceof Tombstone || target instanceof Ruin) {
            return 'withdraw';
        } else if (target instanceof Resource) {
            return 'pickup';
        } else if (target instanceof Source) {
            return 'harvest';
        }
        else {
            return 'transfer';
        }
    },
};