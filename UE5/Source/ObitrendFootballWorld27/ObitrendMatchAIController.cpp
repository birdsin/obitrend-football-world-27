#include "ObitrendMatchAIController.h"

#include "ObitrendMatchPlayerSpawner.h"
#include "ObitrendRealisticPlayer.h"
#include "FootballBallActor.h"

AObitrendMatchAIController::AObitrendMatchAIController()
{
    PrimaryActorTick.bCanEverTick = true;
}

void AObitrendMatchAIController::InitializeMatchAI(
    AObitrendMatchPlayerSpawner* InSpawner,
    AFootballBallActor* InBall)
{
    Spawner = InSpawner;
    Ball = InBall;
    DecisionAccumulator = 0.0f;
}

FVector AObitrendMatchAIController::GetFormationTarget(
    const AObitrendRealisticPlayer* Player) const
{
    if (!Player)
    {
        return FVector::ZeroVector;
    }

    // Preserve the player's starting lane while allowing the formation
    // to compress toward the current ball position.
    const FVector Current = Player->GetActorLocation();
    const FVector BallLocation = Ball
        ? Ball->GetActorLocation()
        : Current;

    FVector Target = Current;
    const float BallPull = 0.22f;

    Target.Y += (BallLocation.Y - Current.Y) * BallPull;

    if (Player->Role == EObitrendPlayerRole::Attacker)
    {
        Target.X += Player->bHomeTeam ? 260.0f : -260.0f;
    }
    else if (Player->Role == EObitrendPlayerRole::Midfielder)
    {
        Target.X += Player->bHomeTeam ? 90.0f : -90.0f;
    }

    return Target;
}

void AObitrendMatchAIController::UpdateTeam(
    TArray<AObitrendRealisticPlayer*>& Team,
    float DeltaSeconds)
{
    if (!Ball) return;

    const FVector BallLocation = Ball->GetActorLocation();

    AObitrendRealisticPlayer* Closest = nullptr;
    float ClosestDistance = BIG_NUMBER;

    for (AObitrendRealisticPlayer* Player : Team)
    {
        if (!IsValid(Player)) continue;

        const float Distance =
            FVector::Dist2D(Player->GetActorLocation(), BallLocation);

        if (Distance < ClosestDistance)
        {
            ClosestDistance = Distance;
            Closest = Player;
        }
    }

    for (AObitrendRealisticPlayer* Player : Team)
    {
        if (!IsValid(Player)) continue;

        FVector Target = GetFormationTarget(Player);

        if (Player == Closest && ClosestDistance < 2600.0f)
        {
            Target = BallLocation;
        }

        const FVector ToTarget =
            (Target - Player->GetActorLocation()).GetSafeNormal2D();

        if (!ToTarget.IsNearlyZero())
        {
            const FVector Forward = Player->GetActorForwardVector();
            const FVector Right = Player->GetActorRightVector();

            const FVector2D Input(
                FVector::DotProduct(ToTarget, Forward),
                FVector::DotProduct(ToTarget, Right));

            Player->SetMovementInput(Input.GetSafeNormal());

            const float DistanceToTarget =
                FVector::Dist2D(Player->GetActorLocation(), Target);

            Player->Sprint(DistanceToTarget > 700.0f);
        }
        else
        {
            Player->SetMovementInput(FVector2D::ZeroVector);
            Player->Sprint(false);
        }
    }
}

void AObitrendMatchAIController::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    DecisionAccumulator += DeltaSeconds;
    if (DecisionAccumulator < 0.10f)
    {
        return;
    }

    DecisionAccumulator = 0.0f;

    if (!Spawner || !Ball)
    {
        return;
    }

    TArray<AObitrendRealisticPlayer*> Home;
    TArray<AObitrendRealisticPlayer*> Away;

    for (AObitrendRealisticPlayer* Player : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Player)) continue;

        if (Player->bHomeTeam)
        {
            Home.Add(Player);
        }
        else
        {
            Away.Add(Player);
        }
    }

    UpdateTeam(Home, DeltaSeconds);
    UpdateTeam(Away, DeltaSeconds);
}