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

    // Anticipate where the shot will cross the goal plane instead of
    // reacting only to the ball's current lateral position. This lets the
    // keeper hold position for longer shots and commit earlier when the
    // crossing point becomes urgent.
    const FVector FlatVelocity = BallVelocity.GetSafeNormal2D();

    const float SignedGoalDistanceX =
        GoalCenter.X - BallLocation.X;

    const bool bBallTravelsTowardGoalPlane =
        FMath::Abs(BallVelocity.X) > 80.0f &&
        SignedGoalDistanceX * BallVelocity.X > 0.0f;

    const float GoalPlaneTime =
        bBallTravelsTowardGoalPlane
        ? FMath::Clamp(
            SignedGoalDistanceX / BallVelocity.X,
            0.03f,
            0.90f)
        : 0.90f;

    const float AnticipationTime =
        FMath::Min(
            GoalPlaneTime * 0.65f,
            FMath::Clamp(
                IncomingSpeed / 3200.0f,
                0.05f,
                0.22f));

    const FVector ProjectedBall =
        BallLocation +
        FlatVelocity * IncomingSpeed * AnticipationTime;

    // Primary save target: the ball's predicted lateral crossing point at
    // the defended goal line.
    const float GoalLineProjectedY =
        BallLocation.Y +
        BallVelocity.Y * GoalPlaneTime;

    const float ProjectedRelativeY =
        GoalLineProjectedY - GoalCenter.Y;

    const float NearTermProjectedRelativeY =
        ProjectedBall.Y - GoalCenter.Y;

    const float LateralSpeed =
        FMath::Abs(BallVelocity.Y);

    const float ReactionUrgency =
        1.0f -
        FMath::Clamp(
            (GoalPlaneTime - 0.10f) / 0.65f,
            0.0f,
            1.0f);

    const float DiveThreshold =
        GoalWidth *
        FMath::GetMappedRangeValueClamped(
            FVector2D(350.0f, 1800.0f),
            FVector2D(0.26f, 0.18f),
            IncomingSpeed) *
        FMath::Lerp(
            1.10f,
            0.86f,
            ReactionUrgency);

    const bool bRequiresImmediateDive =
        GoalPlaneTime <= 0.58f ||
        FMath::Abs(NearTermProjectedRelativeY) >
            DiveThreshold * 0.92f;

    if (bRequiresImmediateDive &&
        FMath::Abs(ProjectedRelativeY) > DiveThreshold &&
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
            const float IncomingSpeed =
                BallActor->FindComponentByClass<UPrimitiveComponent>()
                    ? BallActor->FindComponentByClass<UPrimitiveComponent>()->GetPhysicsLinearVelocity().Size2D()
                    : 0.0f;

            // Faster shots demand a longer, stronger dive while slower shots
            // keep the keeper's movement compact and recoverable.
            const float DiveDistance =
                FMath::GetMappedRangeValueClamped(
                    FVector2D(700.0f, 2800.0f),
                    FVector2D(210.0f, 330.0f),
                    IncomingSpeed);

            const float DiveLift =
                FMath::GetMappedRangeValueClamped(
                    FVector2D(700.0f, 2800.0f),
                    FVector2D(60.0f, 105.0f),
                    IncomingSpeed);

            Player->LaunchCharacter(
                DiveDirection * DiveDistance +
                FVector(0.0f, 0.0f, DiveLift),
                true,
                true);

            DiveRecoveryTime =
                FMath::GetMappedRangeValueClamped(
                    FVector2D(700.0f, 2800.0f),
                    FVector2D(0.62f, 0.88f),
                    IncomingSpeed);
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
        // Secure the ball slightly above the keeper's body center and in
        // front of the chest, with a small height adjustment based on the
        // incoming shot speed.
        const float CatchHeight =
            FMath::GetMappedRangeValueClamped(
                FVector2D(250.0f, 1600.0f),
                FVector2D(72.0f, 108.0f),
                IncomingSpeed);

        const FVector CatchLocation =
            GetOwner()->GetActorLocation() +
            GetOwner()->GetActorForwardVector() * 58.0f +
            FVector(0.0f, 0.0f, CatchHeight);

        BallPrimitive->SetPhysicsLinearVelocity(FVector::ZeroVector);
        BallPrimitive->SetPhysicsAngularVelocityInDegrees(FVector::ZeroVector);
        BallPrimitive->SetActorLocation(
            CatchLocation,
            false,
            nullptr,
            ETeleportType::TeleportPhysics);

        // Keep the secured ball attached to the keeper's immediate control
        // point for the remainder of the save action instead of letting
        // physics immediately separate it from the hands/chest area.
        LastAction = EObitrendGoalkeeperAction::Catch;
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