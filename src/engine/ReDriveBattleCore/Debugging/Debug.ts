// 1:1 port of ReDriveBattleCore (game 3.19.0), written by hand (the shell generator skips this namespace).
// The game calls these delegates directly (no null check); the client sets them at startup. Here the adapter
// (src/engine/adapter) sets them, so a call with no handler throws like the game would.

// ---- ReDriveBattleCore.Debugging.Debug  (TypeDefIndex 963, public class) ----
export type Debug_OnLogDelegate = (message: string) => void;
export class Debug {
    /** 0x0 public static Debug.OnLogDelegate onLog */
    static onLog: Debug_OnLogDelegate = null!;
    /** 0x8 public static Debug.OnLogDelegate onLogWarning */
    static onLogWarning: Debug_OnLogDelegate = null!;
    /** 0x10 public static Debug.OnLogDelegate onLogError */
    static onLogError: Debug_OnLogDelegate = null!;
    /** 0x18 public static bool ForceStopLog */
    static ForceStopLog: boolean = false;
    /** @rva 0x16CFE00  [Conditional("ARIES_LOGGER")] internal static void Log(string message) { }  */
    static Log(message: string): void { if (Debug.onLog != null && !Debug.ForceStopLog) Debug.onLog(message); }
    /** @rva 0x16CFDA0  [Conditional("ARIES_LOGGER")] internal static void LogWarning(string message) { } */
    static LogWarning(message: string): void { if (Debug.onLogWarning != null && !Debug.ForceStopLog) Debug.onLogWarning(message); }
    /** @rva 0x16CFD40  [Conditional("ARIES_LOGGER")] internal static void LogError(string message) { } */
    static LogError(message: string): void { if (Debug.onLogError != null && !Debug.ForceStopLog) Debug.onLogError(message); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; }
}
