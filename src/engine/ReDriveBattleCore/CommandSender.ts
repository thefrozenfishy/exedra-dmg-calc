// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List } from "../runtime";
import type { CommandBase } from "./Command/CommandBase";

// ---- ReDriveBattleCore.CommandSender  (TypeDefIndex 368, public sealed class) ----
export class CommandSender {  // implements IObservable<IReadOnlyList<CommandBase>>
    static readonly __interfaces: readonly string[] = ['IObservable'];
    /** 0x10 private readonly List<IObserver<IReadOnlyList<CommandBase>>> observerList */
    observerList: List<any /* IObserver<IReadOnlyList<CommandBase>> */> = null!;
    /** 0x18 private readonly Queue<CommandBase> commandQueue */
    commandQueue: CommandBase[] = null!; // Queue<CommandBase>
    /** @rva 0x14936E0 slot 4  public IDisposable Subscribe(IObserver<IReadOnlyList<CommandBase>> observer) { } */
    Subscribe(observer: any /* IObserver<IReadOnlyList<CommandBase>> */): any /* IDisposable */ { return notPorted("CommandSender.Subscribe", 0x14936E0); }
    /** @rva 0x1493680  internal void StoreCommand(CommandBase commandBase) { } */
    StoreCommand(commandBase: CommandBase): void { return notPorted("CommandSender.StoreCommand", 0x1493680); }
    /** @rva 0x1493460  internal void Flush() { } */
    Flush(): void { return notPorted("CommandSender.Flush", 0x1493460); }
    /** @rva 0x14937F0  public void .ctor() { } */
    ctor(): this { return notPorted("CommandSender..ctor", 0x14937F0); }
}

// ---- ReDriveBattleCore.CommandSender.Subscription  (TypeDefIndex 367, private sealed class) ----
export class CommandSender_Subscription {  // implements IDisposable
    static readonly __interfaces: readonly string[] = ['IDisposable'];
    /** 0x10 private readonly IObserver<IReadOnlyList<CommandBase>> observer */
    observer: any /* IObserver<IReadOnlyList<CommandBase>> */ = null!;
    /** 0x18 private readonly List<IObserver<IReadOnlyList<CommandBase>>> subscribeList */
    subscribeList: List<any /* IObserver<IReadOnlyList<CommandBase>> */> = null!;
    /** @rva 0x736A60  public void .ctor(IObserver<IReadOnlyList<CommandBase>> observer, List<IObserver<IReadOnlyList<CommandBase>>> subscribeList) { } */
    ctor$IObserverIReadOnlyListCommandBase_ListIObserverIReadOnlyListCommandBase(observer: any /* IObserver<IReadOnlyList<CommandBase>> */, subscribeList: List<any /* IObserver<IReadOnlyList<CommandBase>> */>): this { return notPorted("CommandSender_Subscription..ctor", 0x736A60); }
    /** @rva 0x14A8AF0 slot 4  public void Dispose() { } */
    Dispose(): void { return notPorted("CommandSender_Subscription.Dispose", 0x14A8AF0); }
}
