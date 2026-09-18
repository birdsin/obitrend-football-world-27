#include "ObitrendFootballAIComponent.h"

#include "GameFramework/Actor.h"

UObitrendFootballAIComponent::UObitrendFootballAIComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

void UObitrendFootballAIComponent::UpdateDecision(
    AActor* BallActor,
    bool bTeamHasBall)
{
    if (!GetOwner() || !BallActor)
    {
        Decision = EObitrendAIDecision::HoldPosition;
        return;
    }

    const FVector OwnerLocation = GetOwner()->GetActorLocation();
    const FVector BallLocation = BallActor->GetActorLocation();
    const float DistanceToBall =
        FVector::Dist2D(OwnerLocation, BallLocation);

    if (DistanceToBall > RecoveryDistance)
    {
        Decision = EObitrendAIDecision::Recover;
        return;
    }

    if (bTeamHasBall)
    {
        if (DistanceToBall <= BallAwarenessRadius)
        {
            Decision = EObitrendAIDecision::Support;
        }
        else
        {
            Decision = EObitrendAIDecision::AttackSpace;
        }

        return;
    }

    if (DistanceToBall <= PressDistance)
    {
        Decision = EObitrendAIDecision::Press;
    }
    else if (DistanceToBall <= BallAwarenessRadius)
    {
        Decision = EObitrendAIDecision::DefendSpace;
    }
    else
    {
        Decision = EObitrendAIDecision::HoldPosition;
    }
}