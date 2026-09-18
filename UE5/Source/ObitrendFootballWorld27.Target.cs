using UnrealBuildTool;
using System.Collections.Generic;

public class ObitrendFootballWorld27Target : TargetRules
{
    public ObitrendFootballWorld27Target(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_8;
        ExtraModuleNames.Add("ObitrendFootballWorld27");
    }
}