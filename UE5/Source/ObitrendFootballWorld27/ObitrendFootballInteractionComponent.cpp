#include "ObitrendFootballInteractionComponent.h"

#include "Components/PrimitiveComponent.h"
#include "GameFramework/Actor.h"
#include "Kismet/KismetMathLibrary.h"
#include "ObitrendRealisticPlayer.h"

UObitrendFootballInteractionComponent::UObitrendFootballInteractionComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

bool UObitrendFootballInteractionComponent::HasBallInControl() const
{
    return IsValid(ControlledBall);
}

bool UObitrendFootballInteractionComponent::ReceiveBall(AActor* BallActor)
{
    if (!IsValid(BallActor) || !IsValid(GetOwner())) return false;

    const float Distance = FVector::Dist(
        GetOwner()->GetActorLocation(),
        BallActor->GetActorLocation());

    if (Distance > ControlDistance) return false;

    ControlledBall = BallActor;
    CurrentAction = EObitrendBallAction::Receive;
    DribbleTouchAccumulator = 0.0f;
    bLeftDribbleTouch = true;

    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (Player->AnimationRuntime) Player->AnimationRuntime->SetAction(EObitrendRuntimeAnimation::Receive);
    }

    if (UPrimitiveComponent* Primitive =
        Cast<UPrimitiveComponent>(BallActor->GetRootComponent()))
    {
        Primitive->SetPhysicsLinearVelocity(FVector::ZeroVector);
        Primitive->SetPhysicsAngularVelocityInRadians(FVector::ZeroVector);
        Primitive->SetSimulatePhysics(false);
    }

    MoveControlledBall(
        GetOwner()->GetActorLocation() +
        GetOwner()->GetActorForwardVector() * DribbleDistance +
        FVector(0, 0, 35));

    return true;
}

bool UObitrendFootballInteractionComponent::DribbleBall(
    const FVector& Direction, float Speed)
{
    if (!HasBallInControl()) return false;

    LastDribbleDirection = Direction.GetSafeNormal();
    DribbleTouchAccumulator = 0.0f;
    CurrentAction = EObitrendBallAction::Dribble;

    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (Player->AnimationRuntime) Player->AnimationRuntime->SetAction(EObitrendRuntimeAnimation::Dribble);
    }

    MoveControlledBall(
        GetOwner()->GetActorLocation() +
        LastDribbleDirection * DribbleDistance +
        FVector(0, 0, 35));

    return true;
}

bool UObitrendFootballInteractionComponent::PassBall(
    const FVector& Direction, float Power, float Lift)
{
    return LaunchBall(
        Direction,
        FMath::Clamp(Power, 0.0f, PassMaxPower),
        Lift,
        EObitrendBallAction::Pass);
}

bool UObitrendFootballInteractionComponent::ShootBall(
    const FVector& Direction, float Power, float Lift)
{
    return LaunchBall(
        Direction,
        FMath::Clamp(Power, 0.0f, ShotMaxPower),
        Lift,
        EObitrendBallAction::Shoot);
}

bool UObitrendFootballInteractionComponent::LaunchBall(
    const FVector& Direction,
    float Power,
    float Lift,
    EObitrendBallAction Action)
{
    if (!HasBallInControl()) return false;

    AActor* Ball = ControlledBall;
    CurrentAction = Action;
    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (Player->AnimationRuntime)
        {
            Player->AnimationRuntime->SetAction(
                Action == EObitrendBallAction::Shoot ? EObitrendRuntimeAnimation::Shoot : EObitrendRuntimeAnimation::Pass);
        }
    }
    ControlledBall = nullptr;

    if (UPrimitiveComponent* Primitive =
        Cast<UPrimitiveComponent>(Ball->GetRootComponent()))
    {
        Primitive->SetSimulatePhysics(true);

            const FVector FlatDirection = Direction.GetSafeNormal2D();
        const FVector LaunchVelocity =
            FlatDirection * Power + FVector::UpVector * Lift;

        Primitive->SetPhysicsLinearVelocity(LaunchVelocity);

        // Give passes and shots directional spin instead of a fixed spin axis.
        const FVector SideAxis = FVector::CrossProduct(FVector::UpVector, FlatDirection).GetSafeNormal();
        const float SpinStrength = Power * (Action == EObitrendBallAction::Shoot ? 0.55f : 0.32f);
        Primitive->AddAngularImpulseInRadians(
            SideAxis * SpinStrength + FVector::UpVector * (Power * 0.12f),
            NAME_None,
            true);
    }

    return true;
}

void UObitrendFootballInteractionComponent::ReleaseBall()
{
    ControlledBall = nullptr;
    CurrentAction = EObitrendBallAction::None;
    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (Player->AnimationRuntime) Player->AnimationRuntime->ClearAction();
    }
}

void UObitrendFootballInteractionComponent::MoveControlledBall(
    const FVector& TargetLocation)
{
    if (IsValid(ControlledBall))
    {
        ControlledBall->SetActorLocation(
            TargetLocation,
            false,
            nullptr,
            ETeleportType::TeleportPhysics);
    }
}

void UObitrendFootballInteractionComponent::TickComponent(
    float DeltaTime,
    ELevelTick TickType,
    FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    if (!HasBallInControl()) return;

    DribbleTouchAccumulator += DeltaTime;

    const float SpeedFactor = FMath::Clamp(
        GetOwner()->GetVelocity().Size2D() / 650.0f,
        0.0f,
        1.0f);

    // Alternate the ball between the two foot lanes to avoid a rigid,
    // body-centered follow and create a more natural close-control rhythm.
    const float TouchInterval = FMath::Lerp(0.24f, 0.14f, SpeedFactor);
    if (DribbleTouchAccumulator >= TouchInterval)
    {
        DribbleTouchAccumulator = 0.0f;
        bLeftDribbleTouch = !bLeftDribbleTouch;
    }

    const FVector Forward = LastDribbleDirection.IsNearlyZero()
        ? GetOwner()->GetActorForwardVector()
        : LastDribbleDirection;

    const FVector Right = GetOwner()->GetActorRightVector();
    const float SideOffset = bLeftDribbleTouch ? -32.0f : 32.0f;
    const float Lead = FMath::Lerp(72.0f, 112.0f, SpeedFactor);

    const FVector Desired =
        GetOwner()->GetActorLocation() +
        Forward * Lead +
        Right * SideOffset +
        FVector(0, 0, 35);

    const FVector Current = ControlledBall->GetActorLocation();

    MoveControlledBall(
        FMath::VInterpTo(Current, Desired, DeltaTime, 18.0f));
}