#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ObitrendMatchPlayerSpawner.generated.h"

USTRUCT(BlueprintType)
struct FObitrendStartingPlayer
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 ShirtNumber = 1;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FName Position = TEXT("CM");

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    bool bHomeTeam = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FVector FormationOffset = FVector::ZeroVector;
};

UCLASS()
class OBITRENDFOOTBALLWORLD27_API AObitrendMatchPlayerSpawner : public AActor
{
    GENERATED_BODY()

public:
    AObitrendMatchPlayerSpawner();

    UFUNCTION(BlueprintCallable, Category="Football|Match")
    void SpawnStartingXI();

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Match")
    TSubclassOf<class AObitrendRealisticPlayer> PlayerClass;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Match")
    float PitchScale = 1.0f;

    UPROPERTY(BlueprintReadOnly, Category="Football|Match")
    TArray<TObjectPtr<class AObitrendRealisticPlayer>> SpawnedPlayers;

private:
    TArray<FObitrendStartingPlayer> BuildFormation(bool bHome) const;
};