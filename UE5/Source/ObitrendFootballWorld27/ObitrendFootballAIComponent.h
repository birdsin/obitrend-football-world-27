#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendFootballAIComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendAIDecision : uint8
{
    HoldPosition,
    MoveToBall,
    Support,
    AttackSpace,
    DefendSpace,
    Press,
    Recover
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendFootballAIComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendFootballAIComponent();

    UFUNCTION(BlueprintCallable, Category="Football|AI")
    void UpdateDecision(AActor* BallActor, bool bTeamHasBall);

    UFUNCTION(BlueprintPure, Category="Football|AI")
    EObitrendAIDecision GetDecision() const { return Decision; }

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float BallAwarenessRadius = 2600.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float SupportDistance = 1800.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float PressDistance = 1200.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|AI")
    float RecoveryDistance = 3200.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|AI")
    EObitrendAIDecision Decision = EObitrendAIDecision::HoldPosition;

private:
    FVector DesiredLocation = FVector::ZeroVector;
};