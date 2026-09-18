#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendBallActionExecutor.generated.h"

class AFootballBallActor;

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendBallActionExecutor : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendBallActionExecutor();

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool FirstTouch(AFootballBallActor* Ball, const FVector& DesiredDirection, float ControlStrength = 0.55f);

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool Dribble(AFootballBallActor* Ball, const FVector& Direction, float Speed = 650.0f);

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool Pass(AFootballBallActor* Ball, const FVector& TargetLocation, float Power = 1100.0f);

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool Shoot(AFootballBallActor* Ball, const FVector& GoalLocation, float Power = 2200.0f, float Lift = 180.0f);

    UFUNCTION(BlueprintCallable, Category="Football|Ball")
    bool Tackle(AFootballBallActor* Ball, const FVector& Direction, float Power = 900.0f);

private:
    bool IsUsableBall(AFootballBallActor* Ball) const;
};