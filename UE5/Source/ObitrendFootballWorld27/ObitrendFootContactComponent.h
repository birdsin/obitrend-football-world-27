#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendFootContactComponent.generated.h"

UENUM(BlueprintType)
enum class EObitrendFoot : uint8
{
    Left,
    Right
};

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendFootContactComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UObitrendFootContactComponent();

    UFUNCTION(BlueprintCallable, Category="Football|Foot Contact")
    bool CanContactBall(AActor* BallActor) const;

    UFUNCTION(BlueprintCallable, Category="Football|Foot Contact")
    bool TouchBall(AActor* BallActor, EObitrendFoot Foot, const FVector& ContactDirection, float ContactSpeed);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Foot Contact")
    float ContactRadius = 38.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Foot Contact")
    float MaxContactSpeed = 2600.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Foot Contact")
    float GroundTouchLift = 25.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Football|Foot Contact")
    float SpinFactor = 0.42f;

protected:
    virtual void BeginPlay() override;

private:
    FVector GetFootWorldLocation(EObitrendFoot Foot) const;
};