#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimInstance.h"
#include "ObitrendFootballAnimInstance.generated.h"

UCLASS(Blueprintable)
class OBITRENDFOOTBALLWORLD27_API UObitrendFootballAnimInstance : public UAnimInstance
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category="Football|Animation")
    void RefreshFootballAnimationData();

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float Speed = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float SpeedNormalized = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float Direction = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float TurnAmount = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bMoving = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bActionActive = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    TEnumAsByte<uint8> AnimationState = 0;

protected:
    virtual void NativeUpdateAnimation(float DeltaSeconds) override;
};