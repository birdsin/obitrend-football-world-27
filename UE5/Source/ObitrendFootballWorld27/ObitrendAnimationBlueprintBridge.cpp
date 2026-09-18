#include "ObitrendAnimationBlueprintBridge.h"

#include "ObitrendPlayerAnimationStateComponent.h"
#include "GameFramework/Actor.h"

void UObitrendAnimationBlueprintBridge::UpdateFromPlayer(
    UObitrendPlayerAnimationStateComponent* PlayerState)
{
    if (!PlayerState || !PlayerState->GetOwner()) return;

    AActor* Owner = PlayerState->GetOwner();
    const FVector Velocity = Owner->GetVelocity();
    Speed = Velocity.Size2D();
    SpeedNormalized = FMath::Clamp(Speed / 720.0f, 0.0f, 1.0f);
    bMoving = Speed > 20.0f;

    if (bMoving)
    {
        const FVector DirectionVector = Velocity.GetSafeNormal2D();
        const FVector Forward = Owner->GetActorForwardVector();
        const FVector Right = Owner->GetActorRightVector();

        Direction = FMath::RadiansToDegrees(
            FMath::Atan2(
                FVector::DotProduct(DirectionVector, Right),
                FVector::DotProduct(DirectionVector, Forward)));
    }
    else
    {
        Direction = 0.0f;
    }

    const EObitrendPlayerAnimationState State =
        PlayerState->GetAnimationState();

    bBallAction =
        State == EObitrendPlayerAnimationState::Receive ||
        State == EObitrendPlayerAnimationState::Dribble ||
        State == EObitrendPlayerAnimationState::Pass ||
        State == EObitrendPlayerAnimationState::Shoot;

    switch (State)
    {
        case EObitrendPlayerAnimationState::Walk:
            StateName = TEXT("Walk"); break;
        case EObitrendPlayerAnimationState::Run:
            StateName = TEXT("Run"); break;
        case EObitrendPlayerAnimationState::Sprint:
            StateName = TEXT("Sprint"); break;
        case EObitrendPlayerAnimationState::Turn:
            StateName = TEXT("Turn"); break;
        case EObitrendPlayerAnimationState::Receive:
            StateName = TEXT("Receive"); break;
        case EObitrendPlayerAnimationState::Dribble:
            StateName = TEXT("Dribble"); break;
        case EObitrendPlayerAnimationState::Pass:
            StateName = TEXT("Pass"); break;
        case EObitrendPlayerAnimationState::Shoot:
            StateName = TEXT("Shoot"); break;
        default:
            StateName = TEXT("Idle"); break;
    }
}