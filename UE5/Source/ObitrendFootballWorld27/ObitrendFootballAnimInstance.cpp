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
        LocomotionBlend = 0.0f;
        DirectionBlend = 0.0f;
        StartStopBlend = 0.0f;
        bMoving = false;
        bActionActive = false;
        bSprint = false;
        bStrafeLeft = false;
        bStrafeRight = false;
        bTurning = false;
        AnimationState = 0;
        LocomotionMode = EObitrendLocomotionMode::Idle;
        PreviousSpeed = 0.0f;
        return;
    }

    const UObitrendAnimationRuntimeComponent* Runtime = Player->AnimationRuntime;

    Speed = Runtime->MovementSpeed;
    SpeedNormalized = Runtime->SpeedNormalized;
    Direction = Runtime->MovementDirection;
    TurnAmount = Runtime->TurnAmount;
    bMoving = Runtime->bMoving;
    bActionActive = Runtime->bActionActive;

    bSprint = Speed >= 520.0f;
    bStrafeLeft = bMoving && Direction < -20.0f;
    bStrafeRight = bMoving && Direction > 20.0f;
    bTurning = bMoving && FMath::Abs(TurnAmount) > 0.12f;

    if (Speed < 20.0f)
        LocomotionMode = EObitrendLocomotionMode::Idle;
    else if (Speed < 260.0f)
        LocomotionMode = EObitrendLocomotionMode::Walk;
    else if (Speed < 520.0f)
        LocomotionMode = EObitrendLocomotionMode::Run;
    else
        LocomotionMode = EObitrendLocomotionMode::Sprint;

    LocomotionBlend = FMath::Clamp(Speed / 720.0f, 0.0f, 1.0f);
    DirectionBlend = FMath::Clamp(Direction / 90.0f, -1.0f, 1.0f);

    const float SpeedDelta = Speed - PreviousSpeed;
    StartStopBlend = FMath::Clamp(SpeedDelta / 180.0f, -1.0f, 1.0f);
    PreviousSpeed = Speed;

    AnimationState =
        static_cast<uint8>(Runtime->GetAnimationState());
}

void UObitrendFootballAnimInstance::NativeUpdateAnimation(float DeltaSeconds)
{
    Super::NativeUpdateAnimation(DeltaSeconds);
    RefreshFootballAnimationData();
}