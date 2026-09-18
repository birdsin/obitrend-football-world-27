#include "ObitrendMatchSceneDirector.h"

AObitrendMatchSceneDirector::AObitrendMatchSceneDirector()
{
    PrimaryActorTick.bCanEverTick = true;
}

void AObitrendMatchSceneDirector::StartMatchScene()
{
    MatchSeconds = 0.0f;
    bMatchRunning = true;
}

void AObitrendMatchSceneDirector::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    if (!bMatchRunning) return;

    MatchSeconds += DeltaSeconds * FMath::Max(0.0f, MatchSpeed);

    // Keep the prototype match clock bounded to regulation time.
    if (MatchSeconds >= 90.0f * 60.0f)
    {
        MatchSeconds = 90.0f * 60.0f;
        bMatchRunning = false;
    }
}