#include "ObitrendTeamAIComponent.h"

UObitrendTeamAIComponent::UObitrendTeamAIComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

void UObitrendTeamAIComponent::SetTeamHasBall(bool bHasBall)
{
    bTeamHasBall = bHasBall;
}

void UObitrendTeamAIComponent::SetTeamAttackingDirection(float Direction)
{
    AttackingDirection = Direction >= 0.0f ? 1.0f : -1.0f;
}