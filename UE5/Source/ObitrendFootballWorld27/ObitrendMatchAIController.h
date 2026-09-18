#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ObitrendMatchAIController.generated.h"

class AObitrendMatchPlayerSpawner;
class AObitrendRealisticPlayer;
class AFootballBallActor;

UCLASS()
class OBITRENDFOOTBALLWORLD27_API AObitrendMatchAIController : public AActor
{
    GENERATED_BODY()

public:
    AObitrendMatchAIController();

    UFUNCTION(BlueprintCallable, Category="Football|AI")
    void InitializeMatchAI(
        AObitrendMatchPlayerSpawner* InSpawner,
        AFootballBallActor* InBall);

protected:
    virtual void Tick(float DeltaSeconds) override;

private:
    void UpdateTeam(TArray<AObitrendRealisticPlayer*>& Team, float DeltaSeconds);
    FVector GetFormationTarget(const AObitrendRealisticPlayer* Player) const;

    UPROPERTY()
    TObjectPtr<AObitrendMatchPlayerSpawner> Spawner;

    UPROPERTY()
    TObjectPtr<AFootballBallActor> Ball;

    float DecisionAccumulator = 0.0f;
};