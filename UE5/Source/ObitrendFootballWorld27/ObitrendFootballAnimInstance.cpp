#include "ObitrendFootballAnimInstance.h"
#include "ObitrendPlayerAnimationProfile.h"


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

class UBlendSpace;

UBlendSpace* UObitrendFootballAnimInstance::GetLocomotionBlendSpace() const
{
    return AnimationProfile ? AnimationProfile->LocomotionBlendSpace.Get() : nullptr;
}

UBlendSpace* UObitrendFootballAnimInstance::GetStrafeBlendSpace() const
{
    return AnimationProfile ? AnimationProfile->StrafeBlendSpace.Get() : nullptr;
}


UAnimSequence* UObitrendFootballAnimInstance::GetIdleAnimation() const { return AnimationProfile ? AnimationProfile->Idle.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetWalkAnimation() const { return AnimationProfile ? AnimationProfile->Walk.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetRunAnimation() const { return AnimationProfile ? AnimationProfile->Run.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetSprintAnimation() const { return AnimationProfile ? AnimationProfile->Sprint.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetTurnAnimation() const { return AnimationProfile ? AnimationProfile->Turn.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetReceiveAnimation() const { return AnimationProfile ? AnimationProfile->Receive.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetDribbleAnimation() const { return AnimationProfile ? AnimationProfile->Dribble.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetPassAnimation() const { return AnimationProfile ? AnimationProfile->Pass.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetShootAnimation() const { return AnimationProfile ? AnimationProfile->Shoot.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetTackleAnimation() const { return AnimationProfile ? AnimationProfile->Tackle.Get() : nullptr; }
UAnimSequence* UObitrendFootballAnimInstance::GetGoalkeeperSaveAnimation() const { return AnimationProfile ? AnimationProfile->GoalkeeperSave.Get() : nullptr; }
