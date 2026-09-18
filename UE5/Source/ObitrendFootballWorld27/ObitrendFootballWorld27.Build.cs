using UnrealBuildTool;

public class ObitrendFootballWorld27 : ModuleRules
{
    public ObitrendFootballWorld27(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "InputCore",
            "EnhancedInput",
            "PhysicsCore",
            "AIModule",
            "GameplayTasks"
        });
    }
}