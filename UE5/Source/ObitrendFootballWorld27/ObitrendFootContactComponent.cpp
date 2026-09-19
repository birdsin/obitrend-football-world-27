#include "ObitrendFootContactComponent.h"

#include "Components/PrimitiveComponent.h"
#include "GameFramework/Actor.h"
#include "GameFramework/Character.h"
#include "Components/SkeletalMeshComponent.h"
#include "ObitrendRealisticPlayer.h"
#include "ObitrendAnimationRuntimeComponent.h"

UObitrendFootContactComponent::UObitrendFootContactComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

void UObitrendFootContactComponent::BeginPlay()
{
    Super::BeginPlay();
}

FVector UObitrendFootContactComponent::GetFootWorldLocation(EObitrendFoot Foot) const
{
    const ACharacter* Character = Cast<ACharacter>(GetOwner());
    if (!Character || !Character->GetMesh())
    {
        return GetOwner()->GetActorLocation();
    }

    const FName Socket = Foot == EObitrendFoot::Left
        ? FName(TEXT("foot_l"))
        : FName(TEXT("foot_r"));

    if (Character->GetMesh()->DoesSocketExist(Socket))
    {
        return Character->GetMesh()->GetSocketLocation(Socket);
    }

    return GetOwner()->GetActorLocation() +
        GetOwner()->GetActorForwardVector() * 65.0f +
        FVector(
            Foot == EObitrendFoot::Left ? -15.0f : 15.0f,
            0.0f,
            0.0f);
}

bool UObitrendFootContactComponent::CanContactBall(AActor* BallActor) const
{
    if (!IsValid(BallActor) || !IsValid(GetOwner())) return false;

    const FVector Left = GetFootWorldLocation(EObitrendFoot::Left);
    const FVector Right = GetFootWorldLocation(EObitrendFoot::Right);
    const FVector Ball = BallActor->GetActorLocation();

    return FVector::DistSquared(Left, Ball) <=
               FMath::Square(ContactRadius) ||
           FVector::DistSquared(Right, Ball) <=
               FMath::Square(ContactRadius);
}

bool UObitrendFootContactComponent::TouchBall(
    AActor* BallActor,
    EObitrendFoot Foot,
    const FVector& ContactDirection,
    float ContactSpeed)
{
    if (!CanContactBall(BallActor)) return false;

    UPrimitiveComponent* BallPrimitive =
        Cast<UPrimitiveComponent>(BallActor->GetRootComponent());

    if (!BallPrimitive) return false;

    if (AObitrendRealisticPlayer* Player = Cast<AObitrendRealisticPlayer>(GetOwner()))
    {
        if (Player->AnimationRuntime)
        {
            Player->AnimationRuntime->SetAction(
                EObitrendRuntimeAnimation::Dribble);
        }
    }

    const FVector Direction = ContactDirection.GetSafeNormal();
    const float Speed = FMath::Clamp(ContactSpeed, 0.0f, MaxContactSpeed);

    BallPrimitive->SetSimulatePhysics(true);

    FVector Velocity = Direction * Speed;

    if (Velocity.Z < 0.0f)
    {
        Velocity.Z = 0.0f;
    }

    Velocity.Z += GroundTouchLift;

    // Apply the contact from the actual foot position so close control and touches
    // respond to the player/ball geometry instead of only setting a free-flight velocity.
    const FVector FootLocation = GetFootWorldLocation(Foot);
    const FVector BallLocation = BallActor->GetActorLocation();
    const FVector ContactNormal = (BallLocation - FootLocation).GetSafeNormal();
    if (!ContactNormal.IsNearlyZero())
    {
        Velocity += ContactNormal * FMath::Min(Speed * 0.12f, 180.0f);
    }

    BallPrimitive->SetPhysicsLinearVelocity(Velocity);

    const FVector SideAxis =
        GetOwner()->GetActorRightVector();

    const float FootSide =
        Foot == EObitrendFoot::Left ? -1.0f : 1.0f;

    BallPrimitive->AddAngularImpulseInRadians(
        SideAxis * Speed * SpinFactor * FootSide,
        NAME_None,
        true);

    return true;
}