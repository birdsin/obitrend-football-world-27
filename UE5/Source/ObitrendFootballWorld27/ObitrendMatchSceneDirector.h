#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ObitrendMatchSceneDirector.generated.h"

UCLASS()
class OBITRENDFOOTBALLWORLD27_API AObitrendMatchSceneDirector : public AActor
{
    GENERATED_BODY()

public:
    AObitrendMatchSceneDirector();

    UFUNCTION(BlueprintCallable, Category="Football|Match")
    void StartMatchScene();

    UFUNCTION(BlueprintPure, Category="Football|Match")
    float GetMatchSeconds() const { return MatchSeconds; }

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Match")
    float MatchSpeed = 1.0f;

protected:
    virtual void Tick(float DeltaSeconds) override;

private:
    float MatchSeconds = 0.0f;
    bool bMatchRunning = false;
};