#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "ObitrendAnimationBlueprintBridge.generated.h"

UCLASS(BlueprintType, Blueprintable)
class OBITRENDFOOTBALLWORLD27_API UObitrendAnimationBlueprintBridge : public UObject
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category="Football|Animation")
    void UpdateFromPlayer(class UObitrendPlayerAnimationStateComponent* PlayerState);

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float Speed = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float Direction = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float SpeedNormalized = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bMoving = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bBallAction = false;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    FName StateName = TEXT("Idle");
};