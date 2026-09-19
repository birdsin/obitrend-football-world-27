#include "ObitrendMatchAIController.h"

#include "ObitrendMatchPlayerSpawner.h"
#include "ObitrendRealisticPlayer.h"
#include "ObitrendFootballInteractionComponent.h"
#include "ObitrendPlayerPhysicalInteractionComponent.h"
#include "ObitrendGoalkeeperActionComponent.h"
#include "ObitrendMatchRulesComponent.h"
#include "ObitrendMatchFlowComponent.h"
#include "FootballBallActor.h"
#include "Components/PrimitiveComponent.h"

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
    PossessionAccumulator = 0.0f;
    ActionCooldown = 1.0f;
    GoalkeeperActionCooldown = 0.0f;
    DefensiveActionCooldown = 0.0f;

    MatchRules = NewObject<UObitrendMatchRulesComponent>(this, TEXT("MatchRules"));
    MatchFlow = NewObject<UObitrendMatchFlowComponent>(this, TEXT("MatchFlow"));

    if (MatchRules) MatchRules->RegisterComponent();
    if (MatchFlow)
    {
        MatchFlow->RegisterComponent();
        MatchFlow->StartMatch();
    }
}

bool AObitrendMatchAIController::IsBallInRange(
    const AObitrendRealisticPlayer* Player) const
{
    return Player && Ball &&
        FVector::Dist2D(
            Player->GetActorLocation(),
            Ball->GetActorLocation()) <= 170.0f;
}

FVector AObitrendMatchAIController::GetFormationTarget(
    const AObitrendRealisticPlayer* Player) const
{
    if (!Player) return FVector::ZeroVector;

    const FVector Current = Player->GetActorLocation();
    const FVector BallLocation = Ball ? Ball->GetActorLocation() : Current;

    FVector Target = Current;
    Target.Y += (BallLocation.Y - Current.Y) * 0.22f;

    if (Player->Role == EObitrendPlayerRole::Attacker)
        Target.X += Player->bHomeTeam ? 260.0f : -260.0f;
    else if (Player->Role == EObitrendPlayerRole::Midfielder)
        Target.X += Player->bHomeTeam ? 90.0f : -90.0f;

    return Target;
}

void AObitrendMatchAIController::UpdatePossession(float DeltaSeconds)
{
    if (!Ball || !Spawner) return;

    if (PossessingPlayer.IsValid() && IsBallInRange(PossessingPlayer.Get()))
        return;

    AObitrendRealisticPlayer* Candidate = nullptr;
    float BestDistance = 190.0f;

    for (AObitrendRealisticPlayer* Player : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Player)) continue;

        const float Distance =
            FVector::Dist2D(Player->GetActorLocation(), Ball->GetActorLocation());

        if (Distance < BestDistance)
        {
            BestDistance = Distance;
            Candidate = Player;
        }
    }

    if (Candidate && Candidate->BallInteraction)
    {
        if (Candidate->BallInteraction->ReceiveBall(Ball))
        {
            PossessingPlayer = Candidate;
            PossessionAccumulator = 0.0f;
            ActionCooldown = 0.65f;
        }
    }
}

