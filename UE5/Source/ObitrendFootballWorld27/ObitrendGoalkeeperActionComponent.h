#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendGoalkeeperActionComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendGoalkeeperAction : uint8
{
    Ready,
    Catch,
    Parry,
    DiveLeft,
    DiveRight,
    Punch
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendGoalkeeperActionComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendGoalkeeperActionComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Goalkeeper")
    EObitrendGoalkeeperAction EvaluateSave(
        AActor* BallActor,
        const FVector& GoalCenter,
        float GoalWidth = 732.0f);

    UFUNCTION(BlueprintCallable, Category="Football|Goalkeeper")
    bool ExecuteSave(
        AActor* BallActor,
        EObitrendGoalkeeperAction Action);

    UFUNCTION(BlueprintPure, Category="Football|Goalkeeper")
    EObitrendGoalkeeperAction GetLastAction() const { return LastAction; }

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Goalkeeper")
    float ReactionRadius = 1800.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Goalkeeper")
    float CatchSpeedLimit = 900.0f;

protected:
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
    EObitrendGoalkeeperAction LastAction = EObitrendGoalkeeperAction::Ready;
    float DiveRecoveryTime = 0.0f;
};