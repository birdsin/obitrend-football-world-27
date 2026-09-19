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

    if (UPrimitiveComponent* BallPrimitive = BallActor->FindComponentByClass<UPrimitiveComponent>())
    {
        const FVector Velocity = BallPrimitive->GetPhysicsLinearVelocity();
        if (Velocity.IsNearlyZero())
        {
            LastAction = EObitrendGoalkeeperAction::Ready;
            return LastAction;
        }
    }
    const float Distance = FVector::Dist2D(
        GetOwner()->GetActorLocation(),
        BallLocation);

    if (Distance > ReactionRadius)
    {
        LastAction = EObitrendGoalkeeperAction::Ready;
        return LastAction;
    }

    const FVector Relative = BallLocation - GoalCenter;

    const FVector ToBall = (BallLocation - GetOwner()->GetActorLocation()).GetSafeNormal2D();
    const FVector BallVelocity = BallActor->FindComponentByClass<UPrimitiveComponent>()
        ? BallActor->FindComponentByClass<UPrimitiveComponent>()->GetPhysicsLinearVelocity()
        : FVector::ZeroVector;
    const FVector ToGoal = (GoalCenter - BallLocation).GetSafeNormal2D();

    // Do not trigger a save for a ball moving away from the defended goal.
    if (FVector::DotProduct(BallVelocity.GetSafeNormal2D(), ToGoal) < 0.15f)
    {
        LastAction = EObitrendGoalkeeperAction::Ready;
        return LastAction;
    }

    const float IncomingSpeed = BallActor->FindComponentByClass<UPrimitiveComponent>()
        ? BallActor->FindComponentByClass<UPrimitiveComponent>()->GetPhysicsLinearVelocity().Size2D()
        : 0.0f;

    if (IncomingSpeed > CatchSpeedLimit * 1.55f && FVector::DotProduct(ToBall, GetOwner()->GetActorForwardVector()) > 0.35f)
    {
        LastAction = EObitrendGoalkeeperAction::Punch;
        return LastAction;
    }

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

    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (Player->AnimationRuntime)
        {
            Player->AnimationRuntime->SetAction(EObitrendRuntimeAnimation::GoalkeeperSave);
        }

        const FVector BallLocation = BallActor->GetActorLocation();
        FVector DiveDirection = (BallLocation - Player->GetActorLocation()).GetSafeNormal2D();
        if (Action == EObitrendGoalkeeperAction::DiveLeft) DiveDirection = FVector(0.0f, -1.0f, 0.0f);
        if (Action == EObitrendGoalkeeperAction::DiveRight) DiveDirection = FVector(0.0f, 1.0f, 0.0f);

        if (Action == EObitrendGoalkeeperAction::DiveLeft || Action == EObitrendGoalkeeperAction::DiveRight)
        {
            Player->LaunchCharacter(DiveDirection * 260.0f + FVector(0.0f, 0.0f, 85.0f), true, true);
        }
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
        BallPrimitive->SetPhysicsAngularVelocityInDegrees(FVector::ZeroVector);
        BallPrimitive->SetActorLocation(
            GetOwner()->GetActorLocation() +
            GetOwner()->GetActorForwardVector() * 55.0f +
            FVector(0.0f, 0.0f, 85.0f),
            false,
            nullptr,
            ETeleportType::TeleportPhysics);
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