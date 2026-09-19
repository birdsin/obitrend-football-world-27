#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "ObitrendPlayerVisualComponent.generated.h"

UCLASS(ClassGroup=(Football), Blueprintable, meta=(BlueprintSpawnableComponent))
class OBITRENDFOOTBALLWORLD27_API UObitrendPlayerVisualComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    virtual void BeginPlay() override;

    UFUNCTION(BlueprintCallable, Category="Visual")
    void ApplyRealisticVisuals();

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Visual")
    TObjectPtr<USkeletalMesh> RealisticBodyMesh;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Visual")
    TObjectPtr<USkeletalMesh> KitMesh;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Visual")
    TObjectPtr<UMaterialInterface> SkinMaterial;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Visual")
    TObjectPtr<UMaterialInterface> KitMaterial;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Visual")
    TObjectPtr<class UAnimInstance> AnimationInstance;
};