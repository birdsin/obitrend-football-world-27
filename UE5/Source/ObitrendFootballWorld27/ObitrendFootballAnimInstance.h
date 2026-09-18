#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimInstance.h"
#include "ObitrendFootballAnimInstance.generated.h"

UENUM(BlueprintType)
enum class EObitrendLocomotionMode : uint8
{
    Idle,
    Walk,
    Run,
    Sprint
};

UCLASS(Blueprintable)
class OBITRENDFOOTBALLWORLD27_API UObitrendFootballAnimInstance : public UAnimInstance
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category="Football|Animation")
    void RefreshFootballAnimationData();

    UFUNCTION(BlueprintPure, Category="Football|Animation")
    EObitrendLocomotionMode GetLocomotionMode() const
    {
        return LocomotionMode;
    }

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float Speed = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float SpeedNormalized = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float Direction = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float TurnAmount = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float LocomotionBlend = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float DirectionBlend = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float StartStopBlend = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bMoving = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bActionActive = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bSprint = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bStrafeLeft = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bStrafeRight = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bTurning = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    TEnumAsByte<uint8> AnimationState = 0;

protected:
    virtual void NativeUpdateAnimation(float DeltaSeconds) override;

private:
    EObitrendLocomotionMode LocomotionMode = EObitrendLocomotionMode::Idle;
    float PreviousSpeed = 0.0f;
};