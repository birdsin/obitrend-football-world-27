#include "ObitrendMatchPlayerSpawner.h"

#include "ObitrendRealisticPlayer.h"
#include "Engine/World.h"

AObitrendMatchPlayerSpawner::AObitrendMatchPlayerSpawner()
{
    PrimaryActorTick.bCanEverTick = false;
}

TArray<FObitrendStartingPlayer>
AObitrendMatchPlayerSpawner::BuildFormation(bool bHome) const
{
    const float TeamDirection = bHome ? 1.0f : -1.0f;

    const FVector Positions[] =
    {
        FVector(-4700, 0, 100),
        FVector(-3600, -2500, 100),
        FVector(-3700, -850, 100),
        FVector(-3700, 850, 100),
        FVector(-3600, 2500, 100),
        FVector(-2100, -1500, 100),
        FVector(-1900, 0, 100),
        FVector(-2100, 1500, 100),
        FVector(-700, -2500, 100),
        FVector(-500, 0, 100),
        FVector(-700, 2500, 100)
    };

    TArray<FObitrendStartingPlayer> Result;
    Result.Reserve(11);

    for (int32 Index = 0; Index < 11; ++Index)
    {
        FObitrendStartingPlayer Player;
        Player.ShirtNumber = Index + 1;
        Player.bHomeTeam = bHome;
        Player.FormationOffset = Positions[Index] * TeamDirection;

        if (Index == 0) Player.Position = TEXT("GK");
        else if (Index <= 4) Player.Position = TEXT("DEF");
        else if (Index <= 7) Player.Position = TEXT("MID");
        else Player.Position = TEXT("ATT");

        Result.Add(Player);
    }

    return Result;
}

void AObitrendMatchPlayerSpawner::SpawnStartingXI()
{
    if (!PlayerClass || !GetWorld()) return;

    for (AObitrendRealisticPlayer* Existing : SpawnedPlayers)
    {
        if (IsValid(Existing)) Existing->Destroy();
    }

    SpawnedPlayers.Reset();

    const TArray<FObitrendStartingPlayer> Home = BuildFormation(true);
    const TArray<FObitrendStartingPlayer> Away = BuildFormation(false);

    auto SpawnTeam = [this](const TArray<FObitrendStartingPlayer>& Players)
    {
        for (const FObitrendStartingPlayer& Data : Players)
        {
            const FVector Location =
                GetActorLocation() +
                Data.FormationOffset * PitchScale;

            AObitrendRealisticPlayer* Player =
                GetWorld()->SpawnActor<AObitrendRealisticPlayer>(
                    PlayerClass,
                    Location,
                    FRotator::ZeroRotator);

            if (Player)
            {
                Player->ShirtNumber = Data.ShirtNumber;
                Player->bHomeTeam = Data.bHomeTeam;

                Player->Role =
                    Data.Position == TEXT("GK")
                    ? EObitrendPlayerRole::Goalkeeper
                    : Data.Position == TEXT("DEF")
                    ? EObitrendPlayerRole::Defender
                    : Data.Position == TEXT("MID")
                    ? EObitrendPlayerRole::Midfielder
                    : EObitrendPlayerRole::Attacker;

                SpawnedPlayers.Add(Player);
            }
        }
    };

    SpawnTeam(Home);
    SpawnTeam(Away);
}