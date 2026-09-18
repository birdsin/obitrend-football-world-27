#include "ObitrendAIMovementComponent.h"

#include "ObitrendFootballAIComponent.h"
#include "GameFramework/Character.h"

UObitrendAIMovementComponent::UObitrendAIMovementComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void UObitrendAIMovementComponent::ExecuteDecision(
    EObitrendAIDecision Decision,
    const FVector& BallLocation,
    const FVector& TacticalTarget)
{
    if (!GetOwner()) return;

    switch (Decision)
    {
        case EObitrendAIDecision::MoveToBall:
            DesiredLocation = BallLocation;
            break;

        case EObitrendAIDecision::Press:
            DesiredLocation =
                FMath::Lerp(
                    GetOwner()->GetActorLocation(),
                    BallLocation,
                    0.82f);
            break;

        case EObitrendAIDecision::Support:
            DesiredLocation =
                TacticalTarget +
                GetOwner()->GetActorRightVector() * SupportOffset;
            break;

        case EObitrendAIDecision::AttackSpace:
            DesiredLocation = TacticalTarget;
            break;

        case EObitrendAIDecision::DefendSpace:
        case EObitrendAIDecision::Recover:
            DesiredLocation =
                FMath::Lerp(
                    TacticalTarget,
                    BallLocation,
                    0.25f);
            break;

        case EObitrendAIDecision::HoldPosition:
        default:
            DesiredLocation = TacticalTarget;
            break;
    }

    bMovementActive =
        Decision != EObitrendAIDecision::HoldPosition;
}

void UObitrendAIMovementComponent::TickComponent(
    float DeltaTime,
    ELevelTick TickType,
    FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    if (!bMovementActive || !GetOwner()) return;

    ACharacter* Character = Cast<ACharacter>(GetOwner());
    if (!Character) return;

    const FVector Current = Character->GetActorLocation();
    const FVector ToTarget = DesiredLocation - Current;
    const FVector Direction = ToTarget.GetSafeNormal2D();

    if (ToTarget.Size2D() <= MovementAcceptanceRadius)
    {
        bMovementActive = false;
        return;
    }

    Character->AddMovementInput(Direction, 1.0f);
}