using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.JSInterop;

namespace BlazorDashboard.Services;

/// <summary>
/// ドックマネージャーの操作・機能を提供します。
/// </summary>
public class DockManagerHelper : IAsyncDisposable
{
    private readonly IJSRuntime _JSRuntime;

    private readonly DotNetObjectReference<DockManagerHelper> _This;

    private IJSObjectReference? _JSModule;

    private class AsyncDisposer : IAsyncDisposable
    {
        private readonly Func<ValueTask> _CallBack;
        public AsyncDisposer(Func<ValueTask> callBack) => this._CallBack = callBack;
        public ValueTask DisposeAsync() => this._CallBack.Invoke();
    }

    public DockManagerHelper(IJSRuntime jSRuntime)
    {
        this._JSRuntime = jSRuntime;
        this._This = DotNetObjectReference.Create(this);
    }

    private async ValueTask<IJSObjectReference> GetHelperJsModuleAsync()
    {
        if (this._JSModule != null) return this._JSModule;
        this._JSModule = await this._JSRuntime.InvokeAsync<IJSObjectReference>("import", "./dockmanager-helper.js");
        return this._JSModule;
    }

    /// <summary>
    /// ドックマネージャーのレイアウトを、引数に指定したレイアウト情報で復元します。
    /// </summary>
    /// <param name="selector">対象のドックマネージャーを識別する CSS セレクター</param>
    /// <param name="layoutInfo">レイアウト情報</param>
    public async ValueTask RestoreLayoutAsync(string selector, string layoutInfo)
    {
        var module = await this.GetHelperJsModuleAsync();
        await module.InvokeVoidAsync("restoreLayout", selector, layoutInfo);
    }

    /// <summary>
    /// 引数に指定したスロットの要素を、ドックマネージャーのペインとして取り付けします。
    /// </summary>
    /// <param name="selector">対象のドックマネージャーを識別する CSS セレクター</param>
    /// <param name="id">ドックマネージャーに取り付けするスロット要素の ID</param>
    /// <param name="headerText">ペインのヘッダーに表示するテキスト</param>
    public async ValueTask AttachContentPaneAsync(string selector, string id, string headerText)
    {
        var module = await this.GetHelperJsModuleAsync();
        await module.InvokeVoidAsync("attachContentPane", selector, id, headerText);
    }

    private readonly ConcurrentDictionary<string, Func<string, ValueTask>> _EventHandlers = new();

    /// <summary>
    /// ドックマネージャーが発行するイベントを購読します。
    /// </summary>
    /// <typeparam name="TArgs">イベントが発生したときに呼び出されるコールバック関数の引数の型</typeparam>
    /// <param name="selector">対象のドックマネージャーを識別する CSS セレクター</param>
    /// <param name="eventName">購読するイベントの名前</param>
    /// <param name="callBack">イベントが発生したときに呼び出されるコールバック関数</param>
    /// <returns>購読を破棄する <see cref="IAsyncDisposable"/> オブジェクト</returns>
    public async ValueTask<IAsyncDisposable> SubscribeEventAsync<TArgs>(string selector, string eventName, Func<TArgs?, ValueTask> callBack) where TArgs : class
    {
        Func<string, ValueTask> handler = typeof(TArgs) == typeof(string) ?
            (string args) => callBack.Invoke(args as TArgs) :
            (string args) => callBack.Invoke(JsonSerializer.Deserialize<TArgs>(args));
        var handlerId = Guid.NewGuid().ToString();

        var module = await this.GetHelperJsModuleAsync();
        var eventId = await module.InvokeAsync<int>("subscribeEvent", selector, eventName, handlerId, this._This, nameof(EventHandler));

        this._EventHandlers.AddOrUpdate(handlerId, handler, (_, _) => handler);

        return new AsyncDisposer(async () =>
        {
            this._EventHandlers.Remove(handlerId, out var _);
            await module.InvokeVoidAsync("unsubscribeEvent", selector, eventId);
        });
    }

    [JSInvokable]
    public async Task EventHandler(string handlerId, string args)
    {
        if (!this._EventHandlers.TryGetValue(handlerId, out var handler)) return;
        await handler.Invoke(args);
    }

    /// <summary>
    /// ドックマネージャーの layoutChange イベントの発生を購読します。
    /// </summary>
    /// <param name="selector">対象のドックマネージャーを識別する CSS セレクター</param>
    /// <param name="callBack">イベントが発生したときに呼び出されるコールバック関数</param>
    /// <returns>購読を破棄する <see cref="IAsyncDisposable"/> オブジェクト</returns>
    public ValueTask<IAsyncDisposable> SubscribeLayoutChangeEventAsync(string selector, Func<string?, ValueTask> callBack)
    {
        return this.SubscribeEventAsync(selector, "layoutChange", callBack);
    }

    /// <summary>
    /// ドックマネージャーの paneClose イベントの発生を購読します。
    /// </summary>
    /// <param name="selector">対象のドックマネージャーを識別する CSS セレクター</param>
    /// <param name="callBack">イベントが発生したときに呼び出されるコールバック関数</param>
    /// <returns>購読を破棄する <see cref="IAsyncDisposable"/> オブジェクト</returns>
    public ValueTask<IAsyncDisposable> SubscribePaneCloseEventAsync(string selector, Func<string[]?, ValueTask> callBack)
    {
        return this.SubscribeEventAsync(selector, "paneClose", callBack);
    }

    public async ValueTask DisposeAsync()
    {
        this._This.Dispose();
        if (this._JSModule != null) { await this._JSModule.DisposeAsync(); }
    }
}
