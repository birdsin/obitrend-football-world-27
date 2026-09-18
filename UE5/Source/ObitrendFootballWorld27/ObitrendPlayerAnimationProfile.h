#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "ObitrendPlayerAnimationProfile.generated.h"

UCLASS(BlueprintType)
class OBITRENDFOOTBALLWORLD27_API UObitrendPlayerAnimationProfile : public UObject
{
    GENERATED_BODY()

public:
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Locomotion")
    TObjectPtr<class UBlendSpace> LocomotionBlendSpace;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Locomotion")
    TObjectPtr<class UBlendSpace> StrafeBlendSpace;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Locomotion")
    TObjectPtr<class UAnimSequence> Idle;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Locomotion")
    TObjectPtr<class UAnimSequence> Walk;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Locomotion")
    TObjectPtr<class UAnimSequence> Run;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Locomotion")
    TObjectPtr<class UAnimSequence> Sprint;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Locomotion")
    TObjectPtr<class UAnimSequence> Turn;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Ball")
    TObjectPtr<class UAnimSequence> Receive;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Ball")
    TObjectPtr<class UAnimSequence> Dribble;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Ball")
    TObjectPtr<class UAnimSequence> Kick;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Ball")
    TObjectPtr<class UAnimSequence> Pass;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Ball")
    TObjectPtr<class UAnimSequence> Shoot;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Contact")
    TObjectPtr<class UAnimSequence> Tackle;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Contact")
    TObjectPtr<class UAnimSequence> Intercept;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Contact")
    TObjectPtr<class UAnimSequence> ShoulderChallenge;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Animation|Goalkeeper")
    TObjectPtr<class UAnimSequence> GoalkeeperSave;
};