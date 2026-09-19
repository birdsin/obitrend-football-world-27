#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendMatchFlowComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendMatchPhase : uint8
{
    PreKickoff,
    FirstHalf,
    HalfTime,
    SecondHalf,
    FullTime
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendMatchFlowComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendMatchFlowComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Match")
    void StartMatch();

    UFUNCTION(BlueprintCallable, Category="Football|Match")
    void RegisterGoal(int32 ScoringTeam);

    UFUNCTION(BlueprintCallable, Category="Football|Match")
    void StartSecondHalf();

    UFUNCTION(BlueprintPure, Category="Football|Match")
    EObitrendMatchPhase GetPhase() const { return Phase; }

    UFUNCTION(BlueprintPure, Category="Football|Match")
    float GetMatchMinute() const { return MatchMinute; }

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Match")
    float MatchLengthMinutes = 90.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Match")
    int32 HomeScore = 0;

    UPROPERTY(BlueprintReadOnly, Category="Football|Match")
    int32 AwayScore = 0;

protected:
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
    EObitrendMatchPhase Phase = EObitrendMatchPhase::PreKickoff;
    float MatchMinute = 0.0f;
    float GoalPause = 0.0f;
};