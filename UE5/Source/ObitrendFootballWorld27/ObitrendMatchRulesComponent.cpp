#include "ObitrendMatchRulesComponent.h"

UObitrendMatchRulesComponent::UObitrendMatchRulesComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

bool UObitrendMatchRulesComponent::CheckGoal(
    const FVector& BallLocation,
    int32& ScoringTeam)
{
    ScoringTeam = -1;

    if (FMath::Abs(BallLocation.Y) > GoalHalfWidth)
    {
        return false;
    }

    if (BallLocation.X > PitchHalfLength &&
        BallLocation.X <= PitchHalfLength + GoalDepth)
    {
        ScoringTeam = 0;
    }
    else if (BallLocation.X < -PitchHalfLength &&
             BallLocation.X >= -PitchHalfLength - GoalDepth)
    {
        ScoringTeam = 1;
    }

    return ScoringTeam >= 0;
}

void UObitrendMatchRulesComponent::RegisterGoal(int32 ScoringTeam)
{
    if (ScoringTeam == 0)
    {
        ++HomeScore;
    }
    else if (ScoringTeam == 1)
    {
        ++AwayScore;
    }

    RestartType = EObitrendRestartType::Kickoff;
}

void UObitrendMatchRulesComponent::ResetForKickoff()
{
    RestartType = EObitrendRestartType::Kickoff;
}