#include "ObitrendGoalkeeperActionComponent.h"

#include "GameFramework/Actor.h"
#include "Components/PrimitiveComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "ObitrendRealisticPlayer.h"
#include "ObitrendAnimationRuntimeComponent.h"

UObitrendGoalkeeperActionComponent::UObitrendGoalkeeperActionComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void UObitrendGoalkeeperActionComponent::TickComponent(
    float DeltaTime,
    ELevelTick TickType,
    FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    if (DiveRecoveryTime <= 0.0f) return;

    DiveRecoveryTime -= DeltaTime;

    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (UCharacterMovementComponent* Movement = Player->GetCharacterMovement())
        {
            // Bleed off the dive impulse smoothly instead of letting the keeper
            // slide or snap back unnaturally after the save.
            Movement->Velocity.X = FMath::FInterpTo(Movement->Velocity.X, 0.0f, DeltaTime, 7.0f);
            Movement->Velocity.Y = FMath::FInterpTo(Movement->Velocity.Y, 0.0f, DeltaTime, 7.0f);
        }

        if (DiveRecoveryTime <= 0.0f && Player->AnimationRuntime)
        {
            Player->AnimationRuntime->ClearAction();
        }
    }
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

    // React to the projected ball path, not only its current position.
    // This gives the keeper a short anticipation window for fast shots.
    const FVector FlatVelocity = BallVelocity.GetSafeNormal2D();
    const float AnticipationTime =
        FMath::Clamp(
            IncomingSpeed / 3200.0f,
            0.05f,
            0.22f);

    const FVector ProjectedBall =
        BallLocation +
        FlatVelocity * IncomingSpeed * AnticipationTime;

    const float ProjectedRelativeY =
        ProjectedBall.Y - GoalCenter.Y;

    const float LateralSpeed =
        FMath::Abs(BallVelocity.Y);

    const float DiveThreshold =
        GoalWidth * FMath::GetMappedRangeValueClamped(
            FVector2D(350.0f, 1800.0f),
            FVector2D(0.26f, 0.18f),
            IncomingSpeed);

    if (FMath::Abs(ProjectedRelativeY) > DiveThreshold &&
        LateralSpeed > 90.0f)
    {
        LastAction =
            ProjectedRelativeY < 0.0f
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
            DiveRecoveryTime = 0.72f;
        }
    }

    const FVector BallLocation = BallActor->GetActorLocation();
    const FVector KeeperLocation = GetOwner()->GetActorLocation();
    const FVector AwayFromKeeper =
        (BallLocation - KeeperLocation).GetSafeNormal2D();
    const float IncomingSpeed = BallPrimitive->GetPhysicsLinearVelocity().Size2D();
    const float DeflectionPower = FMath::Clamp(650.0f + IncomingSpeed * 0.18f, 650.0f, 1050.0f);

    FVector SaveDirection = AwayFromKeeper;

    if (Action == EObitrendGoalkeeperAction::DiveLeft)
    {
        SaveDirection = FVector(0, -1, 0);
    }
    else if (Action == EObitrendGoalkeeperAction::DiveRight)
    {
        SaveDirection = FVector(0, 1, 0);
    }
    else if (Action == EObitrendGoalkeeperAction::Parry)
    {
        // Deflect saves away from the keeper while adding a controlled
        // sideways component based on the incoming shot. This produces
        // more believable parries instead of sending every save straight
        // back along the same line.
        const FVector IncomingDirection =
            BallPrimitive->GetPhysicsLinearVelocity().GetSafeNormal2D();

        const FVector SideDirection =
            FVector::CrossProduct(FVector::UpVector, IncomingDirection)
            .GetSafeNormal2D();

        const float KeeperSide =
            FVector::DotProduct(
                GetOwner()->GetActorRightVector().GetSafeNormal2D(),
                AwayFromKeeper);

        const float SideSign =
            KeeperSide >= 0.0f ? 1.0f : -1.0f;

        SaveDirection =
            (AwayFromKeeper +
             SideDirection * SideSign * 0.38f)
            .GetSafeNormal2D();
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
        // Punches should clear the danger zone rather than behave like a
        // normal parry. Add lift and a stronger lateral component so the ball
        // travels away from the goal mouth.
        if (Action == EObitrendGoalkeeperAction::Punch)
        {
            const FVector PunchSide =
                FVector::CrossProduct(
                    FVector::UpVector,
                    BallPrimitive->GetPhysicsLinearVelocity().GetSafeNormal2D())
                .GetSafeNormal2D();

            const float SideSign =
                FVector::DotProduct(
                    PunchSide,
                    GetOwner()->GetActorRightVector().GetSafeNormal2D()) >= 0.0f
                    ? 1.0f
                    : -1.0f;

            SaveDirection =
                (SaveDirection + PunchSide * SideSign * 0.55f)
                .GetSafeNormal2D();

            BallPrimitive->SetPhysicsLinearVelocity(
                SaveDirection * FMath::Clamp(
                    DeflectionPower * 1.12f,
                    780.0f,
                    1250.0f) +
                FVector(
                    0.0f,
                    0.0f,
                    FMath::Clamp(
                        120.0f + IncomingSpeed * 0.075f,
                        120.0f,
                        240.0f)));
        }
        else
        {
            BallPrimitive->SetPhysicsLinearVelocity(
                SaveDirection * DeflectionPower +
                FVector(
                    0.0f,
                    0.0f,
                    FMath::Clamp(
                        70.0f + IncomingSpeed * 0.05f,
                        70.0f,
                        160.0f)));
        }
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