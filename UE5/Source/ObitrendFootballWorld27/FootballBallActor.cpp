#include "FootballBallActor.h"

#include "Components/SphereComponent.h"
#include "Components/StaticMeshComponent.h"
#include "GameFramework/ProjectileMovementComponent.h"

AFootballBallActor::AFootballBallActor()
{
    PrimaryActorTick.bCanEverTick = false;

    BallCollision = CreateDefaultSubobject<USphereComponent>(TEXT("BallCollision"));
    RootComponent = BallCollision;
    BallCollision->InitSphereRadius(11.0f);
    BallCollision->SetCollisionProfileName(TEXT("PhysicsActor"));
    BallCollision->SetSimulatePhysics(true);
    BallCollision->SetEnableGravity(true);
    BallCollision->SetLinearDamping(0.08f);
    BallCollision->SetAngularDamping(0.15f);

    BallMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BallMesh"));
    BallMesh->SetupAttachment(BallCollision);
    BallMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void AFootballBallActor::Kick(const FVector& Direction, float Speed, float Lift)
{
    const FVector Launch = Direction.GetSafeNormal() * Speed + FVector::UpVector * Lift;
    BallCollision->WakeAllRigidBodies();
    BallCollision->AddImpulse(Launch, NAME_None, true);
    BallCollision->AddAngularImpulseInRadians(FVector(0.0f, 0.0f, 900.0f), NAME_None, true);
}