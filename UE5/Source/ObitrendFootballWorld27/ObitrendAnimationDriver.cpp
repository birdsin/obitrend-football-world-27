#include "ObitrendAnimationDriver.h"

#include "ObitrendPlayerAnimationStateComponent.h"
#include "GameFramework/Actor.h"

void UObitrendAnimationDriver::UpdateState(
    UObitrendPlayerAnimationStateComponent* StateComponent)
{
    if (!StateComponent || !StateComponent->GetOwner()) return;

    AActor* Owner = StateComponent->GetOwner();
    const FVector Velocity = Owner->GetVelocity();
    MovementSpeed = Velocity.Size2D();

    const FVector Forward = Owner->GetActorForwardVector();
    const FVector Right = Owner->GetActorRightVector();
    const FVector FlatVelocity = FVector(Velocity.X, Velocity.Y, 0.0f);

    if (!FlatVelocity.IsNearlyZero())
    {
        MovementDirection = FMath::RadiansToDegrees(
            FMath::Atan2(
                FVector::DotProduct(FlatVelocity.GetSafeNormal(), Right),
                FVector::DotProduct(FlatVelocity.GetSafeNormal(), Forward)));
    }
    else
    {
        MovementDirection = 0.0f;
    }

    bHasBallAction =
        StateComponent->GetAnimationState() ==
            EObitrendPlayerAnimationState::Receive ||
        StateComponent->GetAnimationState() ==
            EObitrendPlayerAnimationState::Dribble ||
        StateComponent->GetAnimationState() ==
            EObitrendPlayerAnimationState::Pass ||
        StateComponent->GetAnimationState() ==
            EObitrendPlayerAnimationState::Shoot;
}