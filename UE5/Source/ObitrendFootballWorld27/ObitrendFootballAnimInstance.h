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

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Animation|Assets")
    TObjectPtr<class UObitrendPlayerAnimationProfile> AnimationProfile;

    UFUNCTION(BlueprintCallable, Category="Football|Animation|Assets")
    void SetAnimationProfile(UObitrendPlayerAnimationProfile* InProfile) { AnimationProfile = InProfile; }

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UBlendSpace* GetLocomotionBlendSpace() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UBlendSpace* GetStrafeBlendSpace() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetIdleAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetWalkAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetRunAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetSprintAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetTurnAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetReceiveAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetDribbleAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetPassAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetShootAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetTackleAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation|Assets")
    class UAnimSequence* GetGoalkeeperSaveAnimation() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation")
    bool IsLocomotionState() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation")
    bool IsBallActionState() const;

    UFUNCTION(BlueprintPure, Category="Football|Animation")
    float GetStartStopBlend() const { return StartStopBlend; }

    UFUNCTION(BlueprintPure, Category="Football|Animation")
    float GetDirectionBlend() const { return DirectionBlend; }

    UFUNCTION(BlueprintPure, Category="Football|Animation")
    float GetTurnAmount() const { return TurnAmount; }

protected:
    virtual void NativeUpdateAnimation(float DeltaSeconds) override;

private:
    EObitrendLocomotionMode LocomotionMode = EObitrendLocomotionMode::Idle;
    float PreviousSpeed = 0.0f;
};