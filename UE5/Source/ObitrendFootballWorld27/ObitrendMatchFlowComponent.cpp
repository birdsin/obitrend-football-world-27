#include "ObitrendMatchFlowComponent.h"

UObitrendMatchFlowComponent::UObitrendMatchFlowComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void UObitrendMatchFlowComponent::StartMatch()
{
    MatchMinute = 0.0f;
    HomeScore = 0;
    AwayScore = 0;
    GoalPause = 0.0f;
    HalfTimePause = 0.0f;
    Phase = EObitrendMatchPhase::FirstHalf;
}

void UObitrendMatchFlowComponent::StartSecondHalf()
{
    if (Phase == EObitrendMatchPhase::HalfTime)
    {
        Phase = EObitrendMatchPhase::SecondHalf;
        MatchMinute = 45.0f;
        GoalPause = 0.0f;
        HalfTimePause = 0.0f;
    }
}

void UObitrendMatchFlowComponent::RegisterGoal(int32 ScoringTeam)
{
    if (Phase != EObitrendMatchPhase::FirstHalf &&
        Phase != EObitrendMatchPhase::SecondHalf)
    {
        return;
    }

    if (ScoringTeam == 0) ++HomeScore;
    else if (ScoringTeam == 1) ++AwayScore;

    GoalPause = 4.0f;
}

void UObitrendMatchFlowComponent::TickComponent(
    float DeltaTime,
    ELevelTick TickType,
    FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    if (Phase == EObitrendMatchPhase::PreKickoff ||
        Phase == EObitrendMatchPhase::FullTime)
    {
        return;
    }

    if (Phase == EObitrendMatchPhase::HalfTime)
    {
        HalfTimePause += DeltaTime;
        if (HalfTimePause >= 4.0f)
        {
            StartSecondHalf();
        }
        return;
    }

    if (GoalPause > 0.0f)
    {
        GoalPause -= DeltaTime;
        return;
    }

    MatchMinute += DeltaTime / 60.0f;

    if (Phase == EObitrendMatchPhase::FirstHalf &&
        MatchMinute >= 45.0f)
    {
        Phase = EObitrendMatchPhase::HalfTime;
        HalfTimePause = 0.0f;
        return;
    }

    if (Phase == EObitrendMatchPhase::SecondHalf &&
        MatchMinute >= MatchLengthMinutes)
    {
        Phase = EObitrendMatchPhase::FullTime;
    }
}