void AObitrendMatchAIController::UpdateGoalkeeperActions(float DeltaSeconds)
{
    if (!Spawner || !Ball || GoalkeeperActionCooldown > 0.0f)
        return;

    UPrimitiveComponent* BallPrimitive =
        Ball->FindComponentByClass<UPrimitiveComponent>();

    if (!BallPrimitive)
        return;

    const FVector BallLocation = Ball->GetActorLocation();
    const FVector BallVelocity = BallPrimitive->GetPhysicsLinearVelocity();

    if (BallVelocity.Size2D() < 250.0f)
        return;

    for (AObitrendRealisticPlayer* Player : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Player) ||
            Player->Role != EObitrendPlayerRole::Goalkeeper ||
            !Player->GoalkeeperAction)
        {
            continue;
        }

        // Home defends the negative-X goal; away defends the positive-X goal.
        const float GoalX = Player->bHomeTeam ? -5250.0f : 5250.0f;
        const FVector GoalCenter(GoalX, 0.0f, 100.0f);
        const FVector ToGoal = (GoalCenter - BallLocation).GetSafeNormal2D();

        // Only react when the ball is actually travelling toward this keeper's goal.
        if (FVector::DotProduct(BallVelocity.GetSafeNormal2D(), ToGoal) < 0.25f)
            continue;

        const float GoalDistance = FVector::Dist2D(BallLocation, GoalCenter);
        if (GoalDistance > 5200.0f)
            continue;

        const EObitrendGoalkeeperAction Action =
            Player->GoalkeeperAction->EvaluateSave(Ball, GoalCenter, 732.0f);

        if (Action != EObitrendGoalkeeperAction::Ready)
        {
            if (Player->GoalkeeperAction->ExecuteSave(Ball, Action))
            {
                GoalkeeperActionCooldown = 0.65f;
                PossessingPlayer.Reset();
                break;
            }
        }
    }
}

void AObitrendMatchAIController::ExecutePossessionAction(float DeltaSeconds)
{
    AObitrendRealisticPlayer* Player = PossessingPlayer.Get();
    if (!Player || !Ball || !Player->BallInteraction) return;

    ActionCooldown -= DeltaSeconds;
    if (ActionCooldown > 0.0f) return;

    const FVector Goal =
        Player->bHomeTeam
        ? FVector(5250.0f, 0.0f, 100.0f)
        : FVector(-5250.0f, 0.0f, 100.0f);

    const float GoalDistance =
        FVector::Dist2D(Player->GetActorLocation(), Goal);

    TArray<AActor*> Teammates;
    TArray<AActor*> Opponents;

    for (AObitrendRealisticPlayer* Other : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Other) || Other == Player) continue;

        if (Other->bHomeTeam == Player->bHomeTeam)
            Teammates.Add(Other);
        else
            Opponents.Add(Other);
    }

    AActor* BestTarget = nullptr;
    float BestScore = -BIG_NUMBER;

    for (AActor* Mate : Teammates)
    {
        const float Distance =
            FVector::Dist2D(Player->GetActorLocation(), Mate->GetActorLocation());

        if (Distance > 3600.0f || Distance < 300.0f) continue;

        const FVector ToMate =
            (Mate->GetActorLocation() - Player->GetActorLocation()).GetSafeNormal2D();

        const FVector ToGoal =
            (Goal - Player->GetActorLocation()).GetSafeNormal2D();

        const float Forward = FVector::DotProduct(ToMate, ToGoal);

        float NearestOpponentDistance = 5000.0f;
        for (AActor* Opponent : Opponents)
        {
            if (!IsValid(Opponent)) continue;
            NearestOpponentDistance = FMath::Min(
                NearestOpponentDistance,
                FVector::Dist2D(Mate->GetActorLocation(), Opponent->GetActorLocation()));
        }

        // Prefer forward options that are not immediately crowded, producing
        // more believable passing decisions instead of always choosing the
        // same forward-most teammate.
        const float SpaceScore =
            FMath::Clamp(NearestOpponentDistance / 1200.0f, 0.0f, 1.0f);
        const float ForwardScore = (Forward + 1.0f) * 0.5f;
        const float DistancePenalty =
            FMath::Clamp(Distance / 5000.0f, 0.0f, 1.0f);

        const float Score =
            ForwardScore * 0.55f +
            SpaceScore * 0.35f -
            DistancePenalty * 0.10f;

        if (Score > BestScore)
        {
            BestScore = Score;
            BestTarget = Mate;
        }
    }

    if (GoalDistance < 2300.0f)
    {
        const FVector ShotDirection =
            (Goal - Ball->GetActorLocation()).GetSafeNormal2D();

        Player->BallInteraction->ShootBall(
            ShotDirection,
            FMath::Clamp(2500.0f - GoalDistance * 0.12f, 1500.0f, 2500.0f),
            180.0f);

        PossessingPlayer.Reset();
        ActionCooldown = 1.0f;
        return;
    }

    if (BestTarget && BestScore > 0.15f)
    {
        const FVector PassDirection =
            (BestTarget->GetActorLocation() - Ball->GetActorLocation())
            .GetSafeNormal2D();

        Player->BallInteraction->PassBall(
            PassDirection,
            FMath::Clamp(
                FVector::Dist2D(
                    Player->GetActorLocation(),
                    BestTarget->GetActorLocation()) * 0.45f,
                650.0f,
                1450.0f),
            45.0f);

        PossessingPlayer.Reset();
        ActionCooldown = 0.85f;
        return;
    }

    Player->BallInteraction->DribbleBall(
        Player->GetActorForwardVector(),
        Player->SprintSpeed * 0.72f);

    ActionCooldown = 0.45f;
}

