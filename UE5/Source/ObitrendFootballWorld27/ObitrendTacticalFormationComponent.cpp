#include "ObitrendTacticalFormationComponent.h"

UObitrendTacticalFormationComponent::UObitrendTacticalFormationComponent()
{
    PrimaryComponentTick.bCanEverTick = false;

    const FVector Positions[] =
    {
        FVector(-4700, 0, 100),
        FVector(-3600, -2500, 100),
        FVector(-3700, -850, 100),
        FVector(-3700, 850, 100),
        FVector(-3600, 2500, 100),
        FVector(-2100, -1500, 100),
        FVector(-1900, 0, 100),
        FVector(-2100, 1500, 100),
        FVector(-700, -2500, 100),
        FVector(-500, 0, 100),
        FVector(-700, 2500, 100)
    };

    for (int32 Index = 0; Index < 11; ++Index)
    {
        FObitrendTacticalSlot Slot;
        Slot.SlotIndex = Index;
        Slot.BaseLocation = Positions[Index];

        if (Index >= 8)
        {
            Slot.AttackBias = 1.0f;
        }
        else if (Index >= 5)
        {
            Slot.AttackBias = 0.45f;
        }

        Slots.Add(Slot);
    }
}

FVector UObitrendTacticalFormationComponent::GetTacticalTarget(
    int32 SlotIndex,
    const FVector& BallLocation,
    bool bTeamHasBall,
    float AttackingDirection) const
{
    if (!Slots.IsValidIndex(SlotIndex))
    {
        return FVector::ZeroVector;
    }

    const FObitrendTacticalSlot& Slot = Slots[SlotIndex];

    FVector Target = Slot.BaseLocation;

    const float BallX = FMath::Clamp(BallLocation.X, -4700.0f, 4700.0f);
    const float BallY = FMath::Clamp(BallLocation.Y, -3300.0f, 3300.0f);

    // Players shift toward the ball while preserving their formation lane.
    Target.Y += BallY * BallInfluence;

    if (bTeamHasBall)
    {
        Target.X +=
            AttackingDirection *
            Slot.AttackBias *
            PossessionAdvance;
    }

    return Target;
}