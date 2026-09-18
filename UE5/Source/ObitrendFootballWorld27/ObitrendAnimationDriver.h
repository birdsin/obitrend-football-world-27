#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "ObitrendAnimationDriver.generated.h"

UCLASS(BlueprintType, Blueprintable)
class OBITRENDFOOTBALLWORLD27_API UObitrendAnimationDriver : public UObject
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category="Football|Animation")
    void UpdateState(class UObitrendPlayerAnimationStateComponent* StateComponent);

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float MovementSpeed = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float MovementDirection = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    float TurnAmount = 0.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Animation")
    bool bHasBallAction = false;
};