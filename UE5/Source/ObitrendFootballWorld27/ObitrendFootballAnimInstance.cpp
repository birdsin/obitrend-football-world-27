#include "ObitrendFootballAnimInstance.h"

#include "ObitrendRealisticPlayer.h"
#include "ObitrendAnimationRuntimeComponent.h"

void UObitrendFootballAnimInstance::RefreshFootballAnimationData()
{
    AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(TryGetPawnOwner());
    if (!Player || !Player->AnimationRuntime)
    {
        Speed = 0.0f;
        SpeedNormalized = 0.0f;
        Direction = 0.0f;
        TurnAmount = 0.0f;
        bMoving = false;
        bActionActive = false;
        AnimationState = 0;
        return;
    }

    const UObitrendAnimationRuntimeComponent* Runtime = Player->AnimationRuntime;

    Speed = Runtime->MovementSpeed;
    SpeedNormalized = Runtime->SpeedNormalized;
    Direction = Runtime->MovementDirection;
    TurnAmount = Runtime->TurnAmount;
    bMoving = Runtime->bMoving;
    bActionActive = Runtime->bActionActive;
    AnimationState =
        static_cast<uint8>(Runtime->GetAnimationState());
}

void UObitrendFootballAnimInstance::NativeUpdateAnimation(float DeltaSeconds)
{
    Super::NativeUpdateAnimation(DeltaSeconds);
    RefreshFootballAnimationData();
}