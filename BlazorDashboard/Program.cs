using BlazorDashboard;
using BlazorDashboard.Services;
using IgniteUI.Blazor.Controls;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddScoped(typeof(IIgniteUIBlazor), typeof(IgniteUIBlazor));
builder.Services.AddSingleton<DashboardService>();


await builder.Build().RunAsync();
