#include "ObitrendGoalkeeperActionComponent.h"

#include "GameFramework/Actor.h"
#include "Components/PrimitiveComponent.h"
#include "ObitrendRealisticPlayer.h"
#include "ObitrendAnimationRuntimeComponent.h"

UObitrendGoalkeeperActionComponent::UObitrendGoalkeeperActionComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

EObitrendGoalkeeperAction UObitrendGoalkeeperActionComponent::EvaluateSave(
    AActor* BallActor,
    const FVector& GoalCenter,
    float GoalWidth)
{
    if (!IsValid(GetOwner()) || !IsValid(BallActor))
    {
        LastAction = EObitrendGoalkeeperAction::Ready;
        return LastAction;
    }

    const FVector BallLocation = BallActor->GetActorLocation();
    const float Distance = FVector::Dist2D(
        GetOwner()->GetActorLocation(),
        BallLocation);

    if (Distance > ReactionRadius)
    {
        LastAction = EObitrendGoalkeeperAction::Ready;
        return LastAction;
    }

    const FVector Relative = BallLocation - GoalCenter;

    if (FMath::Abs(Relative.Y) > GoalWidth * 0.32f)
    {
        LastAction =
            Relative.Y < 0.0f
            ? EObitrendGoalkeeperAction::DiveLeft
            : EObitrendGoalkeeperAction::DiveRight;
        return LastAction;
    }

    if (UPrimitiveComponent* BallPrimitive =
        BallActor->FindComponentByClass<UPrimitiveComponent>())
    {
        const float Speed =
            BallPrimitive->GetPhysicsLinearVelocity().Size();

        LastAction =
            Speed <= CatchSpeedLimit
            ? EObitrendGoalkeeperAction::Catch
            : EObitrendGoalkeeperAction::Parry;
    }

    return LastAction;
}

bool UObitrendGoalkeeperActionComponent::ExecuteSave(
    AActor* BallActor,
    EObitrendGoalkeeperAction Action)
{
    if (!IsValid(GetOwner()) || !IsValid(BallActor))
    {
        return false;
    }

    UPrimitiveComponent* BallPrimitive =
        BallActor->FindComponentByClass<UPrimitiveComponent>();

    if (!BallPrimitive)
    {
        return false;
    }

    const FVector AwayFromKeeper =
        (BallActor->GetActorLocation() - GetOwner()->GetActorLocation())
        .GetSafeNormal2D();

    FVector SaveDirection = AwayFromKeeper;

    if (Action == EObitrendGoalkeeperAction::DiveLeft)
    {
        SaveDirection = FVector(0, -1, 0);
    }
    else if (Action == EObitrendGoalkeeperAction::DiveRight)
    {
        SaveDirection = FVector(0, 1, 0);
    }

    if (Action == EObitrendGoalkeeperAction::Catch)
    {
        BallPrimitive->SetPhysicsLinearVelocity(FVector::ZeroVector);
    }
    else
    {
        BallPrimitive->SetPhysicsLinearVelocity(
            SaveDirection * 750.0f + FVector(0, 0, 90.0f));
    }

    LastAction = Action;

    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (Player->AnimationRuntime)
        {
            EObitrendRuntimeAnimation Animation = EObitrendRuntimeAnimation::GoalkeeperSave;
            Player->AnimationRuntime->SetAction(Animation);
        }
    }

    return true;
}