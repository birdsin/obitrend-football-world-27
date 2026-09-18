#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "ObitrendPlayerAnimationProfile.generated.h"

UCLASS(BlueprintType)
class OBITRENDFOOTBALLWORLD27_API UObitrendPlayerAnimationProfile : public UObject
{
    GENERATED_BODY()

public:
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation")
    TObjectPtr<class UAnimSequence> Idle;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation")
    TObjectPtr<class UAnimSequence> Walk;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation")
    TObjectPtr<class UAnimSequence> Run;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation")
    TObjectPtr<class UAnimSequence> Sprint;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation")
    TObjectPtr<class UAnimSequence> Turn;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation")
    TObjectPtr<class UAnimSequence> Kick;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation")
    TObjectPtr<class UAnimSequence> Pass;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation")
    TObjectPtr<class UAnimSequence> Shoot;
};