void AObitrendMatchAIController::UpdateDefensivePressure(float DeltaSeconds)
{
    DefensiveActionCooldown = FMath::Max(0.0f, DefensiveActionCooldown - DeltaSeconds);
    if (DefensiveActionCooldown > 0.0f || !Spawner || !PossessingPlayer.IsValid())
        return;

    AObitrendRealisticPlayer* BallCarrier = PossessingPlayer.Get();
    AObitrendRealisticPlayer* ClosestDefender = nullptr;
    float ClosestDistance = BIG_NUMBER;
    AObitrendRealisticPlayer* SecondDefender = nullptr;
    float SecondDistance = BIG_NUMBER;

    for (AObitrendRealisticPlayer* Player : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Player) || Player == BallCarrier ||
            Player->bHomeTeam == BallCarrier->bHomeTeam ||
            !Player->PhysicalInteraction)
        {
            continue;
        }

        const float Distance =
            FVector::Dist2D(Player->GetActorLocation(), BallCarrier->GetActorLocation());

        if (Distance < ClosestDistance)
        {
            SecondDefender = ClosestDefender;
            SecondDistance = ClosestDistance;
            ClosestDefender = Player;
            ClosestDistance = Distance;
        }
        else if (Distance < SecondDistance)
        {
            SecondDefender = Player;
            SecondDistance = Distance;
        }
    }

    // Keep the nearest defender as the active challenger so defenders do not
    // unrealistically stack tackles on the same frame.
    if (ClosestDefender && ClosestDistance <= 115.0f)
    {
        const float PressureStrength =
            FMath::Clamp(0.58f + (115.0f - ClosestDistance) * 0.0025f, 0.58f, 0.87f);
        if (ClosestDefender->PhysicalInteraction->Tackle(BallCarrier, PressureStrength))
            DefensiveActionCooldown = 0.32f;
    }
    else if (ClosestDefender && ClosestDistance <= 180.0f)
    {
        const float PressureStrength =
            FMath::Clamp(0.36f + (180.0f - ClosestDistance) * 0.0018f, 0.36f, 0.58f);
        if (ClosestDefender->PhysicalInteraction->ShoulderChallenge(BallCarrier, PressureStrength))
            DefensiveActionCooldown = 0.24f;
    }

    // A second defender can provide support only when close enough, without
    // triggering a simultaneous full tackle.
    if (SecondDefender && SecondDistance <= 145.0f)
    {
        const float SupportStrength =
            FMath::Clamp(0.22f + (145.0f - SecondDistance) * 0.0012f, 0.22f, 0.38f);
        SecondDefender->PhysicalInteraction->ShoulderChallenge(BallCarrier, SupportStrength);
    }
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
            Target = BallLocation;

        if (Player == Closest && ClosestDistance < 1400.0f)
        {
            Target = FMath::VInterpTo(
                Player->GetActorLocation(),
                BallLocation,
                DeltaSeconds,
                4.5f);
        }

        const FVector ToTarget =
            (Target - Player->GetActorLocation()).GetSafeNormal2D();

        if (!ToTarget.IsNearlyZero())
        {
            const FVector Forward = Player->GetActorForwardVector();
            const FVector Right = Player->GetActorRightVector();

            Player->SetMovementInput(
                FVector2D(
                    FVector::DotProduct(ToTarget, Forward),
                    FVector::DotProduct(ToTarget, Right)).GetSafeNormal());

            Player->Sprint(
                FVector::Dist2D(Player->GetActorLocation(), Target) > 700.0f);
        }
        else
        {
            Player->SetMovementInput(FVector2D::ZeroVector);
            Player->Sprint(false);
        }
    }
}

