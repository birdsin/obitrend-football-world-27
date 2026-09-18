#include "ObitrendFootballGameMode.h"

#include "ObitrendStadiumPrototype.h"
#include "ObitrendCinematicCamera.h"
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

    AObitrendCinematicCamera* Camera = World->SpawnActor<AObitrendCinematicCamera>(
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