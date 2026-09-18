#pragma once

#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "ObitrendAnimationBlueprintInterface.generated.h"

UINTERFACE(BlueprintType)
class OBITRENDFOOTBALLWORLD27_API UObitrendAnimationBlueprintInterface : public UInterface
{
    GENERATED_BODY()
};

class OBITRENDFOOTBALLWORLD27_API IObitrendAnimationBlueprintInterface
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, BlueprintNativeEvent, Category="Football|Animation")
    void SetFootballAnimationState(
        EObitrendPlayerAnimationState State,
        float Speed,
        float Direction,
        bool bHasBall);
};