#include "ObitrendGoalkeeperInteractionComponent.h"

#include "Components/PrimitiveComponent.h"
#include "GameFramework/Actor.h"

UObitrendGoalkeeperInteractionComponent::UObitrendGoalkeeperInteractionComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

bool UObitrendGoalkeeperInteractionComponent::CanSave(
    AActor* BallActor,
    const FVector& GoalCenter) const
{
    if (!IsValid(BallActor) || !IsValid(GetOwner())) return false;

    const FVector Goalkeeper = GetOwner()->GetActorLocation();
    const FVector Ball = BallActor->GetActorLocation();

    const float GoalDistance =
        FVector::Dist2D(Goalkeeper, GoalCenter);

    const float BallDistance =
        FVector::Dist(Goalkeeper, Ball);

    return GoalDistance <= ReachRadius &&
           BallDistance <= ReachRadius * 1.8f;
}

bool UObitrendGoalkeeperInteractionComponent::SaveBall(
    AActor* BallActor,
    const FVector& GoalCenter)
{
    if (!CanSave(BallActor, GoalCenter)) return false;

    UPrimitiveComponent* BallPrimitive =
        Cast<UPrimitiveComponent>(BallActor->GetRootComponent());

    if (!BallPrimitive) return false;

    const FVector Incoming =
        BallPrimitive->GetPhysicsLinearVelocity();

    if (Incoming.IsNearlyZero()) return false;

    const FVector AwayFromGoal =
        (GetOwner()->GetActorLocation() - GoalCenter).GetSafeNormal();

    const FVector ParryDirection =
        (Incoming.GetSafeNormal() * -0.35f +
         AwayFromGoal * 0.65f).GetSafeNormal();

    const float ParrySpeed =
        FMath::Clamp(Incoming.Size() * 0.75f,
                     ParryImpulse,
                     1800.0f);

    BallPrimitive->WakeAllRigidBodies();
    BallPrimitive->SetPhysicsLinearVelocity(
        ParryDirection * ParrySpeed);

    BallPrimitive->AddAngularImpulseInRadians(
        GetOwner()->GetActorRightVector() * 650.0f,
        NAME_None,
        true);

    return true;
}