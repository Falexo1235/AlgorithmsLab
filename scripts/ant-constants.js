export const Constants = {
        TSP: {
        MaxIterations: 10000,
        MaxWithoutImprovement: 200,
        InitialPheromone: 0.2,
        Alpha: 1,                   Beta: 4,                  PathLengthConst: 10,
        PheromoneConst: 10,
        RemainingPheromones: 0.6,
        TownRadius: 7,
        MaxCities: 50
    },
    
        Colony: {
        AntStepLength: 1.5,
        FirstStepLength: 2,
        AntsRadius: 4,
        RadiusOfAntsEyes: 30,
        PheromonesRadius: 3,
        MinPheromoneValue: 0.000001,
        MinPheromoneValueForDrawing: 300,
        MinDistanceToAnthill: 1,
        PheromonesDecreasingCoefficient: 0.985,
        HowOftenToRedrawPheromones: 5,
        HowOftenToUpdateDirection: 5,
        HowOftenToLeavePheromones: 3,
        HowOftenToChooseGoodPath: 0.98,
        ConstForDistanceFromHome: 1500,
        PheromoneImportanceFactor: 3.0,
        ReturnPathPreference: 2.5,
        MapPixelScale: 10,
        MapPheromoneScale: 10
    }
}; 