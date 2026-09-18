#include "ObitrendAIBallDecisionComponent.h"

#include "GameFramework/Actor.h"

UObitrendAIBallDecisionComponent::UObitrendAIBallDecisionComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

EObitrendBallDecision UObitrendAIBallDecisionComponent::Evaluate(
    const FVector& BallLocation,
    const FVector& GoalLocation,
    const TArray<AActor*>& Teammates,
    const TArray<AActor*>& Opponents,
    bool bIsUnderPressure)
{
    PassTarget.Reset();

    const AActor* Owner = GetOwner();
    if (!Owner)
    {
        LastDecision = EObitrendBallDecision::None;
        return LastDecision;
    }

    const FVector OwnerLocation = Owner->GetActorLocation();
    const FVector ToGoal = GoalLocation - BallLocation;
    const float GoalDistance = ToGoal.Size2D();

    FVector GoalDirection = ToGoal.GetSafeNormal2D();
    if (GoalDirection.IsNearlyZero())
    {
        GoalDirection = Owner->GetActorForwardVector().GetSafeNormal2D();
    }

    float BestPassScore = -BIG_NUMBER;
    AActor* BestTarget = nullptr;

    for (AActor* Teammate : Teammates)
    {
        if (!IsValid(Teammate) || Teammate == Owner)
        {
            continue;
        }

        const FVector ToMate = Teammate->GetActorLocation() - BallLocation;
        const float Distance = ToMate.Size2D();

        if (Distance > PassingRange || Distance < 250.0f)
        {
            continue;
        }

        const FVector MateDirection = ToMate.GetSafeNormal2D();
        const float ForwardValue = FVector::DotProduct(MateDirection, GoalDirection);

        float NearestOpponentDistance = BIG_NUMBER;
        for (AActor* Opponent : Opponents)
        {
            if (!IsValid(Opponent)) continue;

            NearestOpponentDistance = FMath::Min(
                NearestOpponentDistance,
                FVector::Dist2D(
                    Teammate->GetActorLocation(),
                    Opponent->GetActorLocation()));
        }

        const float SpaceScore =
            FMath::Clamp(NearestOpponentDistance / 1800.0f, 0.0f, 1.0f);

        const float DistanceScore =
            1.0f - FMath::Clamp(Distance / PassingRange, 0.0f, 1.0f);

        const float Score =
            ForwardValue * 0.45f +
            SpaceScore * 0.40f +
            DistanceScore * 0.15f;

        if (Score > BestPassScore)
        {
            BestPassScore = Score;
            BestTarget = Teammate;
        }
    }

    if (bIsUnderPressure)
    {
        if (BestTarget)
        {
            PassTarget = BestTarget;
            LastDecision = EObitrendBallDecision::Pass;
        }
        else
        {
            LastDecision = EObitrendBallDecision::Clear;
        }

        return LastDecision;
    }

    const float FacingGoal =
        FVector::DotProduct(
            Owner->GetActorForwardVector().GetSafeNormal2D(),
            GoalDirection);

    if (GoalDistance <= ShootingRange && FacingGoal >= ShootingAngleCos)
    {
        LastDecision = EObitrendBallDecision::Shoot;
        return LastDecision;
    }

    if (BestTarget && BestPassScore >= 0.25f)
    {
        PassTarget = BestTarget;
        LastDecision =
            BestPassScore >= 0.58f
            ? EObitrendBallDecision::ThroughPass
            : EObitrendBallDecision::Pass;
        return LastDecision;
    }

    LastDecision = EObitrendBallDecision::Carry;
    return LastDecision;
}