void AObitrendMatchAIController::HandleGoal(int32 ScoringTeam)
{
    if (MatchRules) MatchRules->RegisterGoal(ScoringTeam);
    if (MatchFlow) MatchFlow->RegisterGoal(ScoringTeam);

    PossessingPlayer.Reset();
    ActionCooldown = 4.0f;
    PossessionAccumulator = 0.0f;
    GoalkeeperActionCooldown = 1.0f;

    ResetBallToCenter();

    if (Spawner)
        Spawner->SpawnStartingXI();
}

void AObitrendMatchAIController::ResetBallToCenter()
{
    if (!Ball) return;

    Ball->SetActorLocation(FVector(0.0f, 0.0f, 35.0f), false);

    if (UPrimitiveComponent* Primitive =
        Ball->FindComponentByClass<UPrimitiveComponent>())
    {
        Primitive->SetPhysicsLinearVelocity(FVector::ZeroVector);
        Primitive->SetPhysicsAngularVelocityInDegrees(FVector::ZeroVector);
        Primitive->SetSimulatePhysics(true);
        Primitive->WakeAllRigidBodies();
    }
}

void AObitrendMatchAIController::ResetForKickoff()
{
    PossessingPlayer.Reset();
    ActionCooldown = 0.8f;
    PossessionAccumulator = 0.0f;
    GoalkeeperActionCooldown = 0.8f;
    ResetBallToCenter();
}

void AObitrendMatchAIController::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    if (!Spawner || !Ball) return;

    GoalkeeperActionCooldown =
        FMath::Max(0.0f, GoalkeeperActionCooldown - DeltaSeconds);

    if (MatchFlow)
    {
        const EObitrendMatchPhase Phase = MatchFlow->GetPhase();

        if (Phase == EObitrendMatchPhase::FullTime)
            return;

        if (Phase == EObitrendMatchPhase::HalfTime)
            return;
    }

    int32 ScoringTeam = -1;
    if (MatchRules &&
        MatchRules->CheckGoal(Ball->GetActorLocation(), ScoringTeam))
    {
        HandleGoal(ScoringTeam);
        return;
    }

    UpdateGoalkeeperActions(DeltaSeconds);
    UpdatePossession(DeltaSeconds);

    if (PossessingPlayer.IsValid())
    {
        ExecutePossessionAction(DeltaSeconds);
        UpdateDefensivePressure(DeltaSeconds);
    }

    DecisionAccumulator += DeltaSeconds;
    if (DecisionAccumulator < 0.10f) return;

    DecisionAccumulator = 0.0f;

    TArray<AObitrendRealisticPlayer*> Home;
    TArray<AObitrendRealisticPlayer*> Away;

    for (AObitrendRealisticPlayer* Player : Spawner->SpawnedPlayers)
    {
        if (!IsValid(Player)) continue;

        if (Player->bHomeTeam) Home.Add(Player);
        else Away.Add(Player);
    }

    UpdateTeam(Home, DeltaSeconds);
    UpdateTeam(Away, DeltaSeconds);
}