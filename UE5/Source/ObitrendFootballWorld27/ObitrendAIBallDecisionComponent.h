#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendAIBallDecisionComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendBallDecision : uint8
{
    None,
    Carry,
    Pass,
    ThroughPass,
    Cross,
    Shoot,
    Clear
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendAIBallDecisionComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendAIBallDecisionComponent();

    UFUNCTION(BlueprintCallable, Category="Football|AI")
    EObitrendBallDecision Evaluate(
        const FVector& BallLocation,
        const FVector& GoalLocation,
        const TArray<AActor*>& Teammates,
        const TArray<AActor*>& Opponents,
        bool bIsUnderPressure);

    UFUNCTION(BlueprintPure, Category="Football|AI")
    EObitrendBallDecision GetLastDecision() const { return LastDecision; }

    UFUNCTION(BlueprintPure, Category="Football|AI")
    AActor* GetPassTarget() const { return PassTarget.Get(); }

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float ShootingRange = 2400.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float PassingRange = 4200.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float PressureRange = 650.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float ShootingAngleCos = 0.72f;

private:
    EObitrendBallDecision LastDecision = EObitrendBallDecision::None;
    TWeakObjectPtr<AActor> PassTarget;
};