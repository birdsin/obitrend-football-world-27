#include "ObitrendFootballGameMode.h"

#include "ObitrendStadiumPrototype.h"
#include "ObitrendCinematicCamera.h"
#include "ObitrendMatchPlayerSpawner.h"
#include "ObitrendMatchAIController.h"
#include "FootballBallActor.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"

AObitrendFootballGameMode::AObitrendFootballGameMode()
{
    PrimaryActorTick.bCanEverTick = false;
    DefaultPawnClass = nullptr;
}

void AObitrendFootballGameMode::BeginPlay()
{
    Super::BeginPlay();

    UWorld* World = GetWorld();
    if (!World) return;

    World->SpawnActor<AObitrendStadiumPrototype>(
        AObitrendStadiumPrototype::StaticClass(),
        FVector::ZeroVector,
        FRotator::ZeroRotator);

    AObitrendMatchPlayerSpawner* Spawner =
        World->SpawnActor<AObitrendMatchPlayerSpawner>(
            AObitrendMatchPlayerSpawner::StaticClass(),
            FVector::ZeroVector,
            FRotator::ZeroRotator);

    if (Spawner)
    {
        Spawner->PlayerClass = AObitrendRealisticPlayer::StaticClass();
        Spawner->SpawnStartingXI();
    }

    AFootballBallActor* Ball =
        World->SpawnActor<AFootballBallActor>(
            AFootballBallActor::StaticClass(),
            FVector(0.0f, 0.0f, 35.0f),
            FRotator::ZeroRotator);

    AObitrendMatchAIController* MatchAI =
        World->SpawnActor<AObitrendMatchAIController>(
            AObitrendMatchAIController::StaticClass(),
            FVector::ZeroVector,
            FRotator::ZeroRotator);

    if (MatchAI)
    {
        MatchAI->InitializeMatchAI(Spawner, Ball);
    }

    AObitrendCinematicCamera* Camera =
        World->SpawnActor<AObitrendCinematicCamera>(
            AObitrendCinematicCamera::StaticClass(),
            FVector::ZeroVector,
            FRotator::ZeroRotator);

    if (Camera)
    {
        if (APlayerController* PC = World->GetFirstPlayerController())
        {
            PC->SetViewTarget(Camera);
        }
    }
}