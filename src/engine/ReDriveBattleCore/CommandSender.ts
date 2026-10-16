// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { listRemove } from "../runtime";
import type { List } from "../runtime";
import type { CommandBase } from "./Command/CommandBase";

// ---- ReDriveBattleCore.CommandSender  (TypeDefIndex 368, public sealed class) ----
export class CommandSender {  // implements IObservable<IReadOnlyList<CommandBase>>
    static readonly __interfaces: readonly string[] = ['IObservable'];
    /** 0x10 private readonly List<IObserver<IReadOnlyList<CommandBase>>> observerList */
    observerList: List<any /* IObserver<IReadOnlyList<CommandBase>> */> = null!;
    /** 0x18 private readonly Queue<CommandBase> commandQueue */
    commandQueue: CommandBase[] = null!; // Queue<CommandBase>
    /** @rva 0x14B9910 slot 4  public IDisposable Subscribe(IObserver<IReadOnlyList<CommandBase>> observer) { } */
    Subscribe(observer: any /* IObserver<IReadOnlyList<CommandBase>> */): any /* IDisposable */ {
        this.observerList.push(observer);
        return new CommandSender_Subscription().ctor$IObserverIReadOnlyListCommandBase_ListIObserverIReadOnlyListCommandBase(observer, this.observerList);
    }
    /** @rva 0x14B98B0  internal void StoreCommand(CommandBase commandBase) { } */
    StoreCommand(commandBase: CommandBase): void {
        this.commandQueue.push(commandBase); // Queue.Enqueue (inlined)
    }
    /** @rva 0x14B9690  internal void Flush() { } */
    Flush(): void {
        if (!(this.commandQueue.length > 0)) return;
        const commands = [...this.commandQueue]; // Queue.ToArray
        this.commandQueue.length = 0; // Queue.Clear
        for (const observer of this.observerList) observer.IObserver$OnNext(commands);
    }
    /** @rva 0x14B9A20  public void .ctor() { } */
    ctor(): this {
        this.observerList = [];
        this.commandQueue = [];
        return this;
    }
}

// ---- ReDriveBattleCore.CommandSender.Subscription  (TypeDefIndex 367, private sealed class) ----
export class CommandSender_Subscription {  // implements IDisposable
    static readonly __interfaces: readonly string[] = ['IDisposable'];
    /** 0x10 private readonly IObserver<IReadOnlyList<CommandBase>> observer */
    observer: any /* IObserver<IReadOnlyList<CommandBase>> */ = null!;
    /** 0x18 private readonly List<IObserver<IReadOnlyList<CommandBase>>> subscribeList */
    subscribeList: List<any /* IObserver<IReadOnlyList<CommandBase>> */> = null!;
    /** @rva 0x735A60  public void .ctor(IObserver<IReadOnlyList<CommandBase>> observer, List<IObserver<IReadOnlyList<CommandBase>>> subscribeList) { } */
    ctor$IObserverIReadOnlyListCommandBase_ListIObserverIReadOnlyListCommandBase(observer: any /* IObserver<IReadOnlyList<CommandBase>> */, subscribeList: List<any /* IObserver<IReadOnlyList<CommandBase>> */>): this {
        this.observer = observer;
        this.subscribeList = subscribeList;
        return this;
    }
    /** @rva 0x14CF2C0 slot 4  public void Dispose() { } */
    Dispose(): void {
        listRemove(this.subscribeList, this.observer); // List.Remove (inlined: IndexOf + RemoveAt)
    }
}
