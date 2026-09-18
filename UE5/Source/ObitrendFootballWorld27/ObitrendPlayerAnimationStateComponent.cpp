#include "ObitrendPlayerAnimationStateComponent.h"

#include "GameFramework/Actor.h"

UObitrendPlayerAnimationStateComponent::UObitrendPlayerAnimationStateComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void UObitrendPlayerAnimationStateComponent::SetBallAction(
    EObitrendPlayerAnimationState Action)
{
    BallAction = Action;
    AnimationState = Action;
}

void UObitrendPlayerAnimationStateComponent::ClearBallAction()
{
    BallAction = EObitrendPlayerAnimationState::Idle;
}

float UObitrendPlayerAnimationStateComponent::GetLocomotionSpeed() const
{
    if (!GetOwner()) return 0.0f;
    return GetOwner()->GetVelocity().Size2D();
}

void UObitrendPlayerAnimationStateComponent::TickComponent(
    float DeltaTime,
    ELevelTick TickType,
    FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    if (BallAction != EObitrendPlayerAnimationState::Idle)
    {
        AnimationState = BallAction;
        return;
    }

    const float Speed = GetLocomotionSpeed();

    if (Speed < 20.0f)
    {
        AnimationState = EObitrendPlayerAnimationState::Idle;
    }
    else if (Speed < 260.0f)
    {
        AnimationState = EObitrendPlayerAnimationState::Walk;
    }
    else if (Speed < 520.0f)
    {
        AnimationState = EObitrendPlayerAnimationState::Run;
    }
    else
    {
        AnimationState = EObitrendPlayerAnimationState::Sprint;
    }
}