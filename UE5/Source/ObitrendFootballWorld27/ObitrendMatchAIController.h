#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ObitrendMatchAIController.generated.h"

class AObitrendMatchPlayerSpawner;
class AObitrendRealisticPlayer;
class AFootballBallActor;
class UObitrendMatchRulesComponent;
class UObitrendMatchFlowComponent;

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

    UFUNCTION(BlueprintPure, Category="Football|AI")
    AObitrendRealisticPlayer* GetPossessingPlayer() const
    {
        return PossessingPlayer.Get();
    }

protected:
    virtual void Tick(float DeltaSeconds) override;

private:
    void UpdateTeam(TArray<AObitrendRealisticPlayer*>& Team, float DeltaSeconds);
    void UpdatePossession(float DeltaSeconds);
    void UpdateDefensivePressure(float DeltaSeconds);
    void ExecutePossessionAction(float DeltaSeconds);
    void HandleGoal(int32 ScoringTeam);
    void ResetForKickoff();
    void ResetBallToCenter();
    FVector GetFormationTarget(const AObitrendRealisticPlayer* Player) const;
    bool IsBallInRange(const AObitrendRealisticPlayer* Player) const;

    UPROPERTY()
    TObjectPtr<AObitrendMatchPlayerSpawner> Spawner;

    UPROPERTY()
    TObjectPtr<AFootballBallActor> Ball;

    UPROPERTY()
    TObjectPtr<UObitrendMatchRulesComponent> MatchRules;

    UPROPERTY()
    TObjectPtr<UObitrendMatchFlowComponent> MatchFlow;

    UPROPERTY()
    TWeakObjectPtr<AObitrendRealisticPlayer> PossessingPlayer;

    float DecisionAccumulator = 0.0f;
    float PossessionAccumulator = 0.0f;
    float ActionCooldown = 0.0f;
};