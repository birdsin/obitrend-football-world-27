#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendMatchRulesComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendRestartType : uint8
{
    Kickoff,
    GoalKick,
    Corner,
    ThrowIn
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendMatchRulesComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendMatchRulesComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Rules")
    bool CheckGoal(const FVector& BallLocation, int32& ScoringTeam);

    UFUNCTION(BlueprintCallable, Category="Football|Rules")
    void RegisterGoal(int32 ScoringTeam);

    UFUNCTION(BlueprintCallable, Category="Football|Rules")
    void ResetForKickoff();

    UFUNCTION(BlueprintPure, Category="Football|Rules")
    int32 GetHomeScore() const { return HomeScore; }

    UFUNCTION(BlueprintPure, Category="Football|Rules")
    int32 GetAwayScore() const { return AwayScore; }

    UFUNCTION(BlueprintPure, Category="Football|Rules")
    EObitrendRestartType GetRestartType() const { return RestartType; }

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Rules")
    float PitchHalfLength = 5250.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Rules")
    float GoalHalfWidth = 366.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Rules")
    float GoalDepth = 250.0f;

private:
    int32 HomeScore = 0;
    int32 AwayScore = 0;
    EObitrendRestartType RestartType = EObitrendRestartType::Kickoff;
};