#include "ObitrendAnimationRuntimeComponent.h"

UObitrendAnimationRuntimeComponent::UObitrendAnimationRuntimeComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

void UObitrendAnimationRuntimeComponent::SetAction(
    EObitrendRuntimeAnimation NewAction)
{
    AnimationState = NewAction;
    bActionActive = true;
}

void UObitrendAnimationRuntimeComponent::ClearAction()
{
    bActionActive = false;

    if (MovementSpeed < 20.0f)
        AnimationState = EObitrendRuntimeAnimation::Idle;
    else if (MovementSpeed < 260.0f)
        AnimationState = EObitrendRuntimeAnimation::Walk;
    else if (MovementSpeed < 520.0f)
        AnimationState = EObitrendRuntimeAnimation::Run;
    else
        AnimationState = EObitrendRuntimeAnimation::Sprint;
}

void UObitrendAnimationRuntimeComponent::UpdateLocomotion(
    float Speed,
    float DirectionDegrees)
{
    const float PreviousDirection = MovementDirection;

    MovementSpeed = FMath::Max(0.0f, Speed);
    MovementDirection = FMath::UnwindDegrees(DirectionDegrees);
    SpeedNormalized = FMath::Clamp(MovementSpeed / 720.0f, 0.0f, 1.0f);
    bMoving = MovementSpeed > 20.0f;

    const float DeltaDirection =
        FMath::FindDeltaAngleDegrees(PreviousDirection, MovementDirection);

    TurnAmount = FMath::Clamp(DeltaDirection / 45.0f, -1.0f, 1.0f);

    if (bActionActive)
        return;

    if (!bMoving)
        AnimationState = EObitrendRuntimeAnimation::Idle;
    else if (MovementSpeed < 260.0f)
        AnimationState = EObitrendRuntimeAnimation::Walk;
    else if (MovementSpeed < 520.0f)
        AnimationState = EObitrendRuntimeAnimation::Run;
    else
        AnimationState = EObitrendRuntimeAnimation::Sprint